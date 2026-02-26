# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Project Toolchain**: Updated Expo SDK 54, React Native 0.81, TypeScript 5.9.3.
- **ESLint 9 flat config** with `no-console` error enforcement.
- **Logging system**: `LoggerFactory`, `LoggerInterface`, `useLogger` hook.
- **Utility modules**: `money.ts`, `currency.ts`, `platforms.ts`, `roleAccess.ts`, `uuid.ts`, `electron.ts`, `db.ts`, `dbSchema.ts`.
- **Repository layer**: `KeyValueRepository`, `OrderRepository`, `ProductRepository`.
- **Service layer**: `NotificationService`, `AuditLogService`, `AuthService`, `TokenService`.
- **Auth providers**: `PinAuthProvider`, `KioskPinAuthProvider`.
- **Context providers**: `NotificationProvider`, `OnboardingProvider`, `AuthProvider`, `SettingsProvider`, `DataProvider`.
- **Kiosk services**: `SessionService`, `KioskConfigService`, `AttractScreenService`.
- **Navigation**: `RootNavigator` with auth gate, type-safe params, `OnboardingScreen`.
- **i18n**: Added Spanish, French, German locale files; `createI18nInstance` factory; `useTranslate` hook.
- **Component library**: `Button`, `Input`, `Card`, `StatusBadge`, `Toast`, `ErrorBoundary`, `PinKeypad`, `FloatingSaveBar`.
- **Hooks**: `useTranslate`, `useResponsive`, `useScannerSettings`.
- **App.tsx refactor**: Provider nesting with ErrorBoundary, DataProvider, new contexts.
- **Testing**: Jest config, sample unit tests for `money.ts` and `NotificationService`.
- **Open source files**: `AGENT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `FEATURES.md`.

### Changed

- Replaced all `console.*` calls with `LoggerFactory` logger.
- Updated `.prettierrc`, `.gitignore`, `eslint.config.js` to match reference architecture.
- Expanded `navigation/types.ts` with `RootStackParamList`, `MainTabParamList`, `MoreStackParamList`, `KioskFlowParamList`.
- Expanded `utils/theme.ts` with `lightColors`, `borderRadius`, `typographyPresets` aliases.
