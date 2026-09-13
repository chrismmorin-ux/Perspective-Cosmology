# DEF_0262 Definition: Termination Conditions

**Tag**: 0262
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/08_time.md

---

## Requires

- [DEF_0260: Temporal sequence]
- [THM_0461: No loops]

## Provides

- Classification of how temporal sequences end

---

## Statement

Any temporal sequence must eventually:

**Option 1: Terminate**
```
Reach πₜ where no valid adjacency πₜ → π' exists.
All accessible structure has been projected away.
```

**Option 2: Stabilize**
```
Reach crystalline region: ∀ π, π' : U_π ≅ U_{π'}
Time "stops" because nothing distinguishes moments.
```

---

## Notes

Both options are consequences of finiteness and no-loop theorem.
