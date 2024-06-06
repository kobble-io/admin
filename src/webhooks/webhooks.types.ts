export const webhookSubscriptions = [
  'user.created',
  'quota.reached',
  'subscription.created',
  'subscription.updated',
  'subscription.deleted',
  'ping',
] as const;

export type WebhookSubscription = (typeof webhookSubscriptions)[number];

export type WebhookSubscriptionData = {
  provider: {
    subscriptionId: string;
    productId: string;
    priceId: string;
  };
  projectId: string;
  productId: string;
  priceId: string;
  userId: string;
  email: string;
  startDate: string | null;
  endedAt: string | null;
  cancelAt: string | null;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  status: string;
  trialEnd: string | null;
  trialStart: string | null;
};

// they all share the same payload structure: this is expected.
export type WebhookSubscriptionCreatedData = WebhookSubscriptionData;
export type WebhookSubscriptionUpdatedData = WebhookSubscriptionData;
export type WebhookSubscriptionDeletedData = WebhookSubscriptionData;

export type WebhookUserCreatedData = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  isVerified: boolean;
};

export type WebhookQuotaReachedData = {
  quotaId: string;
  quotaName: string;
  usage: number;
  limit: number;
  memberId: string;
};

export type WebhookUserCreatedEvent = {
  type: 'user.created';
  data: WebhookUserCreatedData;
};

export type WebhookQuotaReachedEvent = {
  type: 'quota.reached';
  data: WebhookQuotaReachedData;
};

export type WebhookSubscriptionCreatedEvent = {
  type: 'subscription.created';
  data: WebhookSubscriptionCreatedData;
};

export type WebhookSubscriptionUpdatedEvent = {
  type: 'subscription.updated';
  data: WebhookSubscriptionUpdatedData;
};

export type WebhookSubscriptionDeletedEvent = {
  type: 'subscription.deleted';
  data: WebhookSubscriptionDeletedData;
};

export type WebhookPingData = {
  webhookId: string;
};

export type WebhookPingEvent = {
  type: 'ping';
  data: WebhookPingData;
};

export type WebhookEvent =
  | WebhookUserCreatedEvent
  | WebhookPingEvent
  | WebhookQuotaReachedEvent
  | WebhookSubscriptionCreatedEvent
  | WebhookSubscriptionUpdatedEvent
  | WebhookSubscriptionDeletedEvent;

export class WebhookError extends Error {}

export class WebhookConstructEventError extends WebhookError {}
