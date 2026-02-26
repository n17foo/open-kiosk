# Security Policy

## Supported Versions

| Version  | Supported |
| -------- | --------- |
| latest   | ✅        |
| < latest | ❌        |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue.
2. Email the maintainers at [security@openkiosk.dev](mailto:security@openkiosk.dev) (or use GitHub's private vulnerability reporting feature).
3. Include a description, steps to reproduce, and any relevant logs.
4. We will acknowledge within 48 hours and provide a fix timeline.

## Known Security Considerations

### PIN Authentication

- PINs are currently stored as plaintext in the local database.
- **Planned**: bcrypt or argon2 hashing before production release.
- PINs are never transmitted over the network; they are validated locally.

### Token Storage

- API tokens are stored in `KeyValueRepository` (SQLite).
- On supported platforms, tokens should migrate to `react-native-keychain` for secure storage.

### Local Database

- SQLite database is stored on-device.
- No encryption at rest currently — this is a known gap for sensitive environments.

## Best Practices for Deployers

- Run kiosk devices on a locked-down OS profile.
- Use network-level restrictions to limit outbound traffic.
- Rotate API keys and admin PINs regularly.
- Keep dependencies up to date.
