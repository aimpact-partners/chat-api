import type { Request, Response, Application } from 'express';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import * as OpenApiValidator from 'express-openapi-validator';
import { db } from '@beyond-js/firestore-collection/db';
import { Chat } from '@aimpact/chat-api/business/chats';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { ChatMessagesRoutes } from './messages';
import { IChat, ICreateChatSpecs } from './interfaces';
import { User } from '@aimpact/chat-api/business/user';

export class ChatsRoutes {
	static setup(app: Application) {
		// TODO actualizar respuesta de endpoint POST/chats
		// app.use(
		// 	OpenApiValidator.middleware({
		// 		apiSpec: `${process.cwd()}/docs/chats/api.yaml`,
		// 		validateRequests: true, // (default)
		// 		validateResponses: true, // false by default
		// 	})
		// );

		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});

		ChatMessagesRoutes.setup(app);

		app.get('/chats', ChatsRoutes.list);
		app.get('/chats/:id', ChatsRoutes.get);
		app.post('/chats', ChatsRoutes.save);
		app.post('/chats/bulk', ChatsRoutes.bulk);
		app.put('/chats/:id', ChatsRoutes.update);
		app.delete('/chats/:id', ChatsRoutes.delete);

		app.get('/conversations/:id', UserMiddlewareHandler.validate, ChatsRoutes.get);
		app.post('/conversations', UserMiddlewareHandler.validate, ChatsRoutes.save);
	}

	static async list(req: Request, res: Response) {
		try {
			const model = new Chat();
			const data: [] = await model.list({ userId: req.query.userId });

			if (!data) {
				return res.status(404).json({ error: 'Chats not found.' });
			}
			res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async get(req: IAuthenticatedRequest, res: Response) {
		try {
			const { id } = req.params;
			const { uid } = req.user;

			// true for get messages
			const data = await Chat.get(id, uid, true);
			return res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async save(req: Request, res: Response) {
		try {
			const params: ICreateChatSpecs = req.body;

			if (params.uid) {
				const model = new User(params.uid);
				await model.load();
				params.user = model.toJSON();
				delete params.uid;
			}

			const data = await Chat.save(params);
			res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const params: IChat = req.body;

			const model = new Chat();
			const data = model.save({ id, ...params });
			res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async bulk(req: Request, res: Response) {
		try {
			// Logic to create a new chat
			const params: IChat[] = req.body.chats;

			let uIds = [...new Set(params.map(chat => chat?.uid).filter(uid => uid))];
			console.log(uIds);

			const snapshot = await db.collection('Users').where('id', 'in', uIds).get();
			const userInfos: any = {};
			snapshot.forEach(doc => {
				userInfos[doc.id] = doc.data();
			});
			console.log('userInfos', userInfos);

			params.forEach(async chat => {
				chat.user = { id: userInfos[chat.uid].id, name: userInfos[chat.uid].displayName };
				delete chat.uid;
			});
			console.log('params', params);

			const model = new Chat();
			const invalid = params.some(item => !model.validate(item));

			if (invalid) {
				return res.json({ status: false, data: { error: 'invalid fields' } });
			}

			const data = await model.saveAll(params);
			res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.query;

			if (!id && !userId) {
				return res.status(400).json({ error: 'id or userId is required' });
			}

			const model = new Chat();
			if (userId) {
				const items: string[] = await model.deleteAll('userId', userId);
				return res.json({
					status: true,
					data: { deleted: items }
				});
			}
			await model.delete(id);

			res.json({ status: true, data: { deleted: [id] } });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}
}
