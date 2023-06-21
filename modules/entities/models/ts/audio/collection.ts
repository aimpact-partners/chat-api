import { Collection } from '@beyond-js/reactive/entities';
import { AudioProvider } from '@aimpact/chat-api/backend-provider';
import { Audio } from './item';

interface IAudios {
    items: Audio[];
}

export class Audios extends Collection {
    item = Audio;
    protected storeName = 'AudioRecords';
    protected db = 'chat-api';

    constructor() {
        super();
        this.provider = new AudioProvider();
        this.init();
    }
}
