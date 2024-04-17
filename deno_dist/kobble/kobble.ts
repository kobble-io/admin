import { KobbleOptions, Whoami } from './kobble.types.ts';
import { KobbleGateway } from '../gateway/gateway.ts';
import { HttpClient } from '../utils/http.ts';
import { DEFAULT_BASE_URL } from './kobble.internal.ts';
import { KobbleUsers } from '../users/users.ts';
import { KobbleWebhooks } from '../webhooks/webhooks.ts';
import { KobbleAuth } from '../auth/auth.ts';

export class Kobble {
  private readonly http: HttpClient;
  public readonly gateway: KobbleGateway;
  public readonly users: KobbleUsers;
  public readonly webhooks: KobbleWebhooks;
  public readonly auth: KobbleAuth;

  constructor(secret: string, options: KobbleOptions = {}) {
    this.http = new HttpClient({
      secret,
      baseUrl: options.baseApiUrl ?? DEFAULT_BASE_URL,
    });
    this.gateway = new KobbleGateway({
      http: this.http,
    });
    this.users = new KobbleUsers({
      http: this.http,
    });
    this.auth = new KobbleAuth({
      http: this.http,
      baseUrl: options.baseApiUrl ?? DEFAULT_BASE_URL,
    });
    this.webhooks = new KobbleWebhooks();
  }

  /**
   * Get the project and the user associated with the SDK secret used to authenticate.
   * The user ID is the one of the user that created the secret.
   */
  async whoami(): Promise<Whoami> {
    return this.http.getJson<Whoami>('/auth/whoami');
  }

  /**
   * Ping the Kobble SDK API to ensure that it is reachable and that you are
   * properly authenticated.
   * Returns true if successful, otherwise throws.
   */
  async ping(): Promise<boolean> {
    await this.http.getJson('/ping');

    return true;
  }
}
