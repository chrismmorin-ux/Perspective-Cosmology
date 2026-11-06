/**
 * cwos-claims.js — session identity and work-item claims.
 *
 * THE GAP THIS CLOSES. Every queue item has carried `claimed_by` / `claimed_at` fields
 * since adoption, the session schema has carried `claimed_items` / `files_locked`, and
 * `cwos-session-recovery.js` can RELEASE a claim and detect a stale session. Nothing ever
 * ACQUIRED one — a repo-wide grep for writes to `claimed_by` found exactly one, and it is
 * the release. `/next`'s own documentation says approve "claims items"; it did not.
 *
 * The cost is not theoretical. Two Claude sessions ran concurrently in claude-poker-tracker
 * on 2026-07-29: one implementing WS-302, the other reading that session's uncommitted
 * files mid-flight and writing a research-doc section describing work that had not
 * finished, reporting a parameter value that the finished sweep contradicted. Both
 * appended to the same event log and queue index with no interlock. Nothing was lost only
 * because the overlap happened to land in documentation.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO. It does not change `status`. A `status: claimed`
 * value would flow into the queue/sprint reducers, `state/*.json`, and every candidate
 * filter, and the blast radius of that is far larger than the problem. Claims live in
 * their own fields and are advisory-with-teeth: `gate` reports them and blocks when they
 * collide, and nothing else in the pipeline has to learn a new status.
 *
 * STALENESS IS THE RELEASE VALVE. A claim from a session that stopped heartbeating is not
 * a conflict — a crashed session must never be able to permanently fence off the queue.
 * Liveness is read through `lib/session-record.js`: the tracked `sessions/<id>.yaml`
 * overlaid with the per-node `liveness/<id>.json` sidecar that `cwos-heartbeat.js`
 * maintains (WS-884). The tracked record is written at register, claim and close —
 * never per turn — so two machines no longer conflict on every pull. A session whose
 * record is missing entirely cannot be judged: the holder is treated as UNKNOWN and its
 * claim is held, not stolen.
 *
 * A RECORD FROM ANOTHER HOST IS NEVER JUDGED HERE (ADR-065, made structural by WS-884).
 * It has no local sidecar, its pid means nothing on this process table, and the only
 * fact it carries is the lifecycle its owner wrote: `status` and `ended_at`. So a
 * foreign record is live while its owner says it is, for at most FOREIGN_HOLD_DAYS from
 * `started_at` — a machine that leaves the fleet cannot fence claims forever, but a
 * machine that is merely busy is never robbed. Recovery on the owning node is what
 * closes it, every 15 minutes, and autocommit + RepoPull carry the closure.
 *
 * EVERY LIVENESS TEST IS SCOPED TO A MACHINE (WS-564). `.claude/workstream/sessions/` is
 * TRACKED, so a session record written on CM-NODE1 arrives on G16 by git pull. Until this
 * was fixed there was no `host` field at all, yet the pid and boot-time tests ran against
 * the LOCAL process table and the LOCAL `os.uptime()`. Both directions were wrong on the
 * founder's laptop + phone + dispatched-node setup: a pid collision read a dead remote
 * session as alive and fenced the queue, and — far worse — the boot-time proof declared
 * every remote session whose heartbeat predated THIS machine's last boot to be dead, which
 * on hardware that loses power routinely is the normal case. That is claim-stealing while
 * the other machine is still working. So: proofs that are only valid locally are gated on
 * `host === os.hostname()`, and a foreign (or unknown) host degrades to heartbeat-only,
 * which is the direction that costs a stale warning rather than someone's work.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  readYAMLFile, writeFileAtomic, withFileLock, patchYAMLFile, upsertYAMLScalarField,
  makeEventEmitter,
} = require('./cwos-utils');
const emitEvent = makeEventEmitter();
// ADR-043: no execSync with template literals anywhere under kit/scripts.
const { runGit } = require('./shell-safe');
const {
  SESSION_TIMEOUT_MINUTES, FOREIGN_HOLD_DAYS, IDLE_ALIVE_CAP_HOURS, activeWait,
  classifySession, recoveryWouldAct, DEFAULT_TIMEOUT_HOURS, supersededBy,
} = require('./session-liveness');
const sessionRecord = require('./session-record');
const nodeIdentity = require('./node-identity');

/**
 * A claim older than this from a non-heartbeating session is reclaimable.
 * ADR-067: unified with recovery's abandon timeout — one constant, one fact.
 * (Was a local 90; that split left items invisible to the gate at 90 min yet
 * unclearable until recovery's 4h abandon.)
 */
const STALE_MINUTES = SESSION_TIMEOUT_MINUTES;

/**
 * Approximate wall-clock ms of the last boot.
 *
 * WHY THIS EXISTS ALONGSIDE THE TIMER (WS-533). A 90-minute staleness window is a
 * guess about whether a process is alive. Boot time is a PROOF: a heartbeat written
 * before the machine booted cannot belong to a running process, so the session is
 * dead no matter how recent the timestamp looks. This matters far more here than it
 * would elsewhere — G16 loses power routinely (battery), so "crashed less than 90
 * minutes ago" is its normal state, not an edge case. Relying on the timer alone
 * meant a dead session fenced off its claims for up to 90 minutes after every crash.
 *
 * os.uptime() avoids a shell-out and behaves the same on Windows and POSIX.
 */
function bootTimeMs() {
  try { return Date.now() - (os.uptime() * 1000); } catch { return null; }
}

/** This machine's identity, as stamped on session records. Never throws. */
function localHost() {
  try { return os.hostname(); } catch { return null; }
}

/** Hostname + boot discriminator (WS-893), stamped beside `host` as `node_id`. */
function localNodeId() {
  return nodeIdentity.nodeIdentity();
}

/**
 * Was `recordHost` written by THIS machine?
 *
 * A record with no host at all is treated as foreign, not as local. That is the
 * conservative reading: records predating WS-564 carry no host, and assuming they
 * are local re-enables the boot-time test against a heartbeat that may have been
 * written on another machine — the claim-stealing direction. Records self-heal on
 * the owning machine's next heartbeat (touchSession stamps the host), so the
 * unknown case is transient by construction.
 */
function isLocalHost(recordOrHost, opts = {}) {
  const rec = (recordOrHost && typeof recordOrHost === 'object') ? recordOrHost : { host: recordOrHost };
  if (opts.host !== undefined) {
    // Injected host (tests and callers that already know the machine): the
    // plain hostname rule, as before.
    const here = opts.host;
    if (!rec.host || !here) return false;
    return String(rec.host).trim().toLowerCase() === String(here).trim().toLowerCase();
  }
  if (!rec.host) return false;
  // WS-893: hostname alone is not an identity — every cloud container is `vm`.
  // The node-identity rule adds the boot discriminator where the platform has
  // one, and is exactly the hostname compare where it does not (Windows).
  return nodeIdentity.isLocalRecord(rec);
}

/**
 * Is a recorded pid still running ON THIS MACHINE?
 *
 * signal 0 tests existence without delivering anything. EPERM means the process
 * exists but is owned by someone else — still existence. Returns null when the
 * question cannot be answered, which callers must NOT read as "dead": a missing
 * answer is exactly the fail-open shape this module warns about elsewhere.
 *
 * `recordHost` is mandatory in spirit even though it is optional in signature: a
 * pid is only meaningful against the process table that issued it. Asked about a
 * foreign host, this returns null (unknowable) rather than consulting the local
 * table, where pid 4242 belongs to something entirely unrelated. Omitting the
 * argument preserves the legacy local-only reading for callers that have already
 * established the record is local.
 */
function isPidAlive(pid, recordHost, opts = {}) {
  if (!Number.isInteger(pid) || pid <= 0) return null;
  if (recordHost !== undefined && !isLocalHost(recordHost, opts)) return null;
  try { process.kill(pid, 0); return true; }
  catch (err) {
    if (err && err.code === 'EPERM') return true;
    if (err && err.code === 'ESRCH') return false;
    return null;
  }
}

/**
 * The one question that decides recovery: is the process that OWNS this session
 * record still with us? (WS-351; restored 2026-08-13 after the 3.10.3 kit sync
 * dropped it — FIND-108.)
 *
 * → 'dead'    provably gone: pid absent from the local table, or the pid was
 *             recorded before the current boot (whatever holds that number now
 *             is a post-reboot recycle).
 * → 'live'    a process with that pid is running here, right now.
 * → 'unknown' the question is not answerable from this record on this machine.
 *
 * WHY THIS OVERRIDES THE "PID IS NEVER A DEATH TEST" RULE. That rule was written
 * against `resolveSessionId`'s pid, which is `process.pid` — the minting script,
 * gone milliseconds later. It is NOT true of the pid `cwos-session-register`
 * records, which is the Claude Code harness. The registrar dates its pid with
 * `pid_recorded_at`; only then is the field safe to read.
 *
 * THE ASYMMETRY IS STILL REAL, and 'live' is deliberately weaker than 'dead'.
 * One harness process serves several session records, so a live pid does NOT
 * prove THIS session is live — only that something is still there. Callers use
 * 'dead' as proof and 'live' as a veto on destructive action, never as a licence
 * to keep a session open past its heartbeat timeout.
 *
 * PID REUSE is handled for the case that actually happens — a reboot. A pid
 * recorded before the current boot cannot name a surviving process, so it reads
 * 'dead' no matter what the local table says. `started_at` is the stamp's
 * fallback because that is when both writers stamped the pid before the field
 * existed; records self-heal on the next SessionStart.
 *
 * HOST GATE, as everywhere else here: a pid from another machine is asked of the
 * wrong process table, so a foreign or unknown host degrades to 'unknown'.
 */
function sessionOwnerVerdict(doc, opts = {}) {
  if (!doc) return 'unknown';
  const pid = doc.pid == null ? NaN : Number(doc.pid);
  if (!Number.isInteger(pid) || pid <= 0) return 'unknown';
  if (!isLocalHost(doc, opts)) return 'unknown';

  const boot = opts.bootTimeMs !== undefined ? opts.bootTimeMs : bootTimeMs();
  if (boot != null) {
    const stamp = doc.pid_recorded_at || doc.started_at;
    const at = stamp ? Date.parse(String(stamp).replace(/^"|"$/g, '')) : NaN;
    if (!Number.isFinite(at)) return 'unknown';   // undateable pid — reuse unrulable-out
    if (at < boot) return 'dead';                 // predates the boot: gone, whoever holds it now
  }

  const alive = isPidAlive(pid, doc, opts);
  if (alive === false) return 'dead';
  if (alive === true) return 'live';
  return 'unknown';
}

