import crypto from 'crypto';

const BASE62_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generates a random Base62 short code of specified length.
 * Uses cryptographically secure random bytes.
 */
export function generateRandomCode(length: number = 6): string {
  let result = '';
  const charactersLength = BASE62_CHARACTERS.length;
  
  // Generate random bytes to ensure secure distribution
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charactersLength;
    result += BASE62_CHARACTERS[randomIndex];
  }
  
  return result;
}

/**
 * Validates whether a custom alias contains only valid characters (alphanumeric, dashes, underscores).
 */
export function isValidAlias(alias: string): boolean {
  const aliasRegex = /^[a-zA-Z0-9\-_]{3,30}$/;
  return aliasRegex.test(alias);
}
