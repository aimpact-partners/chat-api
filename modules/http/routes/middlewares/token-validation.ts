/* import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

// Initialize Firebase Admin SDK (you should do this at the application's startup)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // You can also provide a service account key if not running on Firebase Cloud Functions
});

// Global Middleware to Validate Firebase ID Token
export async function validateFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract the token from the Authorization header
    const authorizationHeader = req.headers['authorization'];

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error('Invalid token format');
    }

    const idToken = authorizationHeader.split(' ')[1];

    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach the decoded token to the request for further processing in route handlers
    req['decodedToken'] = decodedToken;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Token validation failed:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}
 */