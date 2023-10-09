import type { Response, Application } from 'express';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { Conversation } from '@aimpact/chat-api/models/conversation';
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
			'/conversations/:id/messages/audio',
			UserMiddlewareHandler.validate,
			ConversationMessagesRoutes.sendAudio
		);

		app.post(
			'/conversations/:id/messages/tools',
			UserMiddlewareHandler.validate,
			ConversationMessagesRoutes.sendMessageTools
		);
		app.post(
			'/conversations/:id/messages/audio/tools',
			UserMiddlewareHandler.validate,
			ConversationMessagesRoutes.sendAudioTools
		);
	}

	static async sendAudio(req: IAuthenticatedRequest, res: Response) {
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}

		const { user } = req;
		const conversation = await Conversation.get(conversationId, user.uid);
		return processAudio(req, res, { user, conversation });
	}
	static async sendMessage(req: IAuthenticatedRequest, res: Response) {
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}
		return processText(req, res, {});
	}

	static async sendAudioTools(req: IAuthenticatedRequest, res: Response) {
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}

		const { user } = req;
		const conversation = await Conversation.get(conversationId, user.uid);
		return processAudio(req, res, { user, conversation, tools: true });
	}
	static async sendMessageTools(req: IAuthenticatedRequest, res: Response) {
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}
		return processText(req, res, { tools: true });
	}
}
