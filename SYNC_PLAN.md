# Bring-Your-Own-Cloud Sync: Plan

Status: **planned, not started.** Written 2026-10-22. Revisit once there are enough users to justify it.

## Summary

Let users connect their own cloud storage (Google Drive, Dropbox, OneDrive) and keep their Nawtch data in sync across devices automatically. Sync is free. Nawtch runs no server and never sees user data. The data is encrypted in the browser before upload, so the storage provider can't read it either.

The upload is the easy part. The real work is **merging changes from two devices without losing or resurrecting data**, and that needs groundwork in the data model first (Phase 1).

## Why

- **Retention.** Data lives only in one browser today. Switching devices, clearing site data, or browser storage eviction loses everything unless the user remembered to export a backup. People who lose their data rarely come back.
- **Fits the brand.** No account, no Nawtch server, no Nawtch-held data. The user owns the storage and the encryption key.
- **No running cost.** No backend, no database, no storage bill. That's why it should be free: there's nothing of ours to charge for.
- **Business case.** Indirect. Users who keep their history keep coming back, and returning users drive ad views.

## Goals

- Optional. Nawtch works exactly as it does now for anyone who never connects a provider.
- Automatic once connected: changes sync in the background without the user thinking about it.
- End-to-end encrypted with a passphrase the user chooses.
- Two or more devices can edit offline and merge cleanly later.
- Deletions stay deleted on every device.
- No Nawtch backend of any kind.

## Non-goals

- Accounts, user IDs, or any Nawtch-hosted service.
- Real-time collaboration or sharing data between different people.
- Passphrase recovery. It's impossible by design, so the UI must say so clearly.
- iCloud (no practical web API; see Providers).

---

## Current data inventory (as of 2026-10-22)

IndexedDB database `MealPlanDB`, version 13 (`src/lib/db.js`).

| Store | Key | What it holds | Has `updatedAt` today? | Sync? |
|---|---|---|---|---|
| `days` | `date` | One snapshot per logged day: `loggedItems`, totals (`cal`, `p`, `c`, `f`, `cost`), cal range | No | Yes |
| `weeks` | `weekStart` | Per-week rollup of `days` totals | No | **No.** It's derived. Rebuild it from `days` after a merge. |
| `coreitems` | `id` | The user's food library | No | Yes |
| `settings` | `key` | Preferences: `calRange`, `weightUnit`, `portionUnit`, `energyUnit`, `currency`, `theme`, plus device flags `journeyStarted`, `settingsVisited` | No | Preferences yes. Device flags no (see below). |
| `programs` | `id` | Workout programs | Yes (`createdAt`, `updatedAt`) | Yes |
| `exercises` | `id` | Exercise library | No | Yes |
| `weights` | `date` | One weigh-in per day (`weightKg`) | No | Yes |
| `weightGoals` | `id` | `active-goal` plus `completed-<ms>` records | No | Yes |
| `bowls` | `id` | Saved Bowl Builder bowls | Yes (`createdAt`, `updatedAt`) | Yes |
| `groceryPlans` | `id` | Grocery Budget plans | Yes (`createdAt`, `updatedAt`) | Yes |
| `supplementitems` | `id` | Supplement catalog | No | Yes |
| `supplementDays` | `date` | Per-day dose log snapshots | No | Yes |
| `workoutSessions` | `id` | `active-session` plus completed `ws_<ms>` sessions | Active session only | Completed yes. Active session: decide (see Open questions). |

localStorage keys (device-local caches and flags; **do not sync**):

| Key | Purpose |
|---|---|
| `mp_today_v3` (`LS_TODAY`) | Today page working cache |
| `mp_weekstart_v3` (`LS_WEEK`) | Week start cache |
| `mp_supptracker_v1` (`LS_SUPPTRACKER`) | Supplement Tracker working cache |
| `nawtch_active_workout_v1` (`LS_ACTIVE_WORKOUT`) | Mirror of the in-progress workout (durability, see `src/lib/workouts.js`) |
| `nawtch_theme` | Theme bootstrap mirror (the real value is in `settings`) |
| barcode/search rate-limit keys, currency override | Device-local |

