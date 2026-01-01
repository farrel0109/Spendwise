import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth, clerkClient } from '@clerk/express';

// Extend Express Request to include auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId?: string;
      };
    }
  }
}

// Export the Clerk middleware for use in index.ts
export const clerkAuthMiddleware = clerkMiddleware();

// Custom middleware to extract and validate user from Clerk session
export async function verifyClerk(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authData = getAuth(req);
    
    if (!authData.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Attach user info to request
    req.auth = {
      userId: authData.userId,
      sessionId: authData.sessionId || undefined,
    };

    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Auth error:', error);
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
}
