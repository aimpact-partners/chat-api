import { Chats } from './actions/chats';
import { Users } from './actions/users';
import { uploader } from './actions/uploader';

export /*bundle*/
function routes(app) {
	try {
		app.get('/', (req, res) => res.send('AImpact Chat API http server'));
		app.post('/upload', uploader);

		new Chats(app);
		new Users(app);
	} catch (e) {
		console.error('error catched', e);
	}
}