/**
 * The checkout a path is standing in, normalised so two spellings of one
 * directory compare equal.
 *
 * WHY NORMALISE. On Windows the same worktree is reachable as `C:\Users\...`,
 * `c:/users/...` and `C:/Users/...` depending on who asked. A cohabitation check
 * that compares raw strings answers "no conflict" for two sessions standing in
 * the same folder, which is the single answer it must never get wrong.
 */
function normalizeWorktree(p) {
  if (!p) return null;
  let s = String(p).trim().replace(/\\/g, '/').replace(/\/+$/, '');
  // AF-4. Folding only the drive letter compared the REST with ===, so two
  // spellings of one case-insensitive Windows path (a junction, an env-var-built
  // path, a case-renamed folder) read as two directories and produced a false
  // `clear`. Windows filesystems are case-insensitive and case-preserving, so the
  // whole path folds. POSIX paths are genuinely case-sensitive and are left alone.
  if (/^[a-zA-Z]:/.test(s)) s = s.toLowerCase();
  return s || null;
}

/**
 * WS-992. The REAL directory behind a worktree path, normalised -- or null when
 * it cannot be resolved.
 *
 * WHY. `normalizeWorktree` folds case and slashes, which is string hygiene and
 * nothing more. One checkout is also reachable through a `subst` drive letter, a
 * directory junction/symlink, or a UNC share, and none of those spellings are
 * equal as strings. Two sessions in one folder reached by different spellings
 * compared unequal and got a clear verdict -- the exact collision this check
 * exists to stop. `realpathSync.native` asks the OS (on Windows,
 * GetFinalPathNameByHandle) and resolves all three.
 *
 * NULL IS NOT A PATH. A failure (directory gone, share offline, permission) means
 * we could not establish where this is, so the caller must say `unknown`, never
 * fall back to the string and risk a confident all-clear.
 *
 * `opts.realpath` is a seam for tests; production uses the native resolver.
 */
