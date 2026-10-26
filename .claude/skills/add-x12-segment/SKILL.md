---
name: add-x12-segment
description: Add or change an X12 837/835 segment in packages/x12 following house patterns. Use when touching EDI parsing or building.
---
1. Read packages/x12/README.md and one existing segment module as the pattern.
2. Write a failing round-trip test with a synthetic fixture in tests/fixtures/x12/.
3. Implement parse + build; keep segment and element names from the 005010 guide.
4. Run make test; add a DECISIONS.md entry if you changed a shared type.