Gotchas found while auditing:

- **ID collisions across devices.** Most IDs are `prefix_` + `Date.now()` (`ex_…`, `prog_…`, `ws_…`, `gplan_…`, `bowl_…`, `completed-…`). Two devices creating a record in the same millisecond would collide. Unlikely, but after sync exists it becomes possible. Switch new IDs to `prefix_` + `crypto.randomUUID()`. Existing IDs can stay.
- **`days` and `supplementDays` are whole-day snapshots.** Logging food on the phone and the laptop on the same day means two different versions of one record. Whole-record last-write-wins would drop one device's entries. See the merge rules.
- **`weeks` duplicates `days`.** Syncing both invites drift. Sync `days` only and rebuild `weeks`.
- **Fixed-ID singletons** (`active-goal`, `active-session`) behave like single shared records, not per-device ones.

---

## Phase 1: Data model groundwork

Do this first, ship it on its own, and let it run for a while before any provider work. It's invisible to users and makes everything else safe.

### 1. Per-record metadata

Every synced record gets:

```js
{
  ...existingFields,
  _updatedAt: 1761150000000, // ms, set on every write
  _deviceId: "d_5f2c…",      // which device wrote it last (tie-breaker)
}
```

- Add it in one place: wrap `dbPut` (or add `dbPutSynced`) in `src/lib/db.js`, so every module gets it without hand-editing dozens of call sites.
- `_deviceId` is a random UUID created once per browser and stored in localStorage (`nawtch_device_id`). It is never synced and never identifies a person.
- Existing records without `_updatedAt` are treated as `0`, so any real edit wins over them.
- Underscore-prefixed fields are sync metadata. UI code should ignore them.

### 2. Tombstones for deletions

Without these, a record deleted on device A comes back from device B on the next sync.

- New store: `syncTombstones`, key `[store, key]` (or a string `"store|key"`), value `{ store, key, deletedAt, _deviceId }`.
- Wrap `dbDelete` and `dbClear` so deleting a synced record also writes a tombstone.
- Tombstones are synced like records. A tombstone beats any record version with an older `_updatedAt`. A newer write (re-create) beats the tombstone.
- Prune tombstones older than about 90 days, once every connected device has synced past them. Simple version: prune after 90 days and accept that a device offline for longer than that may resurrect a deleted item.

### 3. Random IDs for new records

Replace `Date.now()` ID generation with `crypto.randomUUID()` (keep the existing prefixes for readability). Leave existing IDs alone.

### 4. Device-local vs synced settings

Split `settings` keys into:

- **Synced:** `calRange`, `weightUnit`, `portionUnit`, `energyUnit`, `currency`, `theme`
- **Device-local:** `journeyStarted`, `settingsVisited` (the welcome flow and the Settings hint are per-device experiences)

Keep a list of each in `prefs.js` so it's explicit.

### 5. Merge engine (pure, testable)

A pure function with no IndexedDB, no network, no UI:

```js
merge(localSnapshot, remoteSnapshot) -> { merged, changedLocally, changedRemotely }
```

A snapshot is `{ schemaVersion, stores: { [store]: Record[] }, tombstones: Tombstone[] }`.

**Default rule: per-record last-write-wins.** For each `(store, key)`:

1. Collect the local record, remote record, local tombstone and remote tombstone.
2. The newest of all of them by `_updatedAt` / `deletedAt` wins. Ties go to the lexically larger `_deviceId`, so every device picks the same winner.
3. If a tombstone wins, delete the record and keep the tombstone.

**Exceptions** (where whole-record last-write-wins loses real data):

