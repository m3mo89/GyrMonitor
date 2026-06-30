import { pbkdf2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import type { PasswordHasher } from '../application/authentication.types';

const pbkdf2Async = promisify(pbkdf2);
const keyLength = 32;
const digest = 'sha256';

export class NodePasswordHasher implements PasswordHasher {
  private readonly iterations: number;

  constructor(iterations: number) {
    this.iterations = iterations;
  }

  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('base64url');
    const derived = await pbkdf2Async(password, salt, this.iterations, keyLength, digest);

    return `pbkdf2:${digest}:${this.iterations}:${salt}:${derived.toString('base64url')}`;
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    const [algorithm, hashDigest, iterations, salt, expected] = passwordHash.split(':');

    if (algorithm !== 'pbkdf2' || hashDigest !== digest || !iterations || !salt || !expected) {
      return false;
    }

    const derived = await pbkdf2Async(password, salt, Number(iterations), keyLength, hashDigest);
    const expectedBuffer = Buffer.from(expected, 'base64url');

    return expectedBuffer.length === derived.length && timingSafeEqual(expectedBuffer, derived);
  }
}
