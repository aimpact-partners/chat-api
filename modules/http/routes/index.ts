import { createChats } from './routes/chats/chats';
import { uploader } from './routes/uploader';

export /*bundle*/
function routes(app) {
	app.get('/', (req, res) => res.send('AImpact Chat API http server'));
	app.post('/upload', uploader);
	app.post('/chats', createChats);
}
``