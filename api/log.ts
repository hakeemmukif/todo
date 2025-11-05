import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const logs = Array.isArray(req.body) ? req.body : [req.body];

    // Process each log entry
    logs.forEach(({ level, message, data, timestamp, context }) => {
      // Format the log message
      const logPrefix = `[CLIENT ${level?.toUpperCase() || 'LOG'}]`;
      const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
      const dataStr = data ? `\nData: ${JSON.stringify(data, null, 2)}` : '';
      const logMessage = `${logPrefix} [${timestamp}] ${message}${contextStr}${dataStr}`;

      // Log to Vercel's console (this will appear in Vercel logs)
      switch (level) {
        case 'error':
          console.error(logMessage);
          break;
        case 'warn':
          console.warn(logMessage);
          break;
        case 'debug':
          console.debug(logMessage);
          break;
        default:
          console.log(logMessage);
      }
    });

    return res.status(200).json({ success: true, count: logs.length });
  } catch (error) {
    console.error('[API ERROR] Failed to process log:', error);
    return res.status(500).json({ error: 'Failed to process log' });
  }
}
