import { createHmac, timingSafeEqual } from 'node:crypto';

import type { TokenPayload, TokenService } from '../application/authentication.types';

type JwtPayload = TokenPayload & {
  exp: number;
  iat: number;
};

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function parseJwtPart(part: string): unknown {
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
}

export class HmacJwtTokenService implements TokenService {
  private readonly secret: string;
  private readonly expiresIn: number;

  constructor(secret: string, expiresIn: number) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  async sign(payload: TokenPayload): Promise<{ accessToken: string; expiresIn: number }> {
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
    const body = base64UrlJson({ ...payload, iat: now, exp: now + this.expiresIn });
    const signature = this.signSegments(header, body);

    return {
      accessToken: `${header}.${body}.${signature}`,
      expiresIn: this.expiresIn
    };
  }

  async verify(accessToken: string): Promise<TokenPayload> {
    const [header, body, signature] = accessToken.split('.');

    if (!header || !body || !signature || !this.signatureMatches(header, body, signature)) {
      throw new Error('Invalid token.');
    }

    const payload = parseJwtPart(body) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);

    if (!payload.sub || !payload.email || !payload.role || payload.exp <= now) {
      throw new Error('Invalid token.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }

  private signSegments(header: string, body: string): string {
    return createHmac('sha256', this.secret).update(`${header}.${body}`).digest('base64url');
  }

  private signatureMatches(header: string, body: string, signature: string): boolean {
    const expected = Buffer.from(this.signSegments(header, body), 'base64url');
    const actual = Buffer.from(signature, 'base64url');

    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
}
