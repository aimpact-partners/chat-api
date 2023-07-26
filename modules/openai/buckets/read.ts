import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Storage } from '@google-cloud/storage';
import * as dotenv from 'dotenv';
dotenv.config();

export async function getFile(fileName: string): Promise<fs.ReadStream> {
	const credentials = path.join(__dirname, './credentials.json');
	const storage = new Storage({ keyFilename: credentials });
	const bucket = storage.bucket(process.env.STORAGEBUCKET);

	const tempFilePath = path.join(os.tmpdir(), 'update.mp3');
	const file = bucket.file(fileName);
	await file.download({ destination: tempFilePath });

	const readStream = fs.createReadStream(tempFilePath);
	return readStream;
}
