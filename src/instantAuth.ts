import { db, InstantUser } from './instant';

// Auth functions using Instant DB
export async function signUp(email: string, username: string, avatarEmoji: string): Promise<{ user: InstantUser | null, error: any }> {
  try {
    console.log('Instant DB signup for:', email);
    
    // Check if user already exists
    const existingUsers = db.useQuery({ users: { where: { email: email } } });
    if (existingUsers.data && existingUsers.data.users.length > 0) {
      return { user: null, error: { message: 'User with this email already exists' } };
    }
    
    // Create new user
    const newUser = {
      email,
      username,
      avatar_emoji: avatarEmoji,
      created_at: Date.now().toString(),
    };
    
    const result = db.transact(
      db.tx.users[db.id()].update(newUser)
    );
    console.log('Instant DB signup result:', result);
    
    // Return the created user
    const userId = (result as any).id || db.id();
    return { user: { id: userId, ...newUser }, error: null };
  } catch (error) {
    console.error('Instant DB signup error:', error);
    return { user: null, error };
  }
}

export async function signIn(email: string): Promise<{ user: InstantUser | null, error: any }> {
  try {
    console.log('Instant DB signin for:', email);
    
    // Find user by email
    const users = db.useQuery({ users: { where: { email: email } } });
    
    if (!users.data || users.data.users.length === 0) {
      return { user: null, error: { message: 'User not found' } };
    }
    
    const user = users.data.users[0];
    console.log('Instant DB signin success:', user);
    
    return { user, error: null };
  } catch (error) {
    console.error('Instant DB signin error:', error);
    return { user: null, error };
  }
}

export async function getCurrentUser(): Promise<InstantUser | null> {
  try {
    // For demo purposes, return the first user or null
    const users = db.useQuery({ users: {} });
    return users.data && users.data.users.length > 0 ? users.data.users[0] : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function onAuthStateChange(callback: (user: InstantUser | null) => void) {
  // Simple implementation - in a real app you'd set up real-time subscriptions
  const currentUser = await getCurrentUser();
  callback(currentUser);
  
  // Return unsubscribe function
  return () => {};
}

// Test Instant DB connection
export async function testInstantDB(): Promise<{ success: boolean, error: any }> {
  try {
    console.log('Testing Instant DB connection...');
    
    // Try to query users to test connection
    const users = db.useQuery({ users: {} });
    console.log('Instant DB test result:', users);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Instant DB connection test failed:', error);
    return { success: false, error };
  }
}
