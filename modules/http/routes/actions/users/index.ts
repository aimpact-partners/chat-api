import * as jwt from 'jsonwebtoken';
import type {JwtPayload} from '@types/jsonwebtoken';
import type {Request, Response, Application} from 'express';
import {User as Model} from '@aimpact/chat-api/models/user';

export class Users {
	#app: Application;
	#model: Model;

	constructor(app: Application) {
		this.#app = app;

		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors,
			});
		});

		app.post('/integrations/tokens/get', this.get.bind(this));
		app.post('/integrations/tokens/verify', this.verify.bind(this));
	}

	get(req: Request, res: Response) {}

	async verify(req: Request, res: Response) {
		try {
			const token = req.headers.authorization.split(' ')[1];
			jwt.verify(token, process.env.SECRET_KEY, async (err, decoded: JwtPayload) => {
				if (err) {
					return res.json({status: false, error: 'Invalid token'});
				}

				const user = new Model(decoded.uid);
				const response = await user.load();

				if (!response.status) return res.json(response);
				if (!user.valid) return res.json({status: false, error: 'User not valid'});

				// Tokens are not returned in the response
				delete response.data.token;
				delete response.data.firebaseToken;

				res.json({status: true, data: response.data});
			});
		} catch (e) {
			res.json({status: false, error: e.message});
		}
	}
}