function canonicalWorktree(p, opts = {}) {
  if (!p) return null;
  const resolve = (opts && opts.realpath) || fs.realpathSync.native;
  try {
    let r = String(resolve(p));
    // Windows extended-length prefixes: //?/C:/x -> C:/x and //?/UNC/srv/share -> //srv/share.
    r = r.replace(/\\/g, '/').replace(/^\/\/\?\/UNC\//i, '//').replace(/^\/\/\?\//, '');
    return normalizeWorktree(r);
  } catch { return null; }
}

/**
 * The git checkout this process is standing in, or null if it could not be asked.
 *
 * Null is NOT "no worktree" — it is "unknown", and every caller must carry that
 * distinction forward rather than collapsing it to a clean answer.
 */
function currentWorktree(cwd = process.cwd()) {
  try {
    const r = runGit(['rev-parse', '--show-toplevel'], { cwd, timeout: 5000 });
    if (!r.ok) return null;
    return normalizeWorktree(r.stdout);
  } catch { return null; }
}

/**
 * Paths carrying uncommitted changes in a checkout.
 *
 * Returns `null` — never `[]` — when git could not be asked. An empty array is a
 * claim that the tree is CLEAN, and a check that degrades to "clean" on failure is
 * the fail-open shape this repo keeps rediscovering (`session-lanes.md`: a stale
 * claim satisfied neither branch and printed nothing).
 */
function dirtyPaths(worktreeRoot, opts = {}) {
  if (!worktreeRoot) return null;
  let r;
  try {
    r = runGit(['status', '--porcelain', '--untracked-files=normal'], {
      cwd: worktreeRoot, timeout: opts.timeout != null ? opts.timeout : 15000,
    });
  } catch { return null; }
  if (!r.ok) return null;
  const out = [];
  for (const line of String(r.stdout).split('\n')) {
    if (!line.trim()) continue;
    let p = line.slice(3);
    const arrow = p.indexOf(' -> ');   // renames: `R  old -> new`
    if (arrow !== -1) p = p.slice(arrow + 4);
    p = p.trim().replace(/^"/, '').replace(/"$/, '');
    if (p) out.push(p);
  }
  return out;
}

const POINTER = '.current-session';

const nowISO = () => new Date().toISOString();

/**
 * Read the `.current-session` pointer, if it resolves to a session file that exists.
 *
 * A DANGLING POINTER IS NOT A SESSION. The pointer in claude-poker-tracker read
 * `ses-20260726-1930-dc-lanes` for three days while `sessions/` held nothing newer than
 * seven weeks — so every consumer that trusted the pointer (heartbeat, verify's
 * hook-liveness check) silently no-opped. Validate, do not assume.
 *
 * @returns {{id: string, file: string}|null}
 */
function readSessionPointer(wsDir) {
  const ptr = path.join(wsDir, POINTER);
  if (!fs.existsSync(ptr)) return null;
  let id = '';
  try { id = fs.readFileSync(ptr, 'utf8').trim(); } catch { return null; }
  if (!id) return null;
  for (const name of [`${id}.yaml`, `session-${id}.yaml`]) {
    const file = path.join(wsDir, 'sessions', name);
    if (fs.existsSync(file)) return { id, file };
  }
  return null; // dangling
}

/**
 * Minutes since a session last proved it was alive, or Infinity when unknowable.
 */
function minutesSinceHeartbeat(sessionFile, now = Date.now()) {
  // Read through the overlay: the beat lives in the per-node sidecar (WS-884),
  // and a reader that looked only at the tracked YAML would see a heartbeat
  // frozen at registration and declare every live session dead.
  const doc = readSessionDoc(sessionFile);
  if (!doc) return Infinity;
  const status = String(doc.status || '').toLowerCase();
  if (status && status !== 'active') return Infinity; // completed/abandoned = not holding
  const beat = doc.last_heartbeat || doc.started_at;
  const t = beat ? Date.parse(String(beat).replace(/^"|"$/g, '')) : NaN;
  if (!Number.isFinite(t)) return Infinity;
  return (now - t) / 60000;
}

/** Milliseconds a foreign record's owner is trusted before the fallback release. */
const FOREIGN_HOLD_MS = FOREIGN_HOLD_DAYS * 86400000;

/**
 * Was the record's process seen beating AFTER the record was closed?
 *
 * ADR-078 decision 1 — observation outranks latch. `cwos-session-recovery`
 * writes `status: abandoned` on suspicion (a stale heartbeat); the heartbeat
 * hook of a session that is in fact still working then beats the sidecar. The
 * sidecar beat post-dating `ended_at` is direct evidence the closure was
 * wrong, and until the hook revives the record on its next Stop, this is what
 * keeps the session's claims from being handed to a second terminal.
 * Local records only: a foreign record has no sidecar to contradict anything.
 */
function beatAfterClose(doc) {
  if (!doc || doc.liveness_source !== 'sidecar') return false;
  const beat = Date.parse(String(doc.last_heartbeat || '').replace(/^"|"$/g, ''));
  const ended = Date.parse(String(doc.ended_at || '').replace(/^"|"$/g, ''));
  if (!Number.isFinite(beat)) return false;
  if (!Number.isFinite(ended)) return true;   // closed with no ended_at: the beat is the only fact
  return beat > ended;
}

/**
 * Is the session identified by `id` still holding its claims?
 *
 * Two tests (WS-533):
 *   1. HEARTBEAT PREDATES LAST BOOT -> dead, definitively. No process survives a
 *      reboot, so this outranks any timer. On a machine that loses power routinely
 *      this is the common case, and the 90-minute timer alone got it wrong: a dead
 *      session fenced off its claims for up to 90 minutes after every crash.
 *      APPLIES ONLY TO SESSIONS RECORDED ON THIS HOST (WS-564). `sessions/` is a
 *      tracked directory, so records arrive from other machines by git pull, and
 *      "predates MY last boot" says nothing whatever about a process on CM-NODE1.
 *      Applying it anyway declared live remote sessions dead and released their
 *      claims mid-work.
 *   2. Otherwise, the staleness window.
 *
 * PID DEATH IS NOW TEST (0), AND IT OUTRANKS BOTH (WS-351). This used to say pid
 * liveness could never be a death test, because the recorded pid was a short-lived
 * hook. That was true of one of the two writers and false of the other, and the
 * field meant different things depending on which had written it — see
 * `sessionOwnerVerdict`, where the reasoning and the fix at the source now live.
 * With the writers made honest, a dead pid is the strongest death proof available:
 * it does not wait for a timer, so a crashed session stops fencing its claims the
 * moment the next hook fires rather than up to `staleMinutes` later.
 *
 * The asymmetry that produced the old rule is unchanged and still respected: a LIVE
 * pid buys nothing here. It cannot extend a session past its heartbeat window,
 * because one harness pid serves several session records and a stale record sharing
 * a live pid would otherwise read as a peer forever.
 */
function isSessionLive(wsDir, id, staleMinutes = STALE_MINUTES, now = Date.now(), opts = {}) {
  if (!id) return false;
  for (const name of [`${id}.yaml`, `session-${id}.yaml`]) {
    const file = path.join(wsDir, 'sessions', name);
    if (!fs.existsSync(file)) continue;

    const doc = readSessionDoc(file);
    if (!doc) return false;
    const status = String(doc.status || '').toLowerCase();
    const local = isLocalHost(doc, opts);
    const explicitlyForeign = !!doc.host && !local;

    if (status && status !== 'active') {
      // ADR-078 (1): a closed record contradicted by a later local beat is live.
      // `completed` is a decision /session-end made on purpose and stays closed.
      if (status === 'abandoned' && local && beatAfterClose(doc)
          && sessionOwnerVerdict(doc, opts) !== 'dead') return true;
      // WS-890: a /clear ghost's record is closed, its claims are not freed.
      // Every node, not only the owner: see supersededHoldActive.
      if (supersededHoldActive(doc, { ...opts, now, staleMinutes })) return true;
      return false;
    }

    // A RECORD FROM ANOTHER MACHINE (WS-884). No sidecar, no pid, no boot time
    // of ours applies. The owner's lifecycle write is the only evidence, so:
    // live while it says active, until the fallback hold runs out.
    if (explicitlyForeign) {
      if (doc.ended_at && String(doc.ended_at) !== 'null') return false;
      const started = Date.parse(String(doc.started_at || '').replace(/^"|"$/g, ''));
      if (!Number.isFinite(started)) return true;   // undateable: hold, never steal on a guess
      return (now - started) <= FOREIGN_HOLD_MS;
    }

    const owner = sessionOwnerVerdict(doc, opts);
    if (owner === 'dead') return false;                                          // (0)
    // WS-1294: the process lives, but Claude Code says it now runs a different
    // conversation (/clear, /resume). Proof, like (0), after a short grace.
    if (local && owner === 'live' && supersededBy(doc, { ...opts, nowMs: now })) return false;

    if (local) {
      const boot = opts.bootTimeMs !== undefined ? opts.bootTimeMs : bootTimeMs();
      const beat = doc.last_heartbeat || doc.started_at;
      const beatMs = beat ? Date.parse(String(beat).replace(/^"|"$/g, '')) : NaN;
      if (Number.isFinite(beatMs) && boot != null && beatMs < boot) return false; // (1)
      // WS-1073: a session waiting on the founder cannot beat; it holds for
      // WAITING_HOLD_HOURS from when the wait began, not for the 4h timeout.
      if (activeWait(doc, now)) return true;
    }

    return minutesSinceHeartbeat(file, now) <= staleMinutes;                     // (2)
  }
  // No record at all. This used to read "dead by definition", and it is the
  // reading that let a claim be stolen from a session whose record simply had
  // not been pulled yet (WS-884 review, M3). Absence is UNKNOWN: hold, on the
  // same terms as a foreign record — the owner's word (here, the claim's own
  // date) for FOREIGN_HOLD_DAYS, then the fallback release. Callers that know
  // when the claim was written pass `claimedAt`; without it the hold is
  // indefinite unless `missingIsDead` asserts independent proof.
  if (opts.missingIsDead === true) return false;
  const claimedAt = opts.claimedAt ? Date.parse(String(opts.claimedAt).replace(/^"|"$/g, '')) : NaN;
  if (Number.isFinite(claimedAt)) return (now - claimedAt) <= FOREIGN_HOLD_MS;
  return true;
}

/**
 * One session document: the tracked YAML with its per-node sidecar overlaid.
 *
 * Every reader in this module goes through here, so the overlay is applied
 * once. `readYAMLFile` returns a {ok, data, warnings} WRAPPER — reading
 * `.status` off the wrapper yields undefined, lands every record on the
 * not-live branch, and reports "all clear" while doing nothing; the unwrap
 * lives in session-record.parseRecord.
 */
function readSessionDoc(file) {
  return sessionRecord.loadSession(null, file);
}

/**
 * Every session that currently reads as live, excluding `selfId`.
 *
 * This is the answer to "is another session working in this repo right now?" — the
 * question that took 40 minutes to answer from mtimes and a process list during the
 * 2026-07-26 incident.
 */
function listLiveSessions(wsDir, selfId = null, opts = {}) {
  const sessDir = path.join(wsDir, 'sessions');
  let files = [];
  try { files = fs.readdirSync(sessDir).filter((f) => f.endsWith('.yaml')); } catch { return []; }

  // WS-890: a /clear ghost is not a peer. /clear keeps the OS process and
  // starts a new conversation, so every record from before the clear shares
  // our pid and checkout and reads ALIVE — and the gate blocked pc2 on
  // checkout-shared seven times over its own predecessors (2026-09-24..10-01).
  // Judged only when the asker IS that process (CLAUDE_PID matches its own
  // record) and the process can host only one conversation (terminal CLI,
  // whatever CLAUDE_CODE_CHILD_SESSION says — WS-1226); a sweep or a
  // desktop-app reader filters nothing. Read-only: it hides the ghost from
  // this asker's peer list and writes nothing, so a wrong reading costs one
  // gate answer, never a record or a claim.
  let selfDoc = null;
  if (selfId && processHostsOneConversation()) {
    try {
      const d = readSessionDoc(sessionRecord.sessionFileFor(wsDir, selfId) || '');
      if (d && harnessPid() !== undefined && Number(d.pid) === harnessPid()) selfDoc = d;
    } catch { /* no self record: filter nothing */ }
  }

  const out = [];
  for (const f of files) {
    const doc = readSessionDoc(path.join(sessDir, f));
    if (!doc || String(doc.status || '').toLowerCase() !== 'active') continue;
    const id = doc.id || f.replace(/\.yaml$/, '');
    if (selfId && id === selfId) continue;
    if (selfDoc && isSupersededBy(doc, selfDoc, { ...opts, now: opts.now || Date.now(), graceMs: SUPERSEDE_GRACE_MS })) continue;
    if (!isSessionLive(wsDir, id, opts.staleMinutes || STALE_MINUTES, opts.now || Date.now(), opts)) continue;
    // WS-1226: a record that is a ghost in every way but the grace window (our pid and
    // checkout, another conversation, silent since we began) says so, with the moment the
    // window closes, so a block after /clear explains itself instead of reading as a peer.
    const priorLiftsAt = selfDoc && !activeWait(doc, opts.now || Date.now())
      && isSupersededBy(doc, selfDoc, { ...opts, now: Number.MAX_SAFE_INTEGER, graceMs: SUPERSEDE_GRACE_MS })
      ? new Date(parseStamp(doc.last_heartbeat || doc.started_at) + SUPERSEDE_GRACE_MS).toISOString() : null;
    out.push({
      id,
      ...(priorLiftsAt ? { same_process_prior: true, lifts_at: priorLiftsAt } : {}),
      pid: doc.pid != null ? Number(doc.pid) : null,
      host: doc.host || null,
      foreign_host: !isLocalHost(doc, opts),
      // Where this peer is standing. null means UNKNOWN, never 'not here'.
      worktree: normalizeWorktree(doc.worktree),
      last_heartbeat: doc.last_heartbeat || null,
      claimed_items: Array.isArray(doc.claimed_items) ? doc.claimed_items : [],
      files_locked: Array.isArray(doc.files_locked) ? doc.files_locked : [],
      mode: doc.mode || null,
      waiting_on_founder: activeWait(doc, opts.now || Date.now()),
    });
  }
  return out;
}

/**
 * One line saying a holder is waiting on the founder, or '' when it is not
 * (WS-1073). An adopter must be told the previous holder has a plan pending
 * approval — on 2026-10-10 nothing said so, and both sessions built it.
 */
function waitingNote(wsDir, id, now = Date.now()) {
  try {
    const wait = activeWait(readSessionDoc(sessionRecord.sessionFileFor(wsDir, id) || ''), now);
    if (!wait) return '';
    return ` It is waiting on the founder (${wait.kind === 'question' ? 'question pending' : 'plan pending'} since ${wait.since}).`;
  } catch { return ''; }
}

/**
 * Records that SAY `status: active` but have not heartbeated inside `staleMinutes`.
 *
 * This is the population that makes every concurrency signal unusable in both
 * directions (WS-564). Heartbeat-trusting checks read them as absent and hand out a
 * confident all-clear; heartbeat-independent checks count them and fence the queue
 * forever. claude-poker-tracker held eight of these from 2026-07-30, several holding
 * claims, while `cwos-session-recovery` had not run since. Neither reading is usable
 * — so the population itself has to be surfaced rather than silently interpreted.
 */
// The same abandon timeout `cwos-session-recovery --auto` applies (config.yaml
// session_abandon_timeout_hours, default DEFAULT_TIMEOUT_HOURS), so the advice
// "recovery would close this" agrees with what recovery then does (WS-1017).
function abandonTimeoutHours(wsDir) {
  const { ok, data } = readYAMLFile(path.join(wsDir, 'config.yaml')) || {};
  const val = ok && data ? data.session_abandon_timeout_hours : undefined;
  const num = typeof val === 'number' ? val : parseFloat(val);
  return Number.isFinite(num) && num > 0 ? num : DEFAULT_TIMEOUT_HOURS;
}

function staleActiveSessions(wsDir, opts = {}) {
  const staleMinutes = opts.staleMinutes || STALE_MINUTES;
  const now = opts.now || Date.now();
  const sessDir = path.join(wsDir, 'sessions');
  let files = [];
  try { files = fs.readdirSync(sessDir).filter((f) => f.endsWith('.yaml')); } catch { return []; }

  const out = [];
  for (const f of files) {
    const doc = readSessionDoc(path.join(sessDir, f));
    if (!doc || String(doc.status || '').toLowerCase() !== 'active') continue;
    const id = doc.id || f.replace(/\.yaml$/, '');
    if (opts.selfId && id === opts.selfId) continue;
    // A record from another host cannot heartbeat here (WS-884): its beat is
    // in that machine's sidecar. Not stale — UNKNOWN, and judged by its owner.
    if (doc.host && !isLocalHost(doc, opts)) continue;
    const mins = minutesSinceHeartbeat(path.join(sessDir, f), now);
    if (mins <= staleMinutes) continue;
    // WS-1017: "stale" here means "stopped beating"; whether `recovery --auto`
    // would CLOSE it is a different question (a verified-alive idle pid is
    // vetoed until IDLE_ALIVE_CAP_HOURS), and advice to run recovery is only
    // honest for the records where the answer is yes.
    const timeoutHours = opts.timeoutHours || abandonTimeoutHours(wsDir);
    const verdict = classifySession(doc, { timeoutHours, nowMs: now, bootMs: opts.bootMs });
    const wouldAct = recoveryWouldAct(verdict, { timeoutHours });
    let clearsInHours = null;
    if (!wouldAct && verdict.age_hours !== null && /verified running/.test(verdict.reason || '')) {
      clearsInHours = Math.max(0, Math.round((IDLE_ALIVE_CAP_HOURS - verdict.age_hours) * 10) / 10);
    }
    out.push({
      id,
      host: doc.host || null,
      last_heartbeat: doc.last_heartbeat || null,
      minutes_stale: Number.isFinite(mins) ? Math.round(mins) : null,
      claimed_items: Array.isArray(doc.claimed_items) ? doc.claimed_items : [],
      recovery_would_act: wouldAct,
      recovery_reason: verdict.reason,
      // Hours until recovery --auto would close it, when that is knowable
      // (the idle-alive veto lifts at the cap); null when recovery acts now or
      // the hold has no fixed end (e.g. waiting on the founder).
      recovery_clears_in_hours: clearsInHours,
    });
  }
  return out;
}

/**
 * Is the registry itself trustworthy, or is it silently dead? (WS-533 item 4)
 *
 * A registry that stops recording reports "no other session" when it means "no
 * data", and that is strictly worse than having none — it converts absence of
 * evidence into an all-clear. This is the same failure class .hooks-liveness.yaml
 * tracks for hooks, and it is what let the registry rot unnoticed from 2026-05-15
 * to 2026-07-26.
 *
 * TWO QUESTIONS, NOT ONE (WS-564). The original check asked only "is REGISTRATION
 * happening", over a 14-day window. In claude-poker-tracker on 2026-08-02 that
 * answered yes — sessions were registering fine — while the Stop hook that advances
 * `last_heartbeat` had been dead for two days. So `isSessionLive` filtered every
 * peer out as not-live, `listLiveSessions` returned [], and this function said
 * ok:true. Three sessions were concurrently editing the repo. Both green, both
 * wrong, and the all-clear propagated into `/next`'s conflict gate.
 *
 * Registration recency and heartbeat currency are independent failures and are now
 * measured separately. A registry can only be believed when BOTH hold: records are
 * being created, and the active ones are proving they are still alive.
 *
 * @returns {{ok, reason, active_count, stale_active, newest_record_age_days,
 *            heartbeat_age_minutes}}
 */
function registryHealth(wsDir, opts = {}) {
  const base = {
    active_count: 0, stale_active: [], newest_record_age_days: null, heartbeat_age_minutes: null,
  };
  const sessDir = path.join(wsDir, 'sessions');
  if (!fs.existsSync(sessDir)) {
    return { ...base, ok: false, reason: 'no sessions/ directory — nothing has ever registered' };
  }
  let files = [];
  try { files = fs.readdirSync(sessDir).filter((f) => f.endsWith('.yaml')); } catch {
    return { ...base, ok: false, reason: 'sessions/ is unreadable' };
  }
  if (files.length === 0) {
    return { ...base, ok: false, reason: 'sessions/ is empty — registration is not happening' };
  }

  const now = opts.now || Date.now();

  // Newest record by heartbeat/start. If the freshest entry is ancient, the
  // registry is not being fed even though files exist.
  let newest = 0;
  let newestBeat = 0;
  let activeCount = 0;
  let localActiveCount = 0;
  for (const f of files) {
    const doc = readSessionDoc(path.join(sessDir, f));
    if (!doc) continue;
    const t = Date.parse(String(doc.last_heartbeat || doc.started_at || '').replace(/^"|"$/g, ''));
    if (Number.isFinite(t) && t > newest) newest = t;
    if (String(doc.status || '').toLowerCase() !== 'active') continue;
    activeCount++;
    // Heartbeat currency is a question about THIS machine's Stop hook, so it is
    // asked only of records this machine owns (WS-884). A foreign record's beat
    // lives in the other node's sidecar; counting its absence here would read
    // "the hook has never run" on every idle node whose peer is busy.
    if (doc.host && !isLocalHost(doc, opts)) continue;
    localActiveCount++;
    // Heartbeat currency is asked of `last_heartbeat` ALONE. Falling back to
    // started_at here would let a freshly-registered session that never beats
    // again certify the hook as working — the exact substitution that made the
    // 14-day window read healthy while the hook was dead.
    const hb = Date.parse(String(doc.last_heartbeat || '').replace(/^"|"$/g, ''));
    if (Number.isFinite(hb) && hb > newestBeat) newestBeat = hb;
  }
  if (!newest) return { ...base, ok: false, reason: 'no session record carries a usable timestamp' };

  const out = {
    ...base,
    active_count: activeCount,
    local_active_count: localActiveCount,
    stale_active: staleActiveSessions(wsDir, opts).map((s) => s.id),
    newest_record_age_days: (now - newest) / 86400000,
    heartbeat_age_minutes: newestBeat ? (now - newestBeat) / 60000 : null,
  };

  const maxAgeDays = opts.maxAgeDays != null ? opts.maxAgeDays : 14;
  if (out.newest_record_age_days > maxAgeDays) {
    return {
      ...out,
      ok: false,
      reason: `newest session record is ${Math.floor(out.newest_record_age_days)}d old (max ${maxAgeDays}d) — `
            + 'registration has stopped; treat "no other session" as UNKNOWN, not all-clear',
    };
  }

  // Currency is only a question when something claims to be active. A repo whose
  // sessions have all been closed properly has nothing to keep current.
  const maxBeatMinutes = opts.maxHeartbeatMinutes != null ? opts.maxHeartbeatMinutes : 120;
  if (localActiveCount > 0) {
    if (out.heartbeat_age_minutes == null) {
      return {
        ...out,
        ok: false,
        reason: `${localActiveCount} session(s) marked active on this host and not one carries a last_heartbeat — `
              + 'the Stop hook has never run here; liveness is UNKNOWN, not all-clear',
      };
    }
    if (out.heartbeat_age_minutes > maxBeatMinutes) {
      return {
        ...out,
        ok: false,
        reason: `${localActiveCount} session(s) marked active on this host, freshest heartbeat is `
              + `${Math.floor(out.heartbeat_age_minutes / 60)}h${Math.floor(out.heartbeat_age_minutes % 60)}m old `
              + `(max ${maxBeatMinutes}m) — the Stop hook is not advancing liveness, so every peer `
              + 'filters out as not-live and "no conflicts" means UNKNOWN, not none',
      };
    }
  }

  return { ...out, ok: true, reason: null };
}

/**
 * The harness's id for the session this process belongs to, if discoverable.
 *
 * Claude Code exports `CLAUDE_CODE_SESSION_ID` into every subprocess it spawns, so any
 * script the AI runs through Bash can identify its OWN session without a hook payload.
 */
function agentSessionIdFromEnv() {
  const v = process.env.CLAUDE_CODE_SESSION_ID;
  return v && String(v).trim() ? String(v).trim() : null;
}

/** The registry record whose `agent_session_id` matches, or null. */
function findByAgentSessionId(wsDir, agentId) {
  if (!agentId) return null;
  const sessDir = path.join(wsDir, 'sessions');
  let files = [];
  try { files = fs.readdirSync(sessDir).filter((f) => f.endsWith('.yaml')); } catch { return null; }
  for (const f of files) {
    const doc = readSessionDoc(path.join(sessDir, f));
    if (doc && String(doc.agent_session_id || '') === String(agentId)) {
      return { id: doc.id || f.replace(/\.yaml$/, ''), file: path.join(sessDir, f) };
    }
  }
  return null;
}

/**
 * Resolve this process's session id, minting one when nothing else identifies it.
 *
 * RESOLUTION ORDER, and why it is not just the pointer (WS-533):
 *   1. `CLAUDE_CODE_SESSION_ID` matched against the registry. This is the only source
 *      that is CORRECT UNDER CONCURRENCY. `.current-session` holds exactly one id, so
 *      with two live sessions it names whichever registered last — and a claim written
 *      under the pointer would be attributed to the OTHER session, silently making the
 *      conflict detector believe the wrong thing about who holds what.
 *   2. The pointer, for single-session repos and for records predating this field.
 *   3. Mint, so a session in a context where no hook ran (headless `claude -p`,
 *      /fleet-run) still has an identity to claim under rather than falling back to the
 *      no-identity behaviour that produced the collision this module exists to prevent.
 *
 * Minting writes a MINIMAL session YAML — enough for liveness and claim ownership, in the
 * same shape `/session-end` and `cwos-session-recovery` already read. It is deliberately
 * not a substitute for `/session-start`'s richer record.
 */
function resolveSessionId(wsDir, {
  create = true, clock = null, agentId: agentIdOverride = null, pointer = true,
} = {}) {
  // A hook process is handed the harness id on stdin rather than in the environment;
  // it passes that in here so there is ONE resolver instead of a second, subtly
  // different copy per hook. cwos-heartbeat.js had such a copy and fell through to
  // the pointer, which is why it beat the wrong session under concurrency (WS-564).
  const agentId = agentIdOverride || agentSessionIdFromEnv();
  const mine = findByAgentSessionId(wsDir, agentId);
  if (mine) return mine.id;

  // Only trust the shared pointer when this process has no identity of its own;
  // with an agentId in hand, an unmatched pointer means the pointer belongs to a
  // DIFFERENT session and adopting it would misattribute every claim we write.
  if (!agentId) {
    const existing = readSessionPointer(wsDir);
    if (existing) return existing.id;
  }
  if (!create) return null;

  const ts = (clock ? new Date(clock) : new Date()).toISOString();
  const stamp = ts.slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
  // Suffix from the harness id, not "auto": two sessions minting in the same minute
  // would otherwise derive the SAME id, write to the same file, and each believe it
  // owned the other's claims.
  const suffix = agentId ? String(agentId).replace(/[^A-Za-z0-9]/g, '').slice(0, 8) : 'auto';
  const id = `ses-${stamp}-${suffix}`;
  const sessionsDir = path.join(wsDir, 'sessions');
  try { fs.mkdirSync(sessionsDir, { recursive: true }); } catch { /* exists */ }

  const file = path.join(sessionsDir, `${id}.yaml`);
  if (!fs.existsSync(file)) {
    const mintPid = harnessPid();
    // THE TRACKED HALF (WS-884). Only what another machine needs: identity,
    // lifecycle, owner host, the harness join key, and the claim lists. The
    // per-turn fields — heartbeat, pid, worktree — go in the sidecar below, so
    // this file is written now and at close, never in between.
    writeFileAtomic(file, [
      `id: "${id}"`,
      'status: active',
      `started_at: "${ts}"`,
      'ended_at: null',
      'mode: auto',
      // The machine that owns this record. Without it, every pid and boot-time
      // test on a git-synced session file is asked of the wrong process table
      // (WS-564). A record naming another host is never judged here (ADR-065).
      `host: "${localHost() || ''}"`,
      // WS-893: hostname is not an identity (every cloud container is `vm`);
      // the boot-qualified node id is what tells two containers apart.
      `node_id: "${localNodeId() || ''}"`,
      // Written so the NEXT invocation finds this record by identity instead of
      // minting a second one for the same session.
      `agent_session_id: "${agentId || ''}"`,
      '',
      '# Minted by cwos-claims because no registered session matched this process.',
      '# A session that never ran /session-start still needs an identity to claim under.',
      '# Liveness (heartbeat, pid, worktree) lives in liveness/<id>.json on the owning',
      '# node — per-node and untracked (WS-884). This file changes at claim and close.',
      'claimed_items: []',
      'files_locked: []',
      '',
    ].join('\n'));
    // THE PER-NODE HALF. CLAUDE_PID is the actual Claude process; process.pid
    // here is this short-lived script. WHERE this session is standing matters
    // too: without it a peer holding uncommitted work in a shared checkout is
    // indistinguishable from no peer at all (the 2026-08-26 near-miss).
    sessionRecord.writeLiveness(wsDir, id, {
      last_heartbeat: ts,
      pid: mintPid,
      pid_recorded_at: mintPid === undefined ? undefined : ts,
      worktree: currentWorktree() || '',
      host: localHost() || '',
      node_id: localNodeId() || '',
    }, { ownerLabel: 'claims:mint' });
    // NO automatic /clear-ghost closure here (WS-890, scope cut 2026-10-13).
    // Closing a predecessor record on a pid+worktree+ordering inference was
    // shown three times to reach a live session or its claims (another node's
    // recovery, an archived older conversation, a background subagent that
    // outlives /clear). The gate instead ignores its OWN ghosts read-only
    // (listLiveSessions); a record is closed only by hand (recovery --close).
  }
  // Best-effort legacy pointer. Not the identity of record: it holds one id and
  // cannot represent concurrent sessions.
  //
  // `pointer: false` exists for CROSS-REPO minting (WS-564 follow-up). A session
  // whose cwd is repo A can edit files in repo B — the founder's normal pattern —
  // and B's registry should learn about it. But repointing B's `.current-session`
  // at a session that merely touched one file would be a genuinely wrong claim
  // about who is working there, and the pointer's remaining consumers read it as
  // "the session in this repo". Register the identity, leave the pointer alone.
  if (pointer) {
    try { writeFileAtomic(path.join(wsDir, POINTER), id); } catch { /* non-fatal */ }
  }
  return id;
}

/**
 * The Claude process id from the harness, or undefined when it is not known.
 *
 * NEVER `process.pid` (WS-890 / friction c898d036d4). Every writer used to fall
 * back to it, and `process.pid` is the short-lived script doing the writing:
 * `node kit/scripts/cwos-heartbeat.js` run by hand from a tool shell stamped
 * its own pid, which died at once; the session then read DEAD_PID — proof of
 * death, acted on with no timeout — and a peer's recovery released its claims
 * mid-work. An absent pid is merely unverifiable (the timeout governs); a
 * wrong pid is a false proof. So without CLAUDE_PID, nothing is stamped and
 * whatever pid the record already carries stands.
 */
function harnessPid() {
  const n = Number(process.env.CLAUDE_PID);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

/**
 * May THIS process vouch that one OS process hosts one conversation at a time?
 *
 * The /clear-ghost rule below rests on that: an older conversation sharing our
 * pid and checkout is a predecessor, not a peer. It holds for the terminal CLI
 * (`CLAUDE_CODE_ENTRYPOINT=cli`). It does NOT hold for the desktop app, whose
 * conversations share one harness pid concurrently (WS-973). An unset
 * entrypoint is unknown, and unknown never closes anything.
 *
 * NOT CLAUDE_CODE_CHILD_SESSION (WS-1226). This used to return false when it
 * was "1", read as "an SDK child inside its parent's process". Measured
 * 2026-10-21 and 2026-11-04: the terminal CLI sets it on EVERY Bash-tool
 * command of the top-level conversation, and a subagent's Bash tool carries
 * the same value with the PARENT's CLAUDE_CODE_SESSION_ID and CLAUDE_PID. So
 * in the CLI it separates nothing, and the clause disabled the ghost filter
 * and `--close` everywhere they are ever run (every /clear then /next
 * hard-blocked on checkout-shared). A subagent resolves to its parent's own
 * record, so it can only ever judge from the parent's place. What separates a
 * ghost from a peer is the record pair itself: same pid, same worktree, a
 * different conversation id, and the grace rule (isSupersededBy).
 */
function processHostsOneConversation() {
  return String(process.env.CLAUDE_CODE_ENTRYPOINT || '').trim().toLowerCase() === 'cli';
}

function parseStamp(v) {
  const t = v ? Date.parse(String(v).replace(/^"|"$/g, '')) : NaN;
  return Number.isFinite(t) ? t : NaN;
}

/**
 * Is `prior` a /clear ghost of `successor` (WS-736, made live by WS-890)?
 *
 * ALL must hold:
 *   both records on THIS host            a foreign record is never judged here
 *   same pid, recorded (an integer > 0)  one process
 *   same worktree, both recorded         one checkout (desktop worktrees differ)
 *   successor has a harness id and the   different conversations — a resume
 *     two ids differ                     of the same one is not a predecessor
 *   prior still `active`
 *   prior is not waiting on the founder  WS-1073's hold outranks inference
 *   prior's last beat <= sinceMs         it stopped before the successor began;
 *     (default: successor.started_at)    a peer still beating is not a ghost
 *
 *   ...by at least opts.graceMs          (default 0) — see SUPERSEDE_GRACE_MS
 *
 * Pure: reads two documents, writes nothing. Whether the CALLER may act on a
 * true answer (processHostsOneConversation) is the caller's question.
 */
function isSupersededBy(prior, successor, opts = {}) {
  if (!prior || !successor) return false;
  if (prior.id && successor.id && String(prior.id) === String(successor.id)) return false;
  if (String(prior.status || '').toLowerCase() !== 'active') return false;
  if (!isLocalHost(prior, opts) || !isLocalHost(successor, opts)) return false;
  const pid = Number(successor.pid);
  if (!Number.isInteger(pid) || pid <= 0 || Number(prior.pid) !== pid) return false;
  const mine = normalizeWorktree(successor.worktree);
  if (!mine || normalizeWorktree(prior.worktree) !== mine) return false;
  const theirs = String(successor.agent_session_id || '');
  if (!theirs || String(prior.agent_session_id || '') === theirs) return false;
  const now = opts.now !== undefined ? opts.now : Date.now();
  if (activeWait(prior, now)) return false;
  const beatMs = parseStamp(prior.last_heartbeat || prior.started_at);
  const sinceMs = Number.isFinite(opts.sinceMs) ? opts.sinceMs : parseStamp(successor.started_at);
  const graceMs = Number.isFinite(opts.graceMs) && opts.graceMs > 0 ? opts.graceMs : 0;
  // Two separate facts (WS-1226 inspection, defect A): the prior has not beaten since the
  // successor began, AND it has been silent for the grace window as of NOW. The grace used to be
  // measured against the successor's start, a fixed stamp, so once register ran on `clear` (start
  // = the moment of /clear) a founder who worked until a few minutes before /clear stayed blocked
  // until the 4 h timeout. Measured from now, the block lifts 10 min after the ghost's last beat,
  // and a peer that beat inside the last 10 min is still never a ghost.
  return Number.isFinite(beatMs) && Number.isFinite(sinceMs) && Number.isFinite(now)
    && beatMs <= sinceMs && beatMs <= now - graceMs;
}

/**
 * THE GRACE RULE for judging a /clear ghost (WS-890 review).
 *
 * A record counts as a superseded ghost only if its last beat predates the
 * successor's start AND is MORE than 10 minutes old now (WS-1226: measured
 * from now, so the block lifts by itself) -- the PostToolUse heartbeat's
 * min-interval (`--min-interval-minutes 10`), i.e. the longest a working
 * session normally goes between beats. Inside that window the pid match is
 * not trusted: a recycled pid, or one wrongly stamped by a hand-run beat,
 * would otherwise make a peer that beat seconds ago read as a ghost.
 *
 * Used by the read-only gate filter (listLiveSessions) and by the manual
 * `cwos-session-recovery --close`. Nothing closes a ghost automatically: that
 * was removed after it reached live sessions and their claims three ways.
 */
const SUPERSEDE_GRACE_MS = 10 * 60000;

/** Was this record closed as a /clear ghost (recovery_reason superseded-by-…)? */
function isSupersededClosure(doc) {
  if (!doc || String(doc.status || '').toLowerCase() !== 'abandoned') return false;
  return /^["']?superseded-by-/.test(String(doc.recovery_reason || ''));
}

/**
 * Does a superseded ghost still HOLD its claims (WS-890 review, round 3)?
 *
 * HOLD, NOT TRANSFER, and why. Claude Code lets a background subagent outlive
 * /clear and still record its outcome, so work may still be running under the
 * ghost's claims. Transferring them to the successor would hand a fresh
 * conversation items it never saw, under an identity that did not do the
 * work, and cwos-lease-check would then defend them on its behalf. Holding
 * keeps the attribution true and ends the same way every other suspicion
 * does: the claims stay fenced until the process is PROVEN gone (dead pid,
 * pre-boot stamp) or the normal abandon timeout has run from the ghost's last
 * beat (its `ended_at` when the beat is unknown) on the owner node, and
 * ended_at + the timeout on every other node.
 */
function supersededHoldActive(doc, opts = {}) {
  if (!isSupersededClosure(doc)) return false;
  const now = opts.now !== undefined ? opts.now : Date.now();
  const staleMinutes = Number.isFinite(opts.staleMinutes) ? opts.staleMinutes : STALE_MINUTES;
  // EVERY NODE holds it (WS-890 review, round 4). sessions/ is tracked, so the
  // closed record reaches the other node by pull, where it has no sidecar and
  // no judgeable pid. There the only fact is the closure itself: held until
  // ended_at + the abandon timeout. (Undateable: hold.)
  if (!isLocalHost(doc, opts)) {
    const ended = parseStamp(doc.ended_at);
    return !Number.isFinite(ended) || (now - ended) <= staleMinutes * 60000;
  }
  // The owner node: proof of death releases; otherwise the timeout from the
  // ghost's last beat.
  if (sessionOwnerVerdict(doc, opts) === 'dead') return false;
  let beat = parseStamp(doc.last_heartbeat);
  if (!Number.isFinite(beat)) beat = parseStamp(doc.ended_at);
  if (!Number.isFinite(beat)) return true;   // undateable: hold, never release on a guess
  return (now - beat) <= staleMinutes * 60000;
}


/**
 * Touch `last_heartbeat` so this session reads as live to everyone else.
 *
 * Stamps `host` in the same write. The process doing the touching is, by
 * definition, running on the machine that owns the session, so this is the one
 * place the host can be established without guessing — and it makes the field
 * self-healing for records minted before WS-564 and for a repo that has just been
 * pulled onto a different machine.
 *
 * @returns {boolean} whether a record was actually advanced. Callers that treat a
 * no-op as success are how a liveness stamp outlives the liveness it certifies.
 */
/**
 * May a HAND-RUN (no harness hook payload) write `pid` onto record `id`?
 * Returns null when it may, else the reason it may not (WS-890 review, r5).
 *
 * THE ONE RULE for the one place pids are written. A hand-run names its
 * session by --session-id or an environment that may belong to someone else,
 * so it may claim a record's process only when no other process can be
 * claiming it:
 *   (i)   the record has no recorded pid AND isSessionLive reads it not live
 *   (ii)  the recorded pid IS our pid
 *   (iii) the recorded pid is provably dead on THIS host
 * Everything else is refused. Stamping our pid over a live peer's makes the
 * peer read DEAD_PID the moment we exit, and recovery then releases its
 * claims. Judged on the record AS READ, before any write — touchSession's
 * host-heal must not turn a hostless record "local" and make (iii) pass.
 * Hook-driven writes never come here: the payload is the harness saying
 * whose conversation this is.
 */
function handRunPidRefusal(wsDir, id, pid, opts = {}) {
  const ours = Number(pid);
  if (!(ours > 0)) return null;                      // no pid to write: nothing to overwrite
  const file = sessionRecord.sessionFileFor(wsDir, id);
  const doc = file ? readSessionDoc(file) : null;
  if (!doc) return `no readable record for ${id}`;
  const recorded = Number(doc.pid);
  if (!(Number.isInteger(recorded) && recorded > 0)) {
    let live = true;
    try { live = isSessionLive(wsDir, id, STALE_MINUTES, Date.now(), opts); } catch { live = true; }
    return live ? `${id} has no recorded pid but reads live (fresh heartbeat), so it may be another process's` : null;   // (i)
  }
  if (recorded === ours) return null;                 // (ii)
  const local = Boolean(doc.host) && isLocalHost(doc, opts);
  if (local && isPidAlive(recorded) === false) return null; // (iii)
  return `${id} is recorded to process ${recorded}${local ? ' (running)' : ' (not judgeable from here)'}, not this one (${ours})`;
}

function touchSession(wsDir, id, clock = null, opts = {}) {
  if (!id) return false;
  const beatAt = (clock ? new Date(clock) : new Date()).toISOString();
  let beatPid = harnessPid();
  const file = sessionRecord.sessionFileFor(wsDir, id);
  if (!file) return false;
  // A hand-run never stamps a pid the rule above refuses; the beat itself
  // still lands only if the caller chose to go on (callers refuse first).
  if (opts.handRun && beatPid !== undefined && handRunPidRefusal(wsDir, id, beatPid, opts)) beatPid = undefined;

  // THE BEAT GOES TO THE SIDECAR, NEVER THE TRACKED RECORD (WS-884). This
  // function used to patch `sessions/<id>.yaml` on every Stop hook, and the
  // SessionStart autocommit then shipped every one of those patches to the
  // other machine as a commit — the whole wedge, in one function.
  //
  // PID travels with the beat, for the same reason `host` does (WS-564): a
  // record judged against a stale identity is judged wrong forever. pid was
  // written ONCE at registration, so when the Claude process restarts while the
  // CONVERSATION continues — same CLAUDE_CODE_SESSION_ID, new OS process — the
  // record kept pointing at a pid that no longer existed; liveness returned
  // DEAD_PID, correctly by its rule and wrongly in fact, and recovery abandoned
  // a session mid-work (2026-08-05: pid 10808 gone, live process 5732). Whoever
  // is beating IS the session, so the beat re-anchors which process that is.
  // Number, not the raw env string: CLAUDE_PID arrives as a string.
  //
  // DATE the pid in the same write (WS-351): an undated pid cannot be told apart
  // from one recycled across a reboot. Only written when a pid is — and a pid
  // is only ever CLAUDE_PID (harnessPid): a hand-run beat from a tool shell
  // without it must leave the recorded pid alone, not stamp its own dying one.
  const landed = sessionRecord.writeLiveness(wsDir, id, {
    last_heartbeat: beatAt,
    worktree: currentWorktree() || '',
    host: localHost() || '',
    node_id: localNodeId() || '',
    pid: beatPid,
    ...(beatPid === undefined ? {} : { pid_recorded_at: beatAt }),
  }, { ownerLabel: 'claims:beat' });
  if (!landed) return false;

  // ONE tracked write, ever: a record minted before WS-564 has no `host`, and a
  // hostless record is judged as foreign (never closed, never trusted). Stamp
  // it once so the record can be judged at all; every later beat finds the key
  // present and touches nothing.
  try {
    const raw = fs.readFileSync(file, 'utf8');
    if (!/^host:/m.test(raw)) {
      withFileLock(file + '.lock', () => patchOrInsert(file, { host: localHost() || '' }, 'mode'),
        { ownerLabel: 'claims:host-heal', maxWaitMs: 5000 });
    }
    // WS-893, same one-time shape: a record minted before node_id existed is,
    // on a boot_id platform, indistinguishable from a sibling container's and
    // so judged by nobody. Its owner stamps it once. Windows has no boot_id,
    // its node id IS the host, and the tracked file is left alone there.
    if (nodeIdentity.bootId() && !/^node_id:/m.test(raw)) {
      withFileLock(file + '.lock', () => patchOrInsert(file, { node_id: localNodeId() || '' }, 'host'),
        { ownerLabel: 'claims:node-heal', maxWaitMs: 5000 });
    }
  } catch { /* best-effort: the beat already landed */ }
  return true;
}

/**
 * Set scalar fields on a session record, INSERTING keys the record does not have.
 *
 * `patchYAMLFile` alone silently drops a patch whose key is absent — the WS-561
 * shape, and fatal here: every record minted before WS-564 lacks `host`, so a
 * plain patch would report success and stamp nothing, leaving liveness judged
 * against the wrong machine forever. Insert-if-missing is what makes the field
 * self-healing instead of requiring a migration.
 */
function patchOrInsert(file, patches, afterKey) {
  patchYAMLFile(file, patches); // replaces keys that are already present
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [k, v] of Object.entries(patches)) {
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`^${esc}:`, 'm').test(content)) continue;
    content = upsertYAMLScalarField(content, k, v, { after: afterKey }).content;
    changed = true;
  }
  if (changed) writeFileAtomic(file, content);
}

