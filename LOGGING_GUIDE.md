# Staging Logging Guide

This project now includes a comprehensive logging solution that allows you to debug staging issues without needing to replicate them locally.

## How It Works

1. **Client-side Logger**: Logs are captured in the browser using `src/utils/logger.ts`
2. **API Endpoint**: Logs are sent to `/api/log` serverless function
3. **Vercel Logs**: The API logs to console, which appears in Vercel's log dashboard

## Usage

Import the logger in any file:

```typescript
import { logger } from './utils/logger';

// Different log levels
logger.debug('Debugging info', { data: { userId: 123 } });
logger.info('User logged in', { data: { email: 'user@example.com' } });
logger.warn('API rate limit approaching', { data: { remaining: 10 } });
logger.error('Failed to save task', {
  data: { taskId: 'abc123', error: 'Network timeout' },
  context: { action: 'save', retryCount: 3 }
});

// Simple logging
logger.log('Something happened', { foo: 'bar' });
```

## When Logs Are Sent

- **Development**: Logs to browser console only (not sent to server)
- **Staging/Preview**: Logs to both browser console AND Vercel logs
- **Production**: Only errors are logged (unless `VITE_ENABLE_DEBUG_LOGS=true`)

## Viewing Logs in Vercel

1. Go to your Vercel dashboard: https://vercel.com
2. Select your project
3. Click on "Logs" in the sidebar
4. Filter by "Serverless Functions"
5. Look for logs prefixed with `[CLIENT LOG]`, `[CLIENT ERROR]`, etc.

## Environment Variables

Add these to your Vercel project settings:

- `VITE_ENABLE_DEBUG_LOGS=true` - Enable debug logs in all environments
- `VITE_VERCEL_ENV` - Automatically set by Vercel (`production`, `preview`, or `development`)

## Example in Vercel Logs

When you call:
```typescript
logger.error('Failed to sync tasks', {
  data: { count: 5, error: 'Connection timeout' },
  context: { userId: '123', attempt: 2 }
});
```

You'll see in Vercel logs:
```
[CLIENT ERROR] [2025-11-05T10:30:45.123Z] Failed to sync tasks
Context: {
  "userId": "123",
  "attempt": 2,
  "userAgent": "Mozilla/5.0...",
  "url": "https://your-app.vercel.app/tasks"
}
Data: {
  "count": 5,
  "error": "Connection timeout"
}
```

## Performance

- Logs are batched and sent every 1 second
- Failed log requests are queued for retry
- Logging failures won't break your app
- Minimal performance impact on user experience

## Replacing console.log

To see logs in Vercel, replace existing `console.log` calls with the logger:

```typescript
// Before
console.log('Syncing tasks...');
console.error('Sync failed:', error);

// After
import { logger } from '@/utils/logger';

logger.info('Syncing tasks...');
logger.error('Sync failed', { data: error });
```
