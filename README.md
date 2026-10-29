# CPFB Optimal Solver

Browser tool that finds **optimal CPFB solutions** for the 3x3 cube: a 1x2x3 block built around a fixed reference corner while the corners end up solvable in 2-gen. No dependencies, no build step.

## Definitions
- **Reference corner**: DBR (right hand) or DBL (left hand). It never moves.
- **Block**: the 1x2x3 on the right (right hand) or left (left hand) side around that corner: 2 corners, 3 edges and the side center.
- **CP solved**: all corners can be solved with 2-gen (right hand: `L Lw U Uw`; left hand: `R Rw U Uw`), orientation included. The other six corners do not have to be in their home slots.
- **Centers** may end anywhere.
- **Moves**: every face, wide and slice turn that avoids the reference corner, each counted as one move. Right hand: `L M Lw`, `U Uw`, `F S Fw`. Left hand: `R M Rw`, `U Uw`, `F S Fw`. `E` is not used (it is `Uw U'`).
- **8 orientations**: with the chosen U/D color pair, each of the 8 corners takes a turn as the reference corner.
- **CP line**: CP solved + the 1x1x3 bar (two bottom corners and the bottom edge).

## Options
| Option | Effect |
|---|---|
| Hand | Left (default) or Right |
| UD color | Which color pair sits on U/D (decides the 8 orientations) |
| Fewest F/Fw | Finds the fewest F/Fw moves that corner can be solved with, then the shortest solutions with that many (S not counted) |
| No M | Never uses M |
| Disable CP | Only the 1x2x3 block, corners ignored |
| Optimal CP line | Solutions must reach a CP line in the fewest possible moves, then finish the CPFB as short as possible. Shows `x+y=z` (moves to CP line + rest = total) |
| Move cost (S, Uw, M x 3 amounts) | Counts those moves as more (or less, min 0.25) than 1. Solutions are ranked by total cost |
| `+1` button (per row) | Shows the best solutions that cost one more. With Optimal CP line the extra move goes into reaching the CP line |
| Generate Scramble | Random-state scramble (two-phase solver), no repeated faces |

Rows are sorted from shortest to longest. Among solutions of equal cost the first one shown has its last F/Fw move earliest, then the fewest S moves; the arrow expands the rest.

The scramble is applied with white on top and green in front. Results are written in the hold shown in the "Top / Front" column.

## Files
- `index.html`, `style.css`, `app.js`: the page
- `engine.js`: solver (no DOM; also `require()`-able from Node)
- `test.js`: self-checks (`node test.js`)
- `.nojekyll`: tells GitHub Pages to serve the files as they are

## Deploy on GitHub Pages
1. Put these files in a repository (root, or a `docs/` folder).
2. Settings > Pages > Deploy from a branch > choose the branch and `/ (root)` or `/docs`.
3. Open `https://<user>.github.io/<repo>/`.

It also works by opening `index.html` directly.

## Tests
`node test.js` checks the cube model, that every solution reaches the goal, that no shorter solution exists (brute force on short scrambles), and the options above.

## Notes
- First Solve builds lookup tables (a few seconds); later solves take about a second for all 8 corners. Costs below 1 slow the search down a lot.
- Notation (M follows L, S follows F, wide moves follow their face) and the x/y/z rotation names were derived, not copied from a reference, so spot-check them against your own convention.
