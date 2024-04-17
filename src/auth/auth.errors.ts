import { ErrorBase } from '../utils/error-base';

export const AuthErrorNames = [
  'ID_TOKEN_VERIFICATION_FAILED',
  'ACCESS_TOKEN_VERIFICATION_FAILED',
  'UNAUTHENTICATED',
] as const;

export type AuthErrorName = (typeof AuthErrorNames)[number];

export class KobbleAuthError extends ErrorBase<AuthErrorName> {
  constructor({
    name,
    message,
    cause,
  }: {
    name: AuthErrorName;
    message: string;
    cause: unknown;
  }) {
    super({ name, message, cause });
  }
}

export class IdTokenVerificationError extends KobbleAuthError {
  constructor(cause: unknown) {
    super({
      name: 'ID_TOKEN_VERIFICATION_FAILED',
      message:
        'ID token verification failed. Are you passing the correct ID token?',
      cause,
    });
  }
}

export class AccessTokenVerificationError extends KobbleAuthError {
  constructor(cause: unknown) {
    super({
      name: 'ACCESS_TOKEN_VERIFICATION_FAILED',
      message:
        'Access token verification failed. Are you passing the correct access token?',
      cause,
    });
  }
}
