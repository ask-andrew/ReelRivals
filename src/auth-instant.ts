import { init, i, tx, id } from '@instantdb/react';

// Instant DB configuration
const APP_ID = process.env.VITE_INSTANT_APP_ID;

// Initialize Instant DB with proper config (matching live scraping script)
const db = init({
  appId: APP_ID
});

// User type from InstantDB schema
export interface InstantUser {
  id: string;
  email: string;
  username: string;
  avatar_emoji: string;
  created_at: number;
}

// Auth functions using InstantDB
export async function signUp(email: string, password: string, username: string, avatarEmoji: string) {
  try {
    console.log('Starting InstantDB signup for:', email);
    
    // Create user in InstantDB
    const result = await db.transact([
      tx.users[id()].create({
        email,
        username,
        avatar_emoji: avatarEmoji
      })
    ]);
    
    console.log('InstantDB signup result:', result);
    
    if (result['tx-id']) {
      // Success - get the created user
      const userData = await db.queryOnce({
        users: {
          $: {
            where: {
              email
            }
          }
        }
      });
      
      return { user: userData.data.users[0] as InstantUser, error: null };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { user: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('Starting InstantDB sign in for:', email);
    
    // Sign in with email/password - this would need custom auth setup
    // For now, return a mock response
    return { user: { id: 'mock', email, username: email.split('@')[0] }, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error };
  }
}

export async function signOut() {
  try {
    console.log('Signing out from InstantDB...');
    
    // Clear InstantDB session
    await db.auth.signOut();
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
}

export async function getCurrentUser(): Promise<{ user: InstantUser | null, error: any }> {
  try {
    console.log('Getting current user from InstantDB...');
    
    const authState = await db.getAuth();
    
    console.log('Current user:', authState);
    
    // getAuth returns the user object directly or null
    return { user: authState as unknown as InstantUser | null, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error };
  }
}

export function createAuthorizationURL(options: { clientName: string, redirectURL: string }) {
  try {
    const authParams = new URLSearchParams({
      client_name: options.clientName,
      redirect_uri: options.redirectURL,
      response_type: 'token',
      scope: 'openid email profile'
    });
    
    const url = `https://api.instantdb.com/oauth?${authParams.toString()}`;
    
    console.log('Created auth URL:', url);
    return url;
  } catch (error) {
    console.error('Error creating auth URL:', error);
    return '';
  }
}

// Legacy function for league codes (if still needed)
export function generateLeagueCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// OAuth callback handler
export function handleOAuthCallback(): Promise<{ user: InstantUser | null, error: any }> {
  return new Promise((resolve) => {
    try {
      console.log('Handling OAuth callback...');
      
      // Get token from URL hash (InstantDB typically uses hash fragments)
      const hash = window.location.hash.substring(1); // Remove the #
      const urlParams = new URLSearchParams(hash);
      
      // Check for various token parameters that InstantDB might use
      const accessToken = urlParams.get('access_token');
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        resolve({ user: null, error: `OAuth error: ${error}` });
        return;
      }
      
      const authToken = accessToken || token;
      
      if (!authToken) {
        console.error('No token found in OAuth callback. Hash:', hash);
        resolve({ user: null, error: 'No token found in OAuth callback' });
        return;
      }
      
      console.log('Found OAuth token:', authToken.substring(0, 10) + '...');
      
      // For now, create a mock user with the token
      // In a real implementation, you'd validate this token with InstantDB
      const mockUser: InstantUser = {
        id: 'oauth-' + Date.now(),
        email: `user-${Date.now()}@example.com`,
        username: 'OAuth User',
        avatar_emoji: '🎬',
        created_at: Date.now()
      };
      
      // Clear the token from URL for security
      window.history.replaceState({}, '', window.location.pathname + window.location.search);
      
      resolve({ user: mockUser, error: null });
    } catch (error) {
      console.error('OAuth callback error:', error);
      resolve({ user: null, error });
    }
  });
}