/** Read one queue item's claim fields without parsing the whole document. */
function readClaim(queuePath) {
  let raw;
  try { raw = fs.readFileSync(queuePath, 'utf8'); } catch { return null; }
  const by = raw.match(/^claimed_by:\s*(.*)$/m);
  const at = raw.match(/^claimed_at:\s*(.*)$/m);
  const st = raw.match(/^status:\s*(\S+)/m);
  const clean = (m) => {
    if (!m) return null;
    const v = m[1].trim().replace(/^["']|["']$/g, '');
    return (!v || v === 'null' || v === '~') ? null : v;
  };
  const rel = raw.match(/^released_by:\s*(.*)$/m);
  return { claimedBy: clean(by), claimedAt: clean(at), status: st ? st[1] : null, releasedBy: clean(rel) };
}

/**
 * Every item id present in the queue DIRECTORY.
 *
 * Deliberately not `state/queue.json`. That cache is a reducer output which lags item
 * creation — WS-304 was absent from it minutes after being written — and it keys `items`
 * as an object rather than an array, so an `Array.isArray` guard against it silently
 * yields an empty set and the conflict check passes vacuously. A safety check that
 * degrades to "no conflicts" when its input is malformed is worse than no check. The
 * directory is the editable surface and is always current.
 */
function listQueueIds(wsDir) {
  const queueDir = path.join(wsDir, 'queue');
  let names = [];
  try { names = fs.readdirSync(queueDir); } catch { return []; }
  return names
    .filter((n) => /^[A-Za-z]+-\d+\.yaml$/.test(n))
    .map((n) => n.replace(/\.yaml$/, ''));
}

/**
 * Claims that would collide: held by a DIFFERENT session that is still alive.
 *
 * @param {string[]} [itemIds] - ids to check; defaults to the whole queue directory.
 * @returns {Array<{id, claimed_by, claimed_at, message}>}
 */
function findClaimConflicts(wsDir, mySessionId, itemIds, opts = {}) {
  const { staleMinutes = STALE_MINUTES, now = Date.now() } = opts;
  const out = [];
  const ids = (itemIds && itemIds.length) ? itemIds : listQueueIds(wsDir);
  for (const id of ids) {
    const queuePath = path.join(wsDir, 'queue', `${id}.yaml`);
    const claim = readClaim(queuePath);
    if (!claim || !claim.claimedBy) continue;
    if (claim.claimedBy === mySessionId) continue;
    if (claim.status === 'done') continue; // a closed item cannot be contended
    // Pass opts through so bootTimeMs is injectable — without it a caller cannot
    // test the pre-boot path deterministically and would silently be asserting
    // against the real machine's boot time. `claimedAt` bounds the hold on a
    // holder whose record is absent (WS-884).
    if (!isSessionLive(wsDir, claim.claimedBy, staleMinutes, now, { ...opts, claimedAt: claim.claimedAt })) continue; // stale — reclaimable
    out.push({
      id,
      claimed_by: claim.claimedBy,
      claimed_at: claim.claimedAt,
      message: `${id} is claimed by session ${claim.claimedBy}, which is still active.`
             + waitingNote(wsDir, claim.claimedBy, now)
             + ' Two sessions editing the same item is how uncommitted work gets clobbered.',
    });
  }
  return out;
}

/** Write claims onto queue items and mirror them into the session record. */
function claimItems(wsDir, sessionId, itemIds, clock = null, opts = {}) {
  if (!sessionId || !itemIds || itemIds.length === 0) return [];
  const at = clock || nowISO();
  const claimed = [];
  const stolen = [];
  const staleMinutes = opts.staleMinutes || STALE_MINUTES;
  const now = opts.now || Date.now();
  for (const id of itemIds) {
    const queuePath = path.join(wsDir, 'queue', `${id}.yaml`);
    if (!fs.existsSync(queuePath)) continue;
    try {
      // Same lock the done-path uses, so a concurrent reconcile cannot interleave.
      //
      // WS-529: this used patchYAMLFile, which REPLACES but cannot INSERT. No
      // HomeBase queue item scaffolds `claimed_by`, so every claim since WS-533
      // wrote nothing and returned the id anyway — approve reported
      // `claimed: [WS-519, WS-563]` over two items that stayed `backlog` with
      // `claimed_by: null`, free for any other session's /next to pick up. The
      // fix WS-561 built for exactly this shape already existed here; claims
      // never adopted it.
      withFileLock(queuePath + '.lock', () => {
        let text = fs.readFileSync(queuePath, 'utf8');
        // ADR-067 steal-if-stale: the upsert below refuses to overwrite a real
        // value (CAS-against-presence), so a dead session's claim used to be
        // permanently unreclaimable HERE even after findClaimConflicts stopped
        // reporting it — the gate said "free", claimItems silently no-opped,
        // and only recovery's abandon pass ever cleared the field. Clear a
        // lease whose owner fails the liveness cascade (provably dead, or past
        // the shared timeout), then claim. Decided under the item lock;
        // audited below via a claim_stolen event, because evicting a
        // slow-but-alive owner is a named trade (WS-312), not a silent one.
        const holder = claimantFromText(text);
        const holderAt = ((text.match(/^claimed_at:\s*(.*)$/m) || [])[1] || '').trim().replace(/^["'](.*)["']$/, '$1');
        if (holder && holder !== sessionId
            && !isSessionLive(wsDir, holder, staleMinutes, now, { ...opts, claimedAt: holderAt || undefined })) {
          text = text.replace(/^claimed_by:.*$/m, 'claimed_by: null')
                     .replace(/^claimed_at:.*$/m, 'claimed_at: null');
          stolen.push({ id, from: holder });
        }
        // `after: 'status'` keeps the lease fields next to the field they
        // qualify, matching where the done-path puts closure metadata.
        text = upsertYAMLScalarField(text, 'claimed_by', sessionId, { after: 'status' }).content;
        text = upsertYAMLScalarField(text, 'claimed_at', at, { after: 'claimed_by' }).content;
        // A fresh claim supersedes the last release (WS-1073).
        if (/^released_by:/m.test(text)) {
          text = text.replace(/^released_by:.*$/m, 'released_by: null').replace(/^released_at:.*$/m, 'released_at: null');
        }
        writeFileAtomic(queuePath, text);
      }, { ownerLabel: 'next:claim', maxWaitMs: 5000 });

      // Report what LANDED, not what was attempted. A claim list that counts
      // writes it never made is worse than a short one: it is what let an
      // unclaimed sprint look approved for three hours.
      if (readClaimant(queuePath) === sessionId) claimed.push(id);
    } catch { /* non-fatal: a failed claim degrades to today's behaviour, never blocks */ }
  }
  for (const s of stolen) {
    emitEvent('T6:workstream-rebalance', '/next', {
      type: 'claim_stolen', item: s.id, from_session: s.from, to_session: sessionId, at,
    });
  }
  mirrorIntoSession(wsDir, sessionId, claimed);
  rememberLeaseItems(wsDir, sessionId, claimed);
  return claimed;
}

/** The claimant carried by queue-file text, unquoted; null when absent/unset. */
function claimantFromText(text) {
  const m = String(text).match(/^claimed_by:\s*(.*)$/m);
  if (!m) return null;
  const v = m[1].trim().replace(/^["'](.*)["']$/, '$1');
  return (!v || v === 'null' || v === '~') ? null : v;
}

/** Read back the claimant a queue file actually carries, for write verification. */
function readClaimant(queuePath) {
  try {
    return claimantFromText(fs.readFileSync(queuePath, 'utf8'));
  } catch { return null; }
}

/** Clear claims — called when items close, so the queue does not accrete dead holds. */
function releaseItems(wsDir, itemIds) {
  for (const id of itemIds || []) {
    const queuePath = path.join(wsDir, 'queue', `${id}.yaml`);
    if (!fs.existsSync(queuePath)) continue;
    try {
      withFileLock(queuePath + '.lock', () => {
        // WS-1073: say WHO let go. A released claim reads `claimed_by: null`
        // whether this session closed the item or another one did after
        // adopting it, and cwos-lease-check must tell those apart — one is
        // finished work, the other is the 2026-10-10 duplicate build.
        const before = fs.readFileSync(queuePath, 'utf8');
        const holder = claimantFromText(before);
        patchYAMLFile(queuePath, { claimed_by: null, claimed_at: null });
        if (holder) {
          let text = fs.readFileSync(queuePath, 'utf8');
          text = upsertYAMLScalarField(text, 'released_by', holder, { after: 'claimed_at' }).content;
          text = upsertYAMLScalarField(text, 'released_at', nowISO(), { after: 'released_by' }).content;
          writeFileAtomic(queuePath, text);
          forgetLeaseItem(wsDir, holder, id);
        }
      }, { ownerLabel: 'next:release', maxWaitMs: 5000 });
    } catch { /* non-fatal */ }
  }
}

/**
 * Drop `id` from the items cwos-lease-check tracks for `sessionId` (WS-1073).
 * A session that let go of an item must not later read its fate — another
 * session claiming and closing it — as a stolen lease. Sidecar only: the
 * release runs on the holder's own node. Never throws.
 */
function forgetLeaseItem(wsDir, sessionId, id) {
  try {
    const side = sessionRecord.readLiveness(wsDir, sessionId);
    const patch = {};
    if (Array.isArray(side.lease_items) && side.lease_items.includes(id)) {
      patch.lease_items = side.lease_items.filter((x) => x !== id);
    }
    const w = side.waiting_on_founder;
    if (w && Array.isArray(w.items) && w.items.includes(id)) {
      patch.waiting_on_founder = { ...w, items: w.items.filter((x) => x !== id) };
    }
    if (Object.keys(patch).length) sessionRecord.writeLiveness(wsDir, sessionId, patch, { ownerLabel: 'release:lease' });
  } catch { /* bookkeeping never blocks a release */ }
}

/** The other half: a fresh claim joins the tracked set (WS-1073). Never throws. */
function rememberLeaseItems(wsDir, sessionId, ids) {
  if (!ids || !ids.length) return;
  try {
    const side = sessionRecord.readLiveness(wsDir, sessionId);
    const cur = Array.isArray(side.lease_items) ? side.lease_items : [];
    const next = [...new Set([...cur, ...ids.map(String)])];
    if (next.length !== cur.length) sessionRecord.writeLiveness(wsDir, sessionId, { lease_items: next }, { ownerLabel: 'claim:lease' });
  } catch { /* bookkeeping never blocks a claim */ }
}

/** Keep the session's own `claimed_items` list in step, for session-recovery to read. */
function mirrorIntoSession(wsDir, sessionId, itemIds) {
  mergeIntoSessionList(wsDir, sessionId, 'claimed_items', itemIds);
}

/**
 * Union `values` into a top-level list field on a session record.
 *
 * One implementation for `claimed_items` and `files_locked`. The second field
 * existed in the schema from adoption with ZERO writers anywhere in the kit —
 * the same shape WS-533 diagnosed for `claimed_by` ("nothing ever ACQUIRED one"),
 * except that fix stopped at items and never reached files. INV-069 now asserts
 * this function has live callers, because a field with a writer that later loses
 * it looks identical to one that never had it.
 */
function mergeIntoSessionList(wsDir, sessionId, key, values) {
  if (!sessionId || !values || values.length === 0) return [];
  for (const name of [`${sessionId}.yaml`, `session-${sessionId}.yaml`]) {
    const file = path.join(wsDir, 'sessions', name);
    if (!fs.existsSync(file)) continue;
    try {
      return withFileLock(file + '.lock', () => {
        const raw = fs.readFileSync(file, 'utf8');
        const existing = readListField(raw, key);
        const merged = [...new Set([...existing, ...values.map(String)])];
        const rendered = `${key}:\n${merged.map((i) => `  - "${i}"`).join('\n')}\n`;
        const block = new RegExp(`^${key}:\\s*(\\[\\]|\\n(?:\\s+-\\s+.*\\n?)*)`, 'm');
        const next = new RegExp(`^${key}:`, 'm').test(raw)
          ? raw.replace(block, rendered)
          : raw.trimEnd() + '\n' + rendered;
        writeFileAtomic(file, next);
        return merged;
      }, { ownerLabel: `session:${key}`, maxWaitMs: 5000 });
    } catch { return []; /* best-effort: bookkeeping never blocks the work */ }
  }
  return [];
}

/** Entries of a simple `key:\n  - "value"` list, from raw YAML text. */
function readListField(raw, key) {
  const block = raw.match(new RegExp(`^${key}:\\s*(\\[\\]|\\n(?:\\s+-\\s+.*\\n?)*)`, 'm'));
  if (!block || !block[1] || block[1].trim() === '[]') return [];
  return [...block[1].matchAll(/^\s+-\s+"?([^"\n]+?)"?\s*$/gm)].map((m) => m[1]);
}

/**
 * Record that this session is working on `files` (repo-relative, posix separators).
 *
 * ADVISORY, LIKE CLAIMS. Nothing is prevented by holding a lock; what changes is
 * that ownership becomes COMPUTED instead of inferred. The reporting repo's git
 * guard had to infer it from `mtime < session start` — a real proof, but a
 * one-sided one: it cannot see a session that started before ours and edited after
 * we began. That gap is precisely what a per-file record closes.
 *
 * @returns {string[]} the session's full lock set after the merge.
 */
function lockFiles(wsDir, sessionId, files) {
  const clean = (files || [])
    .map((f) => String(f).split('\\').join('/').replace(/^\.\//, '').trim())
    .filter(Boolean);
  return mergeIntoSessionList(wsDir, sessionId, 'files_locked', clean);
}

/**
 * Every file lock currently held, keyed by holder.
 *
 * `live` is reported per holder rather than filtered out here: a dead session's
 * locks are still evidence about who wrote what is sitting in the tree, and the
 * caller decides whether that should block (it should not) or explain (it should).
 */
function listFileLocks(wsDir, opts = {}) {
  const sessDir = path.join(wsDir, 'sessions');
  let names = [];
  try { names = fs.readdirSync(sessDir).filter((f) => f.endsWith('.yaml')); } catch { return []; }

  const out = [];
  for (const n of names) {
    const file = path.join(sessDir, n);
    let raw;
    try { raw = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const doc = readSessionDoc(file);
    if (!doc || String(doc.status || '').toLowerCase() !== 'active') continue;
    const id = doc.id || n.replace(/\.yaml$/, '');
    const files = readListField(raw, 'files_locked');
    if (!files.length) continue;
    out.push({
      session_id: id,
      host: doc.host || null,
      live: isSessionLive(wsDir, id, opts.staleMinutes || STALE_MINUTES, opts.now || Date.now(), opts),
      files,
    });
  }
  return out;
}

/**
 * Which of `files` are held by a DIFFERENT session, and by whom.
 *
 * @returns {Array<{file, session_id, live, host}>}
 */
function findFileLockConflicts(wsDir, mySessionId, files, opts = {}) {
  const want = new Set((files || []).map((f) => String(f).split('\\').join('/').replace(/^\.\//, '')));
  const out = [];
  for (const holder of listFileLocks(wsDir, opts)) {
    if (holder.session_id === mySessionId) continue;
    for (const f of holder.files) {
      if (!want.has(f)) continue;
      out.push({ file: f, session_id: holder.session_id, live: holder.live, host: holder.host });
    }
  }
  return out;
}

/**
 * Paths every live session dirties merely by EXISTING.
 *
 * AF-5 (adversarial pass, 2026-08-26). The heartbeat hook rewrites this session's
 * own tracked `sessions/<id>.yaml` on every Stop, and CLAUDE.md mandates an event
 * append at every command boundary. So a second live session in a shared checkout
 * trips `git status` from its own bookkeeping alone, having touched not one line
 * of anybody's work. A hazard that fires on the mere presence of a peer is the
 * "control that refuses everyone" `session-lanes.md` warns gets bypassed rather
 * than fixed.
 *
 * These are exactly the `shared_append` and `derived` classes that rule already
 * declares every lane may write. They are not what gets clobbered.
 *
 * `dirty_count` still reports the TRUE total -- the filter narrows what counts as
 * WORK AT STAKE, and never hides anything from the reader.
 */
const BOOKKEEPING_CHURN = [
  /(^|\/)\.claude\/workstream\/sessions\//,
  /(^|\/)\.claude\/workstream\/events\//,
  /(^|\/)\.claude\/workstream\/state\//,
  /(^|\/)\.claude\/workstream\/[a-z-]+-index\.yaml$/,
  /(^|\/)\.claude\/workstream\/chain-anchors\.yaml$/,
  /(^|\/)\.claude\/workstream\/usage\.yaml$/,
  /(^|\/)\.claude\/\.tmp-sprint\.json$/,
  /(^|\/)system\/events\.log\.md$/,
];

function isBookkeeping(p) {
  const s = String(p).replace(/\\/g, '/');
  return BOOKKEEPING_CHURN.some((re) => re.test(s));
}

/**
 * Is this recorded worktree a path that can be COMPARED to another one.
 *
 * A relative path (`.worktrees/ServeYourNote/feat-canon-surface` is a real record
 * in this registry) is meaningless without the base it was written against, so it
 * matches no absolute path and would silently read as "not a cohabitant" -- a
 * false clear, which is the one answer this check must never invent. Such a record
 * is UNLOCATABLE, not elsewhere.
 */
function isComparableWorktree(p) {
  if (!p) return false;
  return /^[a-z]:\//.test(p) || p.startsWith('/');
}

function findCheckoutConflicts(wsDir, mySessionId, opts = {}) {
  const mine = opts.worktree !== undefined
    ? normalizeWorktree(opts.worktree)
    : currentWorktree(opts.cwd);

  const peers = listLiveSessions(wsDir, mySessionId, opts);
  const mineReal = isComparableWorktree(mine) ? canonicalWorktree(mine, opts) : null;

  const cohabitants = [];
  const unlocatable = [];
  for (const p of peers) {
    // AF-1 (adversarial pass, 2026-08-26). `isLocalHost` returns false for a
    // record with NO host, so `foreign_host` is true for both "known to be
    // elsewhere" and "we have no idea". That conflation is correct for the
    // liveness test it was written for and wrong here, because skipping an
    // unknown-host peer drops it into NEITHER bucket -- it contributes nothing
    // to `unknown_reasons` and simply vanishes. A record predating the `host`
    // stamp would therefore be silently excluded from the one check that exists
    // to refuse silent exclusion.
    if (!p.host) { unlocatable.push(p); continue; }
    // A session on another machine cannot be standing in this directory, whatever
    // its recorded path says. Path equality across hosts is meaningless.
    if (p.foreign_host) continue;
    if (!isComparableWorktree(p.worktree)) { unlocatable.push(p); continue; }
    // WS-992: compare REAL paths, so a subst drive, junction or UNC spelling of
    // one checkout still matches. A peer we cannot resolve is unlocatable, not clear.
    const peerReal = canonicalWorktree(p.worktree, opts);
    if (!peerReal) { unlocatable.push(p); continue; }
    if (mineReal && peerReal === mineReal) cohabitants.push(Object.assign({}, p, { worktree_real: peerReal }));
  }

  const dirty = opts.dirty !== undefined ? opts.dirty : dirtyPaths(mine, opts);
  // AF-5: what is actually AT STAKE, as opposed to what a peer dirties by existing.
  const atStake = dirty === null ? null : dirty.filter((f) => !isBookkeeping(f));

  const unknownReasons = [];
  if (!isComparableWorktree(mine)) unknownReasons.push('this checkout could not be resolved (git rev-parse failed)');
  else if (!mineReal) unknownReasons.push('this checkout could not be resolved to a real path (realpath failed)');
  if (dirty === null) unknownReasons.push('git status could not be read for this checkout');
  if (unlocatable.length) {
    unknownReasons.push(
      `${unlocatable.length} live session(s) cannot be placed (no worktree recorded, a relative path, a path that cannot be resolved, or no host), `
      + 'so cohabitation cannot be ruled out: '
      + unlocatable.map((p) => p.id).join(', '),
    );
  }

  return {
    worktree: mine,
    conditioning: unknownReasons.length ? 'unknown' : 'known',
    unknown_reasons: unknownReasons,
    cohabitants,
    unlocatable,
    dirty_count: dirty === null ? null : dirty.length,
    dirty_sample: dirty === null ? [] : dirty.slice(0, 12),
    // `dirty_count` is the true total; this is the subset that can actually be
    // clobbered, and it is what decides the verdict. Both are reported, always.
    at_stake_count: atStake === null ? null : atStake.length,
    at_stake_sample: atStake === null ? [] : atStake.slice(0, 12),
    // The hazard is cohabitation AND work at stake. A shared but clean checkout is
    // untidy; a shared checkout with uncommitted work is how sessions clobber.
    hazard: cohabitants.length > 0 && atStake !== null && atStake.length > 0,
    // ONE field a caller can branch on, because `hazard: false` is true both when
    // the checkout is provably clear and when we could not tell -- and a caller
    // that reads only the boolean gets a confident all-clear in the second case.
    // That is the exact substitution `conditioning` exists to prevent, so it is
    // collapsed here once, correctly, instead of at every call site.
    //   hazard  -- Observed: a live peer is in this checkout and work is at stake
    //   unknown -- cannot rule that out
    //   clear   -- Observed: nothing to collide with
    verdict: (cohabitants.length > 0 && atStake !== null && atStake.length > 0)
      ? 'hazard'
      : (unknownReasons.length && (atStake === null || atStake.length > 0)) ? 'unknown' : 'clear',
  };
}

module.exports = {
  STALE_MINUTES,
  bootTimeMs,
  localHost,
  isLocalHost,
  localNodeId,
  isPidAlive,
  readSessionPointer,
  readSessionDoc,
  agentSessionIdFromEnv,
  findByAgentSessionId,
  resolveSessionId,
  isSessionLive,
  beatAfterClose,
  harnessPid,
  processHostsOneConversation,
  isSupersededBy,
  SUPERSEDE_GRACE_MS,
  isSupersededClosure,
  supersededHoldActive,
  listLiveSessions,
  waitingNote,
  staleActiveSessions,
  abandonTimeoutHours,
  registryHealth,
  minutesSinceHeartbeat,
  touchSession,
  handRunPidRefusal,
  readClaim,
  readListField,
  listQueueIds,
  findClaimConflicts,
  claimItems,
  releaseItems,
  lockFiles,
  listFileLocks,
  findFileLockConflicts,
  normalizeWorktree,
  canonicalWorktree,
  currentWorktree,
  isComparableWorktree,
  isBookkeeping,
  dirtyPaths,
  findCheckoutConflicts,
  sessionOwnerVerdict,
  patchOrInsert,
};
