/**
 * claude-accounts — which Claude Code config dirs (accounts / "lanes") exist on
 * this machine, and which of them each session ran under (WS-1169).
 *
 * A lane is a CLAUDE_CONFIG_DIR with its own login. Lanes on this fleet junction
 * their projects/ folder back to ~/.claude/projects (claude-lane-provision.ps1),
 * so the transcript's location does NOT say which account ran it. What does is
 * each config dir's own history.jsonl: Claude Code appends one line per prompt,
 * carrying the sessionId, to the history file of the config dir it is running
 * under. A session found in no history file (headless `claude -p`, or a history
 * that was pruned) is reported as unattributed, never guessed.
 *
 * Reads only: settings presence, .claude.json's oauthAccount.emailAddress, and
 * the sessionId field of history.jsonl. Never reads .credentials.json, never
 * prints prompt text. Zero dependencies.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { forEachLine } = require('./transcript-usage');

const realpathOr = (p) => { try { return fs.realpathSync(p); } catch { return null; } };
const norm = (p) => (p ? path.resolve(p).replace(/\\/g, '/').toLowerCase() : p);

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch { return null; }
}

/** Lanes declared in a claude-lanes.json ({lanes:[{name, configDir}]}); '' configDir = ~/.claude. */
function readLanes(lanesFile, home = os.homedir()) {
  if (!lanesFile) return [];
  const j = readJson(lanesFile);
  if (!j || !Array.isArray(j.lanes)) return [];
  return j.lanes.filter((l) => l && l.name).map((l) => ({
    name: String(l.name),
    dir: l.configDir ? path.resolve(String(l.configDir).replace(/^~(?=$|[\\/])/, home)) : path.join(home, '.claude'),
  }));
}

/**
 * Every Claude Code config dir on this machine: ~/.claude, ~/.claude-* dirs that
 * look like a config dir, $CLAUDE_CONFIG_DIR, and any lane dirs. Deduped by real path.
 */
function discoverConfigDirs({ home = os.homedir(), env = process.env, lanesFile = null } = {}) {
  const lanes = readLanes(lanesFile, home);
  const cands = [];
  const push = (dir, source) => { if (dir) cands.push({ dir: path.resolve(dir), source }); };
  push(path.join(home, '.claude'), 'default');
  try {
    for (const e of fs.readdirSync(home, { withFileTypes: true })) {
      if (!e.isDirectory() || !/^\.claude-/.test(e.name)) continue;
      const d = path.join(home, e.name);
      if (['settings.json', 'history.jsonl', 'projects'].some((f) => fs.existsSync(path.join(d, f)))) push(d, 'home');
    }
  } catch { /* home unreadable: only the explicit candidates remain */ }
  if (env.CLAUDE_CONFIG_DIR) push(env.CLAUDE_CONFIG_DIR, 'env');
  for (const l of lanes) push(l.dir, 'lane');

  const seen = new Map();
  for (const c of cands) {
    const key = norm(realpathOr(c.dir) || c.dir);
    if (seen.has(key) || !fs.existsSync(c.dir)) continue;
    const lane = lanes.find((l) => norm(realpathOr(l.dir) || l.dir) === key);
    const isDefault = key === norm(realpathOr(path.join(home, '.claude')) || path.join(home, '.claude'));
    const profile = readJson(isDefault ? path.join(home, '.claude.json') : path.join(c.dir, '.claude.json'));
    const email = profile && profile.oauthAccount && typeof profile.oauthAccount.emailAddress === 'string'
      ? profile.oauthAccount.emailAddress : null;
    seen.set(key, {
      dir: c.dir,
      label: lane ? lane.name : path.basename(c.dir),
      lane: lane ? lane.name : null,
      email,
      projects: realpathOr(path.join(c.dir, 'projects')),
    });
  }
  return [...seen.values()];
}

/** Map sessionId -> account label, from each config dir's history.jsonl. */
function sessionAccountMap(configDirs) {
  const map = new Map();
  for (const c of configDirs) {
    forEachLine(path.join(c.dir, 'history.jsonl'), (line) => {
      const i = line.indexOf('"sessionId"');
      if (i === -1) return;
      const m = line.slice(i).match(/^"sessionId"\s*:\s*"([^"]+)"/);
      if (m && !map.has(m[1])) map.set(m[1], c.label);
    });
  }
  return map;
}

module.exports = { discoverConfigDirs, sessionAccountMap, readLanes };
