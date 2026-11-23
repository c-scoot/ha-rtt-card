# Validation and release checklist

## Local verification

Verified on 23 November 2026 for v0.2.0: strict TypeScript check, **57/57 Vitest tests**, production build, and headless Edge browser smoke checks all passed. Desktop/mobile/dark preview screenshots were inspected. These checks used simulated data matching the integration's latest multi-station, platform certainty, and stable weekly-tracker contracts.

- Strict TypeScript checks and production Vite bundle.
- Vitest covers config validation, renamed and ambiguous sibling sensors, repeated service identities, explicit mappings, all integration statuses, platform provenance, stale/unavailable data, midnight and DST, safe text rendering, same-number platform confirmation, more-info events, automatic discovery/sorting, live tracker removal, weekly rollover, and editor-mode preservation.
- Browser smoke script checks automatic add/remove, weekly rollover, mobile overflow, live platform updates, light/dark screenshots, more-info, and automatic discovery in the standalone production module.

See the command results from the latest run; no automated check substitutes for the live checks below.

## Live checks before public release

- [ ] Install the integration and copy/register the packaged card on a test HA instance; check no console errors.
- [ ] Add from the picker, edit title/name/order, save, reload, and confirm persistence as an ordinary dashboard user.
- [ ] Verify renamed companions, separate arrival/departure tracks, and multiple cards.
- [ ] Switch an existing card to All monitored trains, add/remove trackers at two stations, and observe a weekly tracker roll to the next dated service without duplicate rows.
- [ ] Observe a planned→confirmed platform update and a reported final outcome with an entitled integration or controlled HA fixtures.
- [ ] Verify stale/unknown/unavailable readings and last-success timestamps across a reconnect.
- [ ] Inspect Sections and masonry layouts, mobile, dark/light themes, keyboard focus, and screen-reader names in the actual HA shell.
- [ ] Add the separate frontend repository to HACS as Dashboard, check installation and resource URL; test upgrade when a previous release exists.
- [ ] Check the release contains `rtt-card.js`, matches package version, and contains no credentials or development fixtures in the production bundle.

Publishing and changes to a live HA instance require a user instruction. Do not edit `.storage` directly.
