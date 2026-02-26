# AGENT.md — OpenKiosk

## Project Overview

OpenKiosk is an open-source, cross-platform self-service kiosk application built with **Expo SDK 54**, **React Native 0.81**, and **TypeScript 5.9**. It runs on iOS, Android, Web, and Electron (desktop).

## Architecture

| Layer        | Directory        | Purpose                                                          |
| ------------ | ---------------- | ---------------------------------------------------------------- |
| Utils        | `utils/`         | Pure functions — money, currency, DB, platform detection         |
| Repositories | `repositories/`  | SQL data access — KV, Order, Product                             |
| Services     | `services/`      | Singletons — Auth, Notification, AuditLog, Kiosk, Logger         |
| Contexts     | `contexts/`      | React providers — Auth, Settings, Onboarding, Notification, Data |
| Hooks        | `hooks/`         | Named-export hooks — useLogger, useTranslate, useResponsive      |
| Components   | `components/ui/` | Default-export UI primitives — Button, Input, Card, Toast        |
| Screens      | `screens/`       | Default-export screen components                                 |
| Navigation   | `navigation/`    | RootNavigator with auth gate, type-safe params                   |
| Locales      | `locales/`       | i18n JSON files (en, es, fr, de)                                 |

## Coding Conventions

- **No `any` types** — use `unknown` and narrow.
- **No barrel exports** — import directly from files.
- **No `console.*`** — use `LoggerFactory` / `useLogger`.
- **No hardcoded config** — use `KeyValueRepository` or env.
- **Services are singletons** — private constructor + `getInstance()`.
- **Money** — integer cents internally via `utils/money.ts`.
- **`isLoading`** not `loading` for boolean state.
- **Named exports** for hooks, **default exports** for components/screens.
- **Role access** defaults to `'cashier'`.

## Key Commands

```bash
npm start          # Expo dev server
npm run web        # Web dev server
npm run lint       # ESLint
npm run format     # Prettier
npm test           # Jest
npm run test:cov   # Jest with coverage
```

## Dependencies

- Expo SDK 54 / React Native 0.81
- TypeScript 5.9.3
- ESLint 9.x (flat config)
- Prettier 3.x
- i18next + react-i18next
- expo-sqlite for local storage
- @react-navigation/stack + native
