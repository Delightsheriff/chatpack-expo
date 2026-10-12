# chatpack-expo

React Native / Expo for [Chatpack](https://github.com/chddaniel/chatpack).

| Path | What |
| --- | --- |
| [`packages/chatpack-expo`](packages/chatpack-expo) | Transport adapter for `@chatpack/client` — SSE over XHR, bearer auth, AppState lifecycle, optimistic sends |
| [`packages/chatpack-expo-ui`](packages/chatpack-expo-ui) | Native-feeling, fully customizable chat UI components |
| [`apps/example`](apps/example) | Expo Router example app |

Each package keeps its own history from before the monorepo (imported with a subtree merge).

## Getting started

Requires Node 20+ and **npm 11** (npm 10 crashes resolving this workspace — `npx npm@11 install` works without upgrading globally).

```sh
npm install          # installs every workspace and builds both packages
npm run server       # demo Chatpack backend on :3000
npm run example      # Expo dev server — open in Expo Go (SDK 57)
```

Other scripts: `npm run dev` (rebuild the UI package on change), `npm run typecheck`, `npm test`.

The example reaches the demo server through the host Metro runs on, so the iOS simulator, the Android emulator (`adb reverse tcp:3000 tcp:3000` not required) and a phone on the same Wi-Fi all work.
