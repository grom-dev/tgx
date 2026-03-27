# Release Notes v2.4.0

We're excited to announce **Grom 2.4.0** with _major performance improvements_ and new features!

## What's New

- **Real-time sync** now uses `WebSocket` connections instead of polling
- Added support for ~~legacy API~~ modern `REST` endpoints
- Integration with [OpenAI](https://openai.com) and [Anthropic](https://anthropic.com) APIs

## Migration Checklist

- [x] Update environment variables
- [x] Run database migrations
- [ ] Test webhook endpoints
- [ ] Deploy to production

---

## Code Example

```typescript
const client = new GromClient({ apiKey: process.env.API_KEY })
await client.connect()
```

> **Note:** Make sure to handle connection errors gracefully in production environments.
