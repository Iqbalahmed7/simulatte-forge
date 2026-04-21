import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('[Forge] JWT_SECRET must be set in production.');
}

const getJwtSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
  );

export interface SessionPayload {
  sub: string;       // user email
  tenantId: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(await getJwtSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, await getJwtSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('forge_session')?.value;
  if (!token) return null;
  return verifySession(token);
}
