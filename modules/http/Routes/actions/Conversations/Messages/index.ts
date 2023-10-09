import type { Response, Application } from 'express';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { Conversation } from '@aimpact/chat-api/models/conversation';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import { processText } from './text';
import { processAudio } from './audio';

export class ConversationMessagesRoutes {
	static setup(app: Application) {
		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});

		app.post('/conversations/:id/messages', UserMiddlewareHandler.validate, ConversationMessagesRoutes.sendMessage);
		app.post(
			'/conversations/:id/messages/tools',
			UserMiddlewareHandler.validate,
			ConversationMessagesRoutes.sendMessageTools
		);
	}

	static async sendMessage(req: IAuthenticatedRequest, res: Response) {
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}

		if (req.headers['content-type'] === 'application/json') {
			return processText(req, res);
		}

		const { user } = req;
		const conversation = await Conversation.get(conversationId, user.uid);
		return processAudio(req, res, { user, conversation });
	}
	static async sendMessageTools(req: IAuthenticatedRequest, res: Response) {
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}

		if (req.headers['content-type'] === 'application/json') {
			return processText(req, res, { tools: true });
		}

		const { user } = req;
		const conversation = await Conversation.get(conversationId, user.uid);
		return processAudio(req, res, { user, conversation, tools: true });
	}
}
