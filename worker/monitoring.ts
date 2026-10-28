// Deliberately accept only fixed operational codes, never request data or exceptions.
export type MailIssue = 'send_configuration' | 'send_rejected' | 'send_response_invalid' |
  'send_timeout_or_network' | 'contact_runtime_error' | 'email.failed' | 'email.bounced' |
  'email.delivery_delayed' | 'email.suppressed' | 'email.complained' | 'monitor_runtime_error';

export const mailIssues = new Set<string>(['send_configuration', 'send_rejected', 'send_response_invalid',
  'send_timeout_or_network', 'contact_runtime_error', 'email.failed', 'email.bounced',
  'email.delivery_delayed', 'email.suppressed', 'email.complained', 'monitor_runtime_error']);

export function reportMailIssue(environment: string, issue: MailIssue): void {
  if (environment !== 'production' && environment !== 'staging') return;
  console.error({ message: 'TG_CONTACT_ALERT', environment, issue });
}

export async function persistMailIssue(env: {
  ENVIRONMENT: string; DELIVERY_STATUS?: DurableObjectNamespace;
}, issue: MailIssue): Promise<void> {
  reportMailIssue(env.ENVIRONMENT, issue);
  if (!['staging', 'production'].includes(env.ENVIRONMENT)) return;
  if (!env.DELIVERY_STATUS) throw new Error('Failure monitoring is not configured');
  const key = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
  const response = await env.DELIVERY_STATUS.get(env.DELIVERY_STATUS.idFromName('contact-delivery')).fetch(
    'https://status.internal/record', { method: 'POST', body: JSON.stringify({ key, environment: env.ENVIRONMENT, issue }) });
  if (!response.ok) throw new Error('Failure monitoring unavailable');
}
