import type {Request, Response, Application} from 'express';
import {Chats as Model} from '@aimpact/chat-api/models/chats';
import * as OpenApiValidator from 'express-openapi-validator';
import {IChat, ICreateChatSpecs} from './interfaces';
export class Chats {
	#app: Application;
	#model: Model;
	constructor(app: Application) {
		this.#app = app;
		this.#model = new Model();
		app.use(
			OpenApiValidator.middleware({
				apiSpec: `${process.cwd()}/docs/api/chats.yaml`,
				validateRequests: true, // (default)
				validateResponses: true, // false by default
			})
		);

		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors,
			});
		});
		app.get('/chats', this.list.bind(this));
		app.get('/chats/:id', this.get.bind(this));
		app.post('/chats', this.save.bind(this));
		app.post('/chats/bulk', this.bulk.bind(this));
		app.put('/chats/:id', this.update.bind(this));
		app.delete('/chats/:id', this.delete.bind(this));
	}

	async list(req: Request, res: Response) {
		try {
			const data: [] = await this.#model.list({userId: req.query.userId});
			console.log(10, data);
			if (!data) {
				return res.status(404).json({error: 'Chats not found.'});
			}
			res.json({
				status: true,
				data,
			});
		} catch (e) {
			console.log(e);
			res.json({
				error: e.message,
			});
			return {status: false, error: e.message};
		}
	}

	async get(req: Request, res: Response) {
		try {
			// Logic to retrieve a specific chat by ID
			const {id} = req.params;

			const data = await this.#model.get(id);

			return res.json({status: true, data});
		} catch (e) {
			res.json({
				error: e.message,
			});
		}
	}

	save(req: Request, res: Response) {
		try {
			// Logic to create a new chat}
			const params: ICreateChatSpecs = req.body;

			const data = this.#model.save(params);
			res.json({status: true, data});
		} catch (e) {
			res.json({
				status: false,
				error: e.message,
			});
		}
	}

	update(req: Request, res: Response) {
		try {
			const {id} = req.params;
			console.log(0.2, id);
			const params: IChat = req.body;
			const data = this.#model.save({id, ...params});
			res.json({status: true, data});
		} catch (e) {
			res.json({
				status: false,
				error: e.message,
			});
		}
	}

	async bulk(req: Request, res: Response) {
		try {
			// Logic to create a new chat}
			const params: IChat[] = req.body.chats;

			const invalid = params.some(item => this.#model.validate(item));
			if (invalid) {
				res.json({
					status: false,
					data: {
						error: 'invalid fields',
					},
				});
			}
			console.log(0.3, params, req.body);
			const data = await this.#model.saveAll(params);
			console.log(0.3);

			res.json({status: true, data});
		} catch (e) {
			res.json({
				status: false,
				error: e.message,
			});
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const {id} = req.params;

			const data = await this.#model.delete(id);

			res.json({status: true, data});
		} catch (e) {
			res.json({
				status: false,
				error: e.message,
			});
		}
	}
}
