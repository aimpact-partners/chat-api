import type { Request, Response, Application } from 'express';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import * as OpenApiValidator from 'express-openapi-validator';
import { db } from '@beyond-js/firestore-collection/db';
import { Chat, Chats } from '@aimpact/chat-api/business/chats';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { ChatMessagesRoutes } from './messages';
import { IChat, ICreateChatSpecs } from './interfaces';
import { Response as HttpResponse } from '@beyond-js/response/main';
import { ErrorGenerator } from '@beyond-js/firestore-collection/errors';

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

		ChatMessagesRoutes.setup(app);

		app.post('/chats/bulk', ChatsRoutes.bulk);
		app.put('/chats/:id', ChatsRoutes.update);
		app.delete('/chats/:id', ChatsRoutes.delete);

		app.get('/chats', UserMiddlewareHandler.validate, ChatsRoutes.list);
		app.get('/chats/:id', UserMiddlewareHandler.validate, ChatsRoutes.get);

		app.post('/chats', ChatsRoutes.save);
		// app.post('/chats', UserMiddlewareHandler.validate, ChatsRoutes.save);

		/**
		 * @deprecated
		 */
		app.get('/conversations/:id', UserMiddlewareHandler.validate, ChatsRoutes.get);
		app.post('/conversations', UserMiddlewareHandler.validate, ChatsRoutes.save);
	}

	static async list(req: IAuthenticatedRequest, res: Response) {
		try {
			const { uid } = req.user;
			const response = await Chats.byUser(uid);
			if (response.error) {
				return res.status(404).json({ error: 'Chats not found.' });
			}

			res.json(new HttpResponse({ data: response.data }));
		} catch (exc) {
			console.error(exc);
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async get(req: IAuthenticatedRequest, res: Response) {
		try {
			const { id } = req.params;
			const { uid } = req.user;

			// true for get messages
			const response = await Chat.get(id, uid, true);
			if (response.error) {
				return res.json(new HttpResponse({ error: response.error }));
			}

			res.json(new HttpResponse({ data: response.data }));
		} catch (exc) {
			console.error(exc);
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async save(req: Request, res: Response) {
		try {
			const params: ICreateChatSpecs = req.body;

			const response = await Chat.save(params);
			if (response.error) {
				return res.json(new HttpResponse({ error: response.error }));
			}

			res.json(new HttpResponse({ data: response.data }));
		} catch (exc) {
			console.error(exc);
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const params: IChat = req.body;

			const model = new Chat();
			const data = model.save({ id, ...params });
			res.json(new HttpResponse({ data }));
		} catch (exc) {
			console.error(exc);
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async bulk(req: Request, res: Response) {
		try {
			// Logic to create a new chat
			const params: IChat[] = req.body.chats;

			let uIds = [...new Set(params.map(chat => chat?.uid).filter(uid => uid))];

			const snapshot = await db.collection('Users').where('id', 'in', uIds).get();
			const userInfos: any = {};
			snapshot.forEach(doc => {
				userInfos[doc.id] = doc.data();
			});

			params.forEach(async chat => {
				chat.user = { id: userInfos[chat.uid].id, name: userInfos[chat.uid].displayName };
				delete chat.uid;
			});

			const model = new Chat();
			const invalid = params.some(item => !model.validate(item));

			if (invalid) {
				return res.json({ status: false, data: { error: 'invalid fields' } });
			}

			const data = await model.saveAll(params);
			res.json(new HttpResponse({ data }));
		} catch (exc) {
			console.error(exc);
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
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
		} catch (exc) {
			console.error(exc);
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}
}
