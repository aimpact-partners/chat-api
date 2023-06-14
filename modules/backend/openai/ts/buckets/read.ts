import { Storage } from '@google-cloud/storage';
import { firebaseConfig } from './credentials';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export async function getFile(fileName: string): Promise<fs.ReadStream> {
	const storage = new Storage();

	const bucketName = firebaseConfig.storageBucket;

	const bucket = storage.bucket(bucketName);

	const tempFilePath = path.join(os.tmpdir(), 'update.mp3');
	const file = bucket.file(fileName);
	await file.download({ destination: tempFilePath });

	const readStream = fs.createReadStream(tempFilePath);
	return readStream;
}
