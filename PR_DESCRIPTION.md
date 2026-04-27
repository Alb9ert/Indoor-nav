## Description

Adds the ability to connect navigation nodes across floors using stairs and elevators. Also fixes a bug where the search bar was breaking the 3D map by writing the wrong data into a shared cache.

Closes #, closes #, ...

## How to run

1. Go to the map and activate the **Connect edges** tool from the left toolbar.
2. Click the **Layers icon** in the action bar at the bottom to switch to cross-floor mode.
3. Click a **stair** or **elevator** node on the current floor — the floor picker opens automatically.
4. Pick a different floor.
5. Click a node of the **same type** (stair→stair, elevator→elevator) to create the edge.
6. Switch to **3D mode** (now unlocked in cross-floor mode) to see the diagonal edge spanning between floors.
7. Click an existing cross-floor edge to view its details (distance, active state) in the side panel.

## Changes made

- Added `ConnectFloorEdgeLayer` — a new Three.js layer that handles cross-floor edge creation. Only stair and elevator nodes are shown. After picking a source node the floor picker opens automatically, and only same-type nodes on the new floor are clickable as targets.
- Added `ConnectEdgeActions` — a toggle button (Layers icon) in the action bar that switches the connect-edge tool between same-floor and cross-floor mode.
- Added `connectEdgeMode` state to `MapContext` so both the action bar button and the canvas layer stay in sync. Mode resets to same-floor whenever the tool is changed.
- Cross-floor edge distance includes a **+3.25 per floor** bonus on top of the normal horizontal distance, so pathfinding correctly prefers fewer floor changes.
- Cross-floor edges are drawn as purple lines in the layer so you can see what is already connected. Clicking one highlights it and opens the existing edge detail panel.
- Unlocked the 2D/3D toggle while in cross-floor mode so you can tilt the view and see the edges spanning between floors.
- Fixed a bug where the fuzzy search bar was writing room data without `vertices` into the shared React Query `["rooms"]` cache, causing the 3D canvas to crash with "can't access property map, vertices is undefined". Fixed by making the search hook use the same `getAllRoomsData` server function as the rest of the app.

## UI changes (Screenshots)

<!-- Add a screenshot of the Layers toggle in the action bar and a 3D view of a cross-floor edge -->

## Checklist

- [ ] PR title follows the format `Feat/`, `Fix/` or `Chore/` (e.g. `Feat/Add A* pathfinding`)
- [ ] Self-assigned this PR
- [ ] Added relevant labels (e.g. `feature`, `fix`, `chore`)
- [ ] Linked a PBI from GitHub Projects
- [ ] Manually tested the features touched by the files changed
- [ ] Project builds locally (`pnpm build`)
- [ ] No unrelated changes snuck in
