import type { IUsersData } from '@aimpact/chat-api/data/interfaces';
import type { Request, Response, Application } from 'express';
import type { IUser } from '@aimpact/chat-api/business/user';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { User } from '@aimpact/chat-api/business/user';
import { Response as HttpResponse } from '@beyond-js/response/main';
import { ErrorGenerator } from '@aimpact/chat-api/http/errors';

export class UsersRoutes {
	static setup(app: Application) {
		// app.use((err, req: Request, res: Response, next) => {
		// 	res.status(err.status || 500).json({ message: err.message, errors: err.errors });
		// });

		app.post('/auth/login', UsersRoutes.login);
		app.post('/auth/register', UsersRoutes.register);
		app.post('/integrations/tokens/verify', UsersRoutes.verify);
	}

	static async login(req: Request, res: Response) {
		const { id, firebaseToken } = req.body;
		const errors = [];
		!id && errors.push('id');
		!firebaseToken && errors.push('firebaseToken');
		if (errors.length) return res.json(new HttpResponse({ error: ErrorGenerator.invalidParameters(errors) }));

		try {
			const specs = <IUsersData>{
				id: req.body.id,
				displayName: req.body.displayName,
				email: req.body.email,
				firebaseToken: req.body.firebaseToken,
				token: req.body.token,
				photoURL: req.body.photoURL,
				phoneNumber: req.body.phoneNumber
			};

			const user = new User(specs.id);
			const response = await user.login(specs);
			if (response.error) return res.json(new HttpResponse({ error: response.error }));

			res.json(new HttpResponse({ data: response.data }));
		} catch (exc) {
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async register(req: Request, res: Response) {
		const { id, firebaseToken } = req.body;

		const errors = [];
		!id && errors.push('id');
		!firebaseToken && errors.push('firebaseToken');
		if (errors.length) return res.json(new HttpResponse({ error: ErrorGenerator.invalidParameters(errors) }));

		try {
			const specs = <IUsersData>{
				id: req.body.id,
				displayName: req.body.displayName,
				email: req.body.email,
				firebaseToken: req.body.firebaseToken,
				token: req.body.token,
				photoURL: req.body.photoURL,
				phoneNumber: req.body.phoneNumber
			};

			const user = new User(specs.id);
			const response = await user.register(specs);
			if (response.error) return res.json(new HttpResponse({ error: response.error }));

			res.json(new HttpResponse({ data: response.data }));
		} catch (exc) {
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async verify(req: Request, res: Response) {
		try {
			const token = req.headers.authorization.split(' ')[1];
			jwt.verify(token, process.env.SECRET_KEY, async (err, decoded: JwtPayload) => {
				if (err) {
					return res.json({ status: false, error: 'Invalid token' });
				}

				const user = new User(decoded.uid);
				const response = await user.load();

				if (!response.status) return res.json(response);
				if (!user.valid) return res.json({ status: false, error: 'User not valid' });

				// Tokens are not returned in the response
				delete response.data.token;
				delete response.data.firebaseToken;

				const data: IUser = {
					uid: response.data.id,
					id: response.data.id,
					name: response.data.displayName,
					displayName: response.data.displayName,
					email: response.data.email,
					photoURL: response.data.photoURL,
					phoneNumber: response.data.phoneNumber
				};

				res.json({ status: true, data });
			});
		} catch (e) {
			res.json({ status: false, error: e.message });
		}
	}
}
