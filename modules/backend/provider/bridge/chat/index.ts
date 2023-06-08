import {ChatStore} from '@aimpact/chat-api/database';
import type {Server} from 'socket.io';

export /*actions*/ /*bundle*/ class ChatProvider {
	socket: Server;
	constructor(socket: Server) {
		this.socket = socket;
	}
	async publish(data) {
		try {
			const user = new ChatStore();
			const response = await user.storeChat(data);
			return {status: true, data: response};
		} catch (e) {
			console.error(e);
			return {error: true, message: e.message};
		}
	}

	async load(id) {
		try {
			if (!id) {
				return {status: false, error: true, message: 'id is required'};
			}
			const user = new ChatStore();
			const data = await user.loadChat(id);

			return {status: true, data};
		} catch (e) {
			return {error: true, message: e.message};
		}
	}

	// @ftovar que hace este metodo?
	async list() {
		try {
			const user = new ChatStore();
			const entries = await user.loadAll();
			return {status: true, data: {entries}};
		} catch (e) {
			return {error: true, message: e.message};
		}
	}

	async bulkSave(data) {
		try {
			const user = new ChatStore();

			const entries = await user.bulkSave(data);

			return {status: true, data: {entries}};
		} catch (e) {
			return {error: true, message: e.message};
		}
	}
}
