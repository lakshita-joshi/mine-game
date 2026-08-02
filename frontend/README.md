# Mines — Frontend

React + Vite + Tailwind frontend for the Mines game, with a full
login → dashboard → game flow. The game itself runs against a local
mock RNG right now — no backend required to try it — but auth pages
call the real Express backend and require it to be running.

## Folder structure

```
src/
  api/            fetch wrappers for the real Express backend
  context/
    AuthContext.jsx   app-wide auth state (user, login, register,
                      logout), backed by GET /api/auth/me on load
  components/
    auth/
      ProtectedRoute.jsx  redirects to /login if not authenticated
    layout/
      NavBar.jsx        shared top nav (logo, balance, logout)
      AuthCard.jsx      centered card wrapper for login/register
    game/               presentational components for the Mines UI
                        (ControlsPanel, GridPanel, Tile, DepthGauge,
                        ResultBanner, ProvablyFairBadge)
  hooks/
    useMinesGame.js   all game state + actions, separate from UI
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    DashboardPage.jsx   game catalogue — currently Mines only,
                        Wheel Spin shown as "coming soon"
    MinesGamePage.jsx   composes the game components using the hook
  theme/
    colors.js     raw hex tokens, mirrors tailwind.config.js
  utils/
    gameMath.js   multiplier math, mirrors the backend's
                  services/minesLogic.js
    mockRng.js    local mine placement for offline demo —
                  delete once the real backend is wired in
  styles/
    index.css     Tailwind directives + the few effects that
                  need raw CSS (sonar sweep, 3D tile flip)
```

## Routes

| Path | Access | Renders |
|---|---|---|
| `/login` | public | LoginPage |
| `/register` | public | RegisterPage |
| `/dashboard` | protected | DashboardPage (game catalogue) |
| `/games/mines` | protected | MinesGamePage |

`ProtectedRoute` checks `AuthContext`'s `status` (`loading` /
`authenticated` / `unauthenticated`) and redirects to `/login` if
there's no valid session.

## Run it

```bash
npm install
npm run dev
```

The auth pages (login/register) need the real backend running at
`VITE_API_BASE_URL` (see `.env.example`) — they're not mocked. The
Mines game itself still runs on local mock data regardless.

## Wiring up the real game backend

Everything needed is already in `src/api/minesApi.js` — it's just not
called yet from `useMinesGame`. In `src/hooks/useMinesGame.js`:

- `startGame` → replace `mockMinePositions(...)` with
  `await minesApi.start({ stake, gridSize: GRID_SIZE, mineCount, clientSeed })`,
  store the returned `sessionId` in state.
- `revealTile` → replace the local `mines.has(idx)` check with
  `await minesApi.reveal({ sessionId, tileIndex: idx })` and branch
  on `response.safe`.
- `cashOut` → replace the local payout calculation with
  `await minesApi.cashOut({ sessionId })`, then call the auth
  context's `setCoins(response.newBalance)` (already passed in via
  the `onBalanceChange` param from `MinesGamePage`).

Set `VITE_API_BASE_URL` in `.env` (copy `.env.example`) to point at
your Express server. The API client already sends
`credentials: 'include'` so the httpOnly JWT cookie from `/login`
is sent automatically.

