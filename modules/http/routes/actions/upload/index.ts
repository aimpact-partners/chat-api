import type { Response, Application } from 'express';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
// import { UserMiddlewareHandler as middleware } from '@aimpact/chat-api/middleware';
// import { storage } from '@aimpact/chat-api/storage';
// import { multerUpload } from '../../utils/multer';

export class UploadRoutes {
	static setup(app: Application) {
		// app.post('/upload/image', middleware.validate, upload.single('file'), UploadRoutes.upload);
		// app.post('/upload/image', multerUpload.single('file'), UploadRoutes.upload);
	}

	static async upload(req: IAuthenticatedRequest, res: Response) {
		// const { user } = req;
		// if (!req.file) {
		// 	return res.status(400).send('No se ha proporcionado ningún archivo');
		// }
		// const bucketName = 'your-bucket-name';
		// const bucket = storage.bucket(bucketName);
		// // const bucket = storage.bucket(MODULES_ACTIVITIES_BUCKET);
		// const file = bucket.file(req.file.filename);
	}
}
