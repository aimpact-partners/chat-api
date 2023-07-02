import { uploader } from './routes/uploader';
import { token } from './routes/token';

export /*bundle*/
function routes(app) {
	app.get('/', (req, res) => res.send('AImpact Chat API http server'));
	app.post('/upload', uploader);
	app.post('/token', token);
}
