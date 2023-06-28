// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { ChatProvider } from '@aimpact/chat-api/backend-provider';
import { Message } from './messages/item';
import { Messages } from './messages';

interface IChat {
    userId: string;
    category: string;
    knowledgeBoxId: string;
}

export /*bundle*/ class Chat extends Item<IChat> {
    protected properties = ['id', 'userId', 'category', 'knowledgeBoxId', 'name'];

    #messages: Map<string, any> = new Map();
    get messages() {
        return [...this.#messages.values()];
    }

    constructor({ id = undefined } = {}) {
        super({ id, db: 'chat-api', storeName: 'Chat', provider: ChatProvider });
    }

    loadAll = async specs => {
        //@ts-ignore
        const response = await this.load(specs);

        let messages = new Map();
        if (response.data.messages?.length) {
            response.data.messages.forEach(message => messages.set(message.id, message));
        }
        this.#messages = messages;

        //@ts-ignore
    };

    async setAudioMessage({ user, response }) {
        const messageItem = new Message();
        const responseItem = new Message();
        const promises = [];

        await messageItem.publish(user);
        await responseItem.publish(response);
        const audio = this.#messages.get('temporal.audio');
        const finalData = { ...audio, ...user };
        this.#messages.delete('temporal.audio');
        this.#messages.set(messageItem.id, finalData);
        this.#messages.set(responseItem.id, response);

        this.triggerEvent();
        // await Promise.all(promises);

        // const response = await this.provider.bulkSave(messages);

        return response;
    }

    sendAudio(audio, transcription = undefined) {
        const item = new Message();
        //@ts-ignore
        item.setOffline(true);

        const specs = {
            //@ts-ignore
            id: item.id,
            //@ts-ignore
            chatId: this.id,
            type: 'audio',
            audio,
            role: 'user',
            timestamp: Date.now(),
        };
        if (transcription) {
            //@ts-ignore
            specs.text = transcription;
        }
        //@ts-ignore
        this.#messages.set('temporal.audio', specs);

        //@ts-ignore
        this.triggerEvent();
    }
    async sendMessage(text: string, prompt: string) {
        try {
            this.fetching = true;
            const item = new Message();

            item.setOffline(true);

            this.#messages.set('temporal', { id: item.id, chatId: this.id, text, role: 'user', timestamp: Date.now() });
            this.triggerEvent();

            //TODO no se guarda el chatID en el cliente?

            await item.publish({ chatId: this.id, text, role: 'user', timestamp: Date.now() });

            this.triggerEvent();

            const data = { ...item.getProperties() };

            const response = await this.provider.sendMessage({ chatId: this.id, ...data, prompt });
            if (!response.status) {
                throw new Error(response.error);
            }

            this.#messages.set(response.data.response.id, response.data.message);
            this.#messages.set(response.data.message.id, response.data.response);
            this.#messages.delete('temporal');
            //@ts-ignore

            this.triggerEvent();
        } catch (e) {
            console.error(e);
        } finally {
            //@ts-ignore
            this.fetching = false;
        }
    }
}
