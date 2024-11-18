import type { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { AgentV2 } from '@aimpact/agents-api/realtime/agents/v2';
import * as dotenv from 'dotenv';

dotenv.config();

const { OPENAI_API_KEY } = process.env;

export class RealtimeConversationConnection {
	#agent: AgentV2;

	constructor(ws: WebSocket, request: IncomingMessage) {
		ws.on('message', this.#onmessage);
		ws.on('close', this.#onclose);

		this.#agent = new AgentV2({ key: OPENAI_API_KEY });
	}

	#onmessage = (message: any) => {
		console.log('on message', message);
	};

	#onclose = () => {};
}
