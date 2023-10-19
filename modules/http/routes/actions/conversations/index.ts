import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { Conversation } from '@aimpact/chat-api/models/conversation';
import { ConversationMessagesRoutes } from './messages';
import type { Response, Application } from 'express';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import type { IConversation } from '@aimpact/chat-api/models/conversation';

export class ConversationsRoutes {
	static setup(app: Application) {
		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});

		ConversationMessagesRoutes.setup(app);

		app.get('/conversations/:id', UserMiddlewareHandler.validate, ConversationsRoutes.get);
		app.post('/conversations', UserMiddlewareHandler.validate, ConversationsRoutes.publish);
	}

	static async get(req: IAuthenticatedRequest, res: Response) {
		try {
			const { id } = req.params;
			const { uid } = req.user;

			// true for get messages
			const data = await Conversation.get(id, uid, true);
			return res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async publish(req: IAuthenticatedRequest, res: Response) {
		try {
			const params: IConversation = req.body;
			const data = await Conversation.publish(params);

			res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}
}
