# Setup Guide

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **Expo CLI**: `npx expo` (included via Expo SDK)

## Installation

```bash
git clone https://github.com/your-org/open-kiosk.git
cd open-kiosk
npm install
```

## Running

### Mobile (Expo Go)

```bash
npm start
```

Scan the QR code with Expo Go on your device.

### Web

```bash
npm run web
```

### Electron (Desktop)

```bash
npm run desktop:build
```

## Environment

No `.env` file is required for basic development. Platform API keys (Shopify, Square, etc.) are configured at runtime through the onboarding flow and stored in the local SQLite database via `KeyValueRepository`.

## Linting & Formatting

```bash
npm run lint       # ESLint (flat config, no-console enforced)
npm run format     # Prettier
```

## Testing

```bash
npm test           # Run all tests
npm run test:cov   # Run with coverage report
```

## Project Structure

```
├── App.tsx                 # Root component with provider nesting
├── components/ui/          # Reusable UI components
├── contexts/               # New architecture React providers
├── context/                # Legacy React providers
├── hooks/                  # Custom hooks
├── locales/                # i18n JSON files (en, es, fr, de)
├── navigation/             # RootNavigator, MainNavigator, types
├── repositories/           # Data access layer (SQLite)
├── screens/                # Screen components
├── services/               # Business logic singletons
├── utils/                  # Pure utility functions
├── __tests__/              # Jest test files
├── docs/                   # Documentation
├── AGENT.md                # AI agent instructions
├── CONTRIBUTING.md         # Contribution guide
├── SECURITY.md             # Security policy
├── CHANGELOG.md            # Version history
└── FEATURES.md             # Feature list
```
