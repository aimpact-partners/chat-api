import type { Request, Response, Application } from 'express';
import { Conversation, IConversation } from '@aimpact/chat-api/models/conversation';
import { Agents } from '@aimpact/chat-api/agents';

export class ConversationsRoutes {
	static setup(app: Application) {
		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});

		app.post('/conversations', ConversationsRoutes.publish);
		app.post('/conversations/:id/messages', ConversationsRoutes.sendMessage);
	}

	static async publish(req: Request, res: Response) {
		try {
			const params: IConversation = req.body;
			const data = await Conversation.publish(params);
			res.json({ status: true, data });
		} catch (e) {
			res.json({ status: false, error: e.message });
		}
	}

	static async sendMessage(req: Request, res: Response) {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ status: false, error: 'Paramter conversation id is required' });
		}

		const { message } = req.body;
		if (!message) {
			return res.status(400).json({ status: false, error: 'Parameter message is required' });
		}

		try {
			// Store the user message as soon as it arrives
			const userMessage = { content: message, role: 'user' };
			const response = await Conversation.sendMessage(id, userMessage);
			if (!response.status) {
				return res.status(400).json({ status: false, error: response.error });
			}

			res.setHeader('Content-Type', 'text/plain');
			res.setHeader('Transfer-Encoding', 'chunked');

			const { iterator, error } = await Agents.sendMessage(response.data.id, message);
			if (error) {
				return res.status(500).json({ status: false, error });
			}

			let answer = '';
			let stage: { synthesis: string };
			for await (const part of iterator) {
				const { chunk } = part;
				answer += chunk ? chunk : '';
				chunk && res.write(chunk);

				if (part.stage) {
					stage = part.stage;
					break;
				}
			}

			res.write('ÿ');
			res.write(JSON.stringify({ status: true }));

			console.log(`\n\SYNTHESIS:\n${stage?.synthesis}`);

			// set agent message on firestore
			// const agentMessage = { content: message, role: 'system' };
			// const response = await Conversation.sendMessage(id, agentMessage);
			// if (!response.status) {
			// 	return res.status(400).json({ status: false, error: response.error });
			// }

			// setea last interaction on conversation
			// await Conversation.setLastInteractions(id,4);

			res.end();
		} catch (e) {
			res.json({ status: false, error: e.message });
		}
	}
}
