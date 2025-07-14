# Commit Message

## Type
feat

## Scope
excavation, waste-disposal, ui

## Description
Restructure waste disposal as a sub-option of excavation, add conditional skip bin fields, and improve form UX

## Summary
- Refactored the waste disposal section into an excavation section, making excavation the primary service and waste disposal an optional sub-service.
- Added new excavation fields: type, area, depth, materials, difficulty, equipment, hours, workers, and notes.
- Moved waste disposal fields under excavation, with a toggle for "Is waste disposal required?".
- Made "Distance to disposal site", "Total loads", and "Skip bin hire days" fields visible only when a skip bin size is selected.
- Added a conditional "Skip Bin Details" section that appears when a skip size is chosen.
- Updated JavaScript logic to handle new conditional sections, field visibility, and real-time calculations.
- Enhanced form data transformation, validation, and loading to support the new structure.
- Improved results display to show excavation and waste disposal details as appropriate.
- Improved user experience by reducing form clutter and clarifying service hierarchy.

Files changed: index.html, scripts.js, search.html, search.js, commit.md 