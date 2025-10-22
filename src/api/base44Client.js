import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68ebc5cb87a0bc92a0f1a4c6", 
  requiresAuth: true // Ensure authentication is required for all operations
});
