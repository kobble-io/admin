export const webhookSubscriptions = ['user.created', 'ping'] as const;

export type WebhookSubscription = (typeof webhookSubscriptions)[number];

export type WebhookUserCreatedData = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  isVerified: boolean;
};

export type WebhookUserCreatedEvent = {
  type: 'user.created';
  data: WebhookUserCreatedData;
};

export type WebhookPingData = {
  webhookId: string;
};

export type WebhookPingEvent = {
  type: 'ping';
  data: WebhookPingData;
};

export type WebhookEvent = WebhookUserCreatedEvent | WebhookPingEvent;

export class WebhookError extends Error {}

export class WebhookConstructEventError extends WebhookError {}
