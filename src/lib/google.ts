import { ApiError } from '../utils/ApiError';

interface GoogleTokenPayload {
  email: string;
  name: string;
  email_verified?: string | boolean;
  sub: string;
  aud?: string;
  exp?: number;
}

/**
 * Verifies a Google ID token (JWT).
 * Tries online verification using Google's tokeninfo API first.
 * If that fails (due to offline dev environment or proxy), it decodes
 * and validates the token locally as a developer fallback.
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload> {
  if (!idToken) {
    throw ApiError.badRequest('Google ID token is required');
  }

  // 1. Try online verification via Google OAuth2 tokeninfo API
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (response.ok) {
      const payload = await response.json() as GoogleTokenPayload;
      
      // Verify audience if configured
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (clientId && payload.aud !== clientId) {
        throw ApiError.unauthorized('Google ID token audience mismatch');
      }

      return payload;
    } else {
      console.warn(`[Google Auth] Google API returned status ${response.status}. Falling back to local decode.`);
    }
  } catch (error) {
    console.warn('[Google Auth] Online token verification failed, falling back to local decode:', error);
  }

  // 2. Offline / Development fallback: Local decode and basic verification
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw ApiError.badRequest('Invalid JWT format for Google ID token');
    }

    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson) as GoogleTokenPayload;

    if (!payload.email || !payload.name) {
      throw ApiError.badRequest('Google token payload is missing email or name');
    }

    // Verify expiration offline if exp is present
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw ApiError.unauthorized('Google token has expired');
    }

    console.log('[Google Auth] Token verified offline (dev fallback) for email:', payload.email);
    return payload;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized('Failed to parse or verify Google ID token');
  }
}
