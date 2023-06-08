import {ChatStore} from '@aimpact/chat-api/database';
import {Server} from 'socket.io';

export /*actions*/ /*bundle*/ class ChatsProvider {
	socket: Server;
	constructor(socket: Server) {
		this.socket = socket;
	}
	async save(data) {
		try {
			const user = new ChatStore();
			await user.storeUser(data);
			return {status: true};
		} catch (e) {
			return {error: true, message: e.message};
		}
	}

	async load({id}) {
		try {
			const user = new ChatStore();
			const data = await user.loadUser(id);

			return {status: true, data};
		} catch (e) {
			return {error: true, message: e.message};
		}
	}

	async list() {
		try {
			const user = new ChatStore();
			const entries = await user.loadAll();
			return {status: true, data: {entries}};
		} catch (e) {
			return {error: true, message: e.message};
		}
	}

	send() {
		this.socket.emit('user', {name: 'algo'});
	}
}