| Store | Rule |
|---|---|
| `days` | Merge `loggedItems` per item instead of whole-day. Each logged item needs its own stable ID and `_updatedAt` (and item-level tombstones, or a `removed` flag). Recompute totals after merging. Without this, logging breakfast on the phone and lunch on the laptop on the same day loses one of them. |
| `supplementDays` | Same approach for the dose log entries. |
| `weeks` | Not synced. Rebuild from merged `days`. |
| `workoutSessions` `active-session` | See Open questions. The simplest safe rule: don't sync it, so each device's in-progress workout stays local until it's finished. |
| `weightGoals` `active-goal` | Plain last-write-wins is fine. It's one deliberate user action at a time. |

### 6. Schema versioning

The sync payload carries `schemaVersion` (start at the IndexedDB version, 13). A device that receives a newer version than it understands should refuse to merge and show "Update Nawtch on this device to keep syncing" (refreshing the page usually does it). Never let an old client overwrite newer data.

### Phase 1 testing

Same approach as the workout durability harness (fresh browser contexts, fake clock):

- Unit tests for `merge()`: edit/edit, edit/delete, delete/re-create, same-millisecond ties, item-level `days` merges, a missing `_updatedAt`.
- Two-device simulation: two isolated browser contexts exchanging snapshots by hand. Make random edits on both, merge both ways, and assert both end up identical, with nothing lost and nothing resurrected.
- Upgrade test: an existing v13 database with no metadata upgrades cleanly and merges correctly.

---

## Phase 2: Encryption and the first provider

### Sync file format

One file per user in their storage, e.g. `nawtch-sync.json.enc` (or one file per store if snapshots get large).

```json
{
  "format": "nawtch-sync",
  "formatVersion": 1,
  "schemaVersion": 13,
  "kdf": { "name": "PBKDF2", "hash": "SHA-256", "iterations": 600000, "salt": "<base64>" },
  "cipher": { "name": "AES-GCM", "iv": "<base64>" },
  "ciphertext": "<base64>"
}
```

- Everything uses the browser's built-in Web Crypto API. No crypto library.
- Key derivation: PBKDF2-SHA-256 with at least 600,000 iterations (OWASP guidance at time of writing; re-check before building). Use a new random IV on every write.
- The passphrase never leaves the device. Optionally keep the derived key in IndexedDB as a non-extractable `CryptoKey` (an "unlock on this device" option) so the user doesn't retype it on every visit.
- Wrong passphrase: decryption fails cleanly. Show "That passphrase doesn't match the one used to encrypt your synced data." Never overwrite remote data after a failed decrypt.
- **No recovery.** The connect flow must say plainly: if you forget this passphrase, your synced copy can't be opened. Your data on this device is unaffected.

### Providers

Verify every detail here at build time. OAuth rules and scope classifications change.

| Provider | Approach | Notes |
|---|---|---|
| **Google Drive** | Google Identity Services token flow from the browser; the `drive.file` scope (Nawtch only sees files it created) | Biggest reach. Browser-only tokens last about an hour with no refresh token, so fully automatic background sync needs silent re-authorization, which can fail when third-party cookies are blocked. Expect an occasional "Reconnect Google Drive" prompt. Public launch requires OAuth app verification (brand, privacy policy, scope justification). |
| **Dropbox** | OAuth with PKCE, offline access (refresh tokens work in browser-only apps) | Smoothest truly-automatic sync. Smaller user base. A good candidate for the first provider if the Google token friction looks bad in testing. |
| **OneDrive** | MSAL.js single-page-app flow, Microsoft Graph app folder | Refresh tokens for SPAs last about 24 hours, so expect a daily re-auth. |
| **Synced folder** (no sign-in) | File System Access API: user picks a folder that their Dropbox/Drive/OneDrive desktop app already syncs | Chrome and Edge on desktop only. No OAuth, no verification, nothing to approve. A good no-login fallback. |
| iCloud | Not planned | No practical web API for this. |

