# Architecture Overview

## Layer Diagram

```
┌─────────────────────────────────────────┐
│              Screens / Pages            │
├─────────────────────────────────────────┤
│           Components (ui/)              │
├─────────────────────────────────────────┤
│         Hooks (useLogger, etc.)         │
├─────────────────────────────────────────┤
│     Context Providers (contexts/)       │
├─────────────────────────────────────────┤
│     Services (auth, kiosk, audit)       │
├─────────────────────────────────────────┤
│     Repositories (KV, Order, Product)   │
├─────────────────────────────────────────┤
│         Utils (money, db, etc.)         │
└─────────────────────────────────────────┘
```

## Key Patterns

### Singleton Services

All services use a private constructor + static `getInstance()`. No async constructors — async initialization is done via a separate `load()` or `init()` method.

### Repository Pattern

Repositories encapsulate SQL CRUD with parameterized queries against expo-sqlite. They return typed objects, never raw rows.

### Provider Nesting (App.tsx)

```
GestureHandlerRootView
  ErrorBoundary
    SafeAreaProvider
      I18nextProvider
        DataProvider          ← DB init
          NotificationProvider
            AppProvider       ← legacy
              PlatformProvider ← legacy
                OnboardingProvider
                  AuthProvider
                    SettingsProvider
                      CatalogProvider ← legacy
                        BasketProvider ← legacy
                          NavigationContainer
                            RootNavigator
```

### Auth Gate (RootNavigator)

The `RootNavigator` conditionally renders:

1. **Onboarding** — if `!isOnboarded`
2. **Login** — if `!isAuthenticated`
3. **Main** — otherwise

### Logging

- `LoggerFactory` creates named loggers.
- `useLogger(context)` hook for components.
- All `console.*` calls replaced — ESLint enforces `no-console: error`.

### Money

- All monetary arithmetic uses integer cents internally via `utils/money.ts`.
- `toCents()` / `toDollars()` for conversion.
- `formatMoney()` for display with currency symbols.
