# Changelog

## 0.2.0

- Add **All monitored trains** mode, selected by default for new cards. Existing configurations retain their selected rows and ordering.
- Discover current monitored calls across all home stations and update rows as HA adds/removes entities. Automatic rows sort by scheduled time.
- Follow weekly repeating trackers under their stable entity IDs; keep prior final results separate from the next weekly lookup target.
- Preserve selected-list names and sensor overrides when switching modes.
- Exclude the integration's separate platform-status sensor from legacy registry discovery.

## 0.1.0

- Initial card, visual editor, status/platform/freshness display, HACS bundle, and simulated browser preview.
