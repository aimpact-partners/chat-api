import fetch from 'node-fetch';
import config from '@aimpact/chat-api/config';
import { ChatStore, KnowledgeBoxesStore } from '@aimpact/chat-api/backend-store';
import * as dotenv from 'dotenv';
dotenv.config();

interface IMessage {
    chatId: string;
    userId: string;
    content: string;
    role: string;
    timestamp: number;
}

export /*bundle*/ class TriggerAgent {
    #url = config.params.AGENTS_SERVER;
    #options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GCLOUD_IDENTITY_TOKEN}`,
        },
    };

    async call(message: IMessage, chatId: string, prompt: string, knowledgeBoxId: string) {
        try {
            const chat = new ChatStore();
            var chatResponse = await chat.load({ id: chatId });
            if (!chatResponse.status) {
                return chatResponse;
            }

            let filter;

            if (knowledgeBoxId) {
                const knowledgeBox = new KnowledgeBoxesStore();
                var KBResponse = await knowledgeBox.load({ id: knowledgeBoxId });
                if (!KBResponse.status) {
                    return KBResponse;
                }
                filter = { container: KBResponse.data.path };
            }

            let { messages } = chatResponse.data;
            const items = messages.map(({ role, content }) => Object.assign({}, { role, content }));

            // TODO @ftovar8 se hace la insercion del mensaje reciente en el array de mensajes
            // Hay que ajustar el guardado en backend cuando se manda un audio
            // de momento se esta haciendo en el cliente
            console.log('AGENT CALL: message ', message);

            items.push({ role: message.role, content: message.content });

            console.log('AGENT CALL: messages-items', items);
            // console.log('AGENT CALL: prompt', prompt);
            // console.log('AGENT CALL: filter', filter);

            const options = { ...this.#options, body: JSON.stringify({ messages: items, prompt, filter }) };
            const response = await fetch(this.#url, options);
            const responseJson = await response.json();

            return responseJson;
        } catch (e) {
            console.error('trigger agent:', e);
            return { status: false, error: e.message };
        }
    }
}
