import type {Request, Response, Application} from 'express';
import {User as Model} from '@aimpact/chat-api/models/user';

export class Users {
	#app: Application;
	#model: Model;

	constructor(app: Application) {
		this.#app = app;

		// TODO @ftovar8 @jircdev actualizar respuesta de endpoint
		// app.use(
		// 	OpenApiValidator.middleware({
		// 		apiSpec: `${process.cwd()}/docs/api/users.yaml`,
		// 		validateRequests: true, // (default)
		// 		validateResponses: true, // false by default
		// 	})
		// );

		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors,
			});
		});

		app.get('/user/:token', this.get.bind(this));
	}

	async get(req: Request, res: Response) {
		try {
			const {token} = req.params;

			const user = new Model(token);
			await user.validate();
			if (!user.valid) return res.status(401).json({error: 'Access token is invalid'});

			const {id, displayName, email, photoURL, phoneNumber} = user;
			const data = {id, displayName, email, photoURL, phoneNumber};

			return res.json({status: true, data});
		} catch (e) {
			res.json({
				error: e.message,
			});
		}
	}
}
