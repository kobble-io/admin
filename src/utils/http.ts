export interface HttpClientConfig {
  baseUrl: string;
  secret: string;
}

const SdkSecretHeaderName = 'Kobble-Sdk-Secret';

export class HttpClient {
  private readonly userAgent;

  private makeUrl(path: string, params = {}) {
    const url = new URL(path, this.config.baseUrl);

    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, `${v}`);
    }

    return url.toString();
  }

  constructor(private readonly config: HttpClientConfig) {
    this.userAgent = `Kobble NodeJS SDK/1.x`;
  }

  async getJson<T>(path: string, params = {}): Promise<T> {
    const res = await fetch(this.makeUrl(path, params), {
      headers: {
        [SdkSecretHeaderName]: this.config.secret,
        'User-Agent': this.userAgent,
      },
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const json = await res.json();

    return json;
  }

  async postJson<T, U = Record<string, unknown>>(
    path: string,
    payload: U,
  ): Promise<T> {
    const res = await fetch(this.makeUrl(path), {
      method: 'POST',
      headers: {
        [SdkSecretHeaderName]: this.config.secret,
        'Content-Type': 'application/json',
        'User-Agent': this.userAgent,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }
}
