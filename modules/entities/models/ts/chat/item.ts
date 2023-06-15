// ChatItem
import { Item } from '@beyond-js/reactive-2/entities';
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

    #messages: any[] = [];
    get messages() {
        return this.#messages;
    }

    constructor({ id = undefined } = {}) {
        super({ id, db: 'chat-api', storeName: 'Chat', provider: ChatProvider });
    }

    loadAll = async specs => {
        //@ts-ignore
        const response = await this.load(specs);

        this.#messages = response.data.messages ?? response.data.messages;

        //@ts-ignore
    };

    async setAudioMessage(messages: { text: string; role: string }[]) {
        const messageItem = new Message();
        const promises = [];

        messages.forEach(message => {
            this.#messages.push(message);
            //@ts-ignore
            promises.push(messageItem.publish(message));
        });
        this.triggerEvent();
        await Promise.all(promises);

        const response = await this.provider.bulkSave(messages);

        return response;
    }

    sendAudio(audio) {
        const messageItem = new Message();
        //@ts-ignore
        messageItem.setOffline(true);

        //@ts-ignore
        this.#messages.push({
            id: messageItem.id,
            chatId: this.id,
            type: 'audio',
            audio,
            role: 'user',
            timestamp: Date.now(),
        });

        this.triggerEvent();
    }
    async sendMessage(text: string) {
        try {
            //@ts-ignore
            this.fetching = true;
            //@ts-ignore
            const messageItem = new Message();
            //@ts-ignore
            messageItem.setOffline(true);

            //@ts-ignore
            this.#messages.push({ id: messageItem.id, chatId: this.id, text, role: 'user', timestamp: Date.now() });

            //TODO no se guarda el chatID en el cliente?
            //@ts-ignore
            await messageItem.publish({ chatId: this.id, text, role: 'user', timestamp: Date.now() });

            //@ts-ignore
            this.triggerEvent();
            //@ts-ignore
            const data = { ...messageItem.getValues() };

            //@ts-ignore
            const response = await this.provider.sendMessage({ chatId: this.id, ...data });
            if (!response.status) {
                throw new Error(response.error);
            }

            this.#messages.push(response.data.response);
            //@ts-ignore
            this.triggerEvent('new.message');
        } catch (e) {
            console.error(e);
        } finally {
            //@ts-ignore
            this.fetching = false;
        }
    }
}
