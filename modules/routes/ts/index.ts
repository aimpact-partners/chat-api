import {upload} from './upload';
import {uploader} from './routes/uploader';

export /*bundle*/
function routes(app) {
	app.get('/', (req, res) => res.send('AImpact Chat API http server'));
	app.post('/upload', upload.single('audio'), uploader);
}
