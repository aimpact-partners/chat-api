import { join } from 'path';
import { Storage } from '@google-cloud/storage';
import * as dotenv from 'dotenv';
dotenv.config();

export class FilestoreFile {
	private storage;
	#storageBucket = process.env.STORAGEBUCKET;

	constructor() {
		const credentials = join(__dirname, './credentials.json');
		this.storage = new Storage({ keyFilename: credentials });
	}

	getFile(destination: string) {
		const file = this.storage.bucket(this.#storageBucket).file(destination);
		return file;
	}
	async upload(path: string, destination: string): Promise<string> {
		await this.storage.bucket(this.#storageBucket).upload(path, { destination });
		return destination;
	}
}
