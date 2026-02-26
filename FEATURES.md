# Features

## Core

- **Multi-platform**: iOS, Android, Web, Electron (desktop).
- **Self-service kiosk mode**: Attract screen, session management, idle timeout.
- **Product catalog**: Browse, search, category filtering.
- **Shopping basket**: Add, remove, quantity management.
- **Checkout flow**: Draft orders, payment integration.
- **Multiple payment providers**: Square, Adyen, Stripe, Cash, Mock.

## Authentication

- **PIN-based auth**: Staff PIN login for POS mode.
- **Kiosk admin PIN**: Separate admin authentication for kiosk configuration.
- **Token management**: API token storage, expiration, and auto-refresh.
- **Role-based access**: Cashier, Manager, Admin roles with tab/menu restrictions.

## E-Commerce Integrations

- **Shopify** (via Storefront API)
- **WooCommerce** (via REST API)
- **Square** (via Catalog + Orders API)
- **Offline / In-Memory** demo mode

## Localization

- English, Spanish, French, German.
- Device locale auto-detection.
- `useTranslate` hook for namespaced translations.

## Kiosk Features

- **Attract screen**: Configurable image/video/default branding.
- **Session management**: Auto-timeout, idle detection, activity tracking.
- **Kiosk configuration**: Idle timeout, categories, receipt delivery, branding.
- **Accessibility**: Min touch targets (48px), large font mode, ARIA roles.

## Notifications & Audit

- **In-app notifications**: Pub/sub with read/unread tracking.
- **Audit log**: Rolling KV-backed log with CSV export and action filtering.

## Developer Experience

- **TypeScript strict**: No `any`, full type safety.
- **ESLint 9 flat config**: `no-console` enforcement.
- **Logging**: Structured logging via `LoggerFactory` with transports.
- **Repository pattern**: SQL CRUD with parameterized queries.
- **Singleton services**: Thread-safe, no async constructors.
- **Jest testing**: Unit tests with coverage.
- **Prettier**: Consistent code formatting.
- **Husky + lint-staged**: Pre-commit hooks.
