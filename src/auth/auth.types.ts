export type VerifyAccessTokenOptions = {
  applicationId?: string;
};

export type VerifyIdTokenOptions = {
  applicationId?: string;
};

export type RawAccessTokenPayloadClaims = {
  sub: string;
  project_id: string;
};

export type RawIdTokenPayloadClaims = {
  sub: string;
  id: string;
  email: string | null;
  name: string | null;
  picture_url: string | null;
  is_verified: boolean;
  stripe_id: string | null;
  updated_at: string;
  created_at: string;
};

export type VerifyAccessTokenResult = {
  userId: string;
  projectId: string;
  claims: RawAccessTokenPayloadClaims;
};

export type IdTokenUser = {
  id: string;
  email: string | null;
  name: string | null;
  pictureUrl: string | null;
  isVerified: boolean;
  stripeId: string | null;
  updatedAt: Date;
  createdAt: Date;
};

export type VerifyIdTokenResult = {
  userId: string;
  user: IdTokenUser;
  claims: RawIdTokenPayloadClaims;
};
