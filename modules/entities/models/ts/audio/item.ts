// AudioItem
import { Item } from '@beyond-js/reactive/entities';
import { AudioProvider } from '@aimpact/chat-api/backend-provider';

interface IAudio {
    messageId: string;
}

export /*bundle*/ class Audio extends Item<IAudio> {
    protected properties = ['id', 'userId', 'category'];

    constructor({ id = undefined } = {}) {
        super({ id, db: 'chat-api', storeName: 'AudioRecords', provider: AudioProvider });
    }
}
