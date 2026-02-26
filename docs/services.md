# Services Reference

## LoggerFactory (`services/logger/`)

- **Pattern**: Singleton with transport system.
- **Usage**: `LoggerFactory.getInstance().createLogger('context')` or `useLogger('context')` hook.
- **Levels**: `debug`, `info`, `warn`, `error`.

## NotificationService (`services/notifications/`)

- **Pattern**: Singleton in-memory pub/sub.
- **API**: `notify(title, message, severity)`, `addListener()`, `getAll()`, `markRead()`, `clearAll()`.

## AuditLogService (`services/audit/`)

- **Pattern**: Singleton KV-backed rolling log.
- **API**: `log(action, data?)`, `getLog()`, `getByAction()`, `exportCsv()`, `clear()`.

## AuthService (`services/auth/`)

- **Pattern**: Singleton with pluggable `AuthMethodProvider` instances.
- **Providers**: `PinAuthProvider`, `KioskPinAuthProvider`.
- **API**: `authenticate(method, credential)`, `logout()`, `getCurrentUser()`, `loadConfig()`.

## TokenService (`services/auth/`)

- **Pattern**: Singleton managing API tokens.
- **API**: `storeToken()`, `getToken()`, `clearTokens()`, `refreshToken()`.

## SessionService (`services/kiosk/`)

- **Pattern**: Singleton session state machine.
- **States**: `attract` → `active` → `idle` → `attract` (or `admin`).
- **API**: `startSession()`, `endSession()`, `recordActivity()`, `enterAdminMode()`.

## KioskConfigService (`services/kiosk/`)

- **Pattern**: Singleton KV-backed config.
- **API**: `load()`, `getConfig()`, `update(partial)`, `reset()`.

## AttractScreenService (`services/kiosk/`)

- **Pattern**: Singleton, reads from KioskConfigService.
- **API**: `getContent()` → `{ type, url, brandName, brandIcon }`.
