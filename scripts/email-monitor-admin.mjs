import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Keep the key outside the repository. Never pass it in command arguments or URLs.
const [action = 'status', revision] = process.argv.slice(2);
if (!['status', 'history', 'acknowledge', 'test'].includes(action) ||
    (action === 'test' && revision !== '--send-alert') ||
    (action === 'acknowledge' && !/^[a-f0-9-]{36}$/.test(revision ?? ''))) {
  throw new Error('Usage: node scripts/email-monitor-admin.mjs status | history | acknowledge <reviewed-revision> | test --send-alert');
}
const keyFile = process.env.MONITOR_ADMIN_KEY_FILE ?? join(homedir(), '.config/timgabaree-email-monitor/admin-key');
const key = (await readFile(keyFile, 'utf8')).trim();
const response = await fetch(`https://timgabaree-com-astro-email-monitor.timgabaree-com-astro.workers.dev/admin/${action}`, {
  method: ['status', 'history'].includes(action) ? 'GET' : 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  ...(action === 'acknowledge' ? { body: JSON.stringify({ revision }) } : {}),
  ...(action === 'test' ? { body: JSON.stringify({ scenario: 'primary-write-unavailable' }) } : {}),
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok) throw new Error(`Monitor administration returned ${response.status}; nothing was assumed cleared.`);
console.log(['status', 'history'].includes(action) ? await response.json() : action === 'test'
  ? 'Labeled failure test latched. Expect an automatic alert; review and acknowledge its exact revision after verification.'
  : 'Reviewed incident acknowledged. Newer failures cannot be cleared by this revision.');