OAuth client IDs and the Dropbox app key are public by design in browser apps. That's fine with PKCE and the token flow. No secrets live in the code.

### Sync loop

- **When:** on page load, on `visibilitychange` to visible, a few seconds after local changes (debounced), and on a long interval while the page is open.
- **Steps:**
  1. Download the remote file and note its revision ID or ETag.
  2. Decrypt it and `merge(local, remote)`.
  3. Apply `changedLocally` to IndexedDB, then rebuild `weeks`.
  4. Re-encrypt and upload **only if the remote revision hasn't changed** since step 1 (conditional write: Drive and Dropbox both support revision checks). If it changed, start over.
- Never run two sync loops at once on the same device (use a Web Lock: `navigator.locks.request("nawtch-sync", …)`).
- Back off on network errors. Sync failures never block using the app.

### UI (Settings → Sync)

- Connect / disconnect provider, set or change passphrase.
- Status line: "Synced 2 minutes ago", "Syncing…", "Reconnect needed", "Offline, will sync later".
- "Sync now" button.
- Disconnecting stops syncing and leaves both copies as they are. It never deletes anything.
- Wording: plain language, short sentences, no em dashes (same style as the rest of the site).

### Interaction with existing features

- **Backup export/import** (`settings.js`, `ALL_STORES`) stays as is. Import should also clear tombstones and treat the restore as a fresh, newest write. Otherwise sync could undo a restore.
- **Workout durability mirror** (`LS_ACTIVE_WORKOUT`) stays device-local.
- **Clearing site data** on one device should not delete the synced copy. On next connect, that device pulls everything back down. Confirm that a fresh, empty device never uploads its empty state over real data: an empty local database plus no tombstones must never win.

---

## Phase 3: More providers and polish

- Add the second OAuth provider and the synced-folder option.
- Show "last synced from: this device / another device".
- Optional: keep the last few encrypted versions in the user's storage (a simple undo for a bad merge).

---

## Open questions (decide before building)

1. **In-progress workouts across devices.** Don't sync `active-session` (simplest), or sync it so a workout started on the laptop can be finished on the phone? Syncing it means two devices could edit the same live session. The two-tab code in `workout.js` already handles that within one browser, but cross-device latency is much higher.
2. **First provider.** Google Drive (reach) vs Dropbox (smoothest automatic sync).
3. **Snapshot size.** One file is simplest. If a heavy user's data grows past a few MB, split by store, or into a file for recent data plus one for history.
4. **Tombstone retention.** 90 days, or track per-device "last synced" timestamps so they can be pruned safely?
5. **Should theme sync?** Some people want dark on desktop and light on their phone.

## Risks

- **Silent data loss from a merge bug** is the worst outcome, which is why Phase 1 ships and soaks on its own, and why the two-device simulation tests come before any provider work.
- **OAuth verification and policy changes** (especially Google). Budget time for app verification before launch.
- **Forgotten passphrases.** Mitigate with clear copy, and by never touching local data when decryption fails.
- **Support burden.** Sync issues are hard to debug without server logs. Build a "Copy sync diagnostics" button (no user data, just timestamps, counts and error codes) that users can paste into a contact form.

## Rough effort

| Phase | Scope | Size |
|---|---|---|
| 1 | Metadata, tombstones, random IDs, settings split, `merge()` with item-level `days` / `supplementDays` merging, tests | Largest and riskiest |
| 2 | Encryption, sync loop, one provider, Settings UI, OAuth verification | Medium, plus verification lead time |
| 3 | Additional providers, synced-folder option, polish | Small to medium per provider |

## When picking this up

1. Re-check this inventory against `src/lib/db.js`, since stores may have been added since this was written.
2. Re-verify the provider OAuth details and the PBKDF2 iteration guidance.
3. Answer the open questions.
4. Start with Phase 1 and its tests. Don't start provider work until the two-device simulation passes consistently.
