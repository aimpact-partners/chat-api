import * as multer from 'multer';
import {generateCustomName} from './routes/utils/generate-name';
import {getExtension} from './routes/utils/get-extension';

const setName = (req: Request, file: multer.File, cb: (error: Error | null, filename: string) => void) => {
	const name = `${generateCustomName(file.originalname)}${getExtension(file.mimetype)}`;
	cb(null, name);
};

export const upload = multer({
	storage: multer.diskStorage({
		destination: 'uploads',
		filename: setName,
	}),
});
