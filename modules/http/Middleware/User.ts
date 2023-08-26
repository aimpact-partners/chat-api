import type { Request, Response } from 'express';
import * as admin from 'firebase-admin';

interface /*bundle*/ IAuthenticatedRequest extends Request {
	user?: any;
}

export /*bundle*/ class UserMiddlewareHandler {
	static async validate(req: IAuthenticatedRequest, res: Response, next) {
		const authHeader = req.headers['authorization'];
		const accessToken = authHeader && authHeader.split(' ')[1];
		if (!accessToken) return res.status(401).json({ error: 'Access token not provided' });

		try {
			const decodedToken = await admin.auth().verifyIdToken(accessToken);
			console.log('decodedToken', decodedToken);
			if (!decodedToken) {
				return res
					.status(401)
					.json({ status: false, error: 'Invalid Access token or Access token not provided' });
			}

			req.user = decodedToken;
			next();
		} catch (e) {
			console.error(e);
			const code = e.message.includes('401') ? 401 : 500;

			return res.status(500).json({ status: false, error: e.message, code });
		}
	}
}
