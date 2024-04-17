import { Buffer } from "node:buffer";
import { createHmac } from 'node:crypto';
import { WebhookConstructEventError, WebhookEvent } from './webhooks.types.ts';

export class KobbleWebhooks {
  constructor() {}

  private serializeBody(body: Buffer | string | unknown): Buffer {
    if (body instanceof Buffer) {
      return body;
    }

    if (typeof body === 'object') {
      return Buffer.from(JSON.stringify(body));
    }

    return Buffer.from(`${body}`);
  }

  /**
   * Construct a webhook event payload and verify its integrity.
   *
   * The `body` parameter is eventually serialized to a `Buffer` object in order to compute
   * the signature.
   *
   * A `Buffer` can therefore be passed directly, but other types are accepted as well:
   *
   * - A JavaScript object is stringified by calling `JSON.stringify`.
   * - On any other type, native string coercion is attempted. The result is assumed to be UTF-8 encoded.
   *
   * The expected `signature` is the one sent in the webhook header `Kobble-Signature`.
   *
   * The `secret` is the one associated with the webhook expected to receive the event.
   *
   * The fully typesafe payload is returned if the signature is valid.
   */
  constructEvent(
    body: Buffer | string | object,
    signature: string,
    secret: string,
  ): WebhookEvent {
    const serializedBody = this.serializeBody(body);
    const constructedSignature = createHmac(
      'sha256',
      Buffer.from(secret, 'hex'),
    )
      .update(serializedBody)
      .digest('hex');

    if (signature !== constructedSignature) {
      throw new WebhookConstructEventError(
        `Signature verification failed. Did you pass the correct secret?`,
      );
    }

    return JSON.parse(serializedBody.toString());
  }
}
