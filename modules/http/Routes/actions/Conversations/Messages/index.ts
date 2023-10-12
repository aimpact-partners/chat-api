import type { Response, Application } from 'express';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import { Agents } from '@aimpact/chat-api/agents';
import { Conversation } from '@aimpact/chat-api/models/conversation';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { processAudio } from './audio';

interface IMessageSpecs {
	id: string;
	content: string;
	systemId: string;
	timestamp?: number;
}

export class ConversationMessagesRoutes {
	static setup(app: Application) {
		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});

		app.post('/conversations/:id/messages', UserMiddlewareHandler.validate, ConversationMessagesRoutes.sendMessage);
	}

	static async sendMessage(req: IAuthenticatedRequest, res: Response) {
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}

		let conversation;
		try {
			conversation = await Conversation.get(conversationId, req.user.uid);
			req.conversation = conversation;
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
		if (conversation.error) {
			return res.status(400).json({ status: false, error: conversation.error });
		}
		if (!conversation.project) {
			return res.status(400).json({ status: false, error: 'the conversation not has a project defined' });
		}

		/**
		 *	Validate the type of request
		 *		req.header.content-type
					application/json for text messages
		 *			multipart/form-data for audio messages
		 *
		 *	If it is a text, the parameters come in the body of the request
		 *	If it is by audio, the audio must be processed and the transcription obtained
		 *
		 * @param req 
		 * @param res 
		 * @returns Promise<{ data?: IMessageSpecs; error?: string }>
		 */
		const processRequest = async (req, res): Promise<{ data?: IMessageSpecs; error?: string }> => {
			const textRequest = req.headers['content-type'] === 'application/json';
			if (textRequest) return { data: req.body };

			try {
				const { transcription, fields, error } = await processAudio(req);
				if (error) return { error };

				if (transcription.error) return { error: transcription.error };
				return {
					data: {
						id: fields.id,
						content: transcription.data?.text,
						systemId: fields.systemId,
						timestamp: fields.timestamp
					}
				};
			} catch (e) {
				console.error(e);
				return { error: e.message };
			}
		};
		const { data, error } = await processRequest(req, res);
		if (error) {
			console.error(error);
			return res.json({ status: false, error });
		}

		const done = (specs: { status: boolean; error?: string; user?: object; system?: object }) => {
			const { status, error, user, system } = specs;
			res.write('ÿ');
			res.write(JSON.stringify({ status, error, user, system }));
			res.end();
		};
		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Transfer-Encoding', 'chunked');

		const { id, content, timestamp, systemId } = data;

		let user;
		let answer = '';
		let metadata: { answer: string; synthesis: string };
		try {
			// Store the user message as soon as it arrives
			const userMessage = { id, content, role: 'user', timestamp };
			let response = await Conversation.saveMessage(conversationId, userMessage);
			if (response.error) {
				return done({ status: false, error: response.error });
			}
			user = response.data;

			const audioRequest = req.headers['content-type'] !== 'application/json';
			if (audioRequest) {
				const action = { type: 'transcription', data: { transcription: content } };
				res.write('😸' + JSON.stringify(action) + '🖋️');
			}

			const { iterator, error } = await Agents.sendMessage(conversationId, content);
			if (error) {
				return done({ status: false, error: error });
			}

			for await (const part of iterator) {
				const { chunk } = part;
				answer += chunk ? chunk : '';
				chunk && res.write(chunk);

				if (part.stage) {
					metadata = part.stage;
					break;
				}
			}
		} catch (exc) {
			console.error(exc);
			return done({ status: false, error: 'Error processing agent response' });
		}

		let system;
		try {
			// set assistant message on firestore
			const agentMessage = { id: systemId, content: answer, answer: metadata.answer, role: 'assistant' };
			const response = await Conversation.saveMessage(conversationId, agentMessage);
			if (response.error) {
				console.error('Error saving agent response:', response.error);
				return done({ status: false, error: 'Error saving agent response' });
			}
			system = response.data;

			// update synthesis on conversation
			const data = { id: conversationId, synthesis: metadata?.synthesis };
			await Conversation.publish(data);

			// set last interaction on conversation
			await Conversation.setLastInteractions(conversationId, 4);
		} catch (exc) {
			return done({ status: false, error: 'Error saving agent response' });
		}

		done({ status: true, user, system });
	}
}
