import { KBRoutes } from './actions/KB';
import { ChatsRoutes } from './actions/Chats';
import { UsersRoutes } from './actions/Users';
import { uploader } from './actions/Uploader';
import { uploaderStream } from './actions/Uploader/stream';
import { ConversationsRoutes } from './actions/Conversations';

export /*bundle*/ class Routes {
	static setup(app) {
		try {
			app.get('/', (req, res) => res.send('AImpact Chat API http server'));
			app.post('/upload', uploader);
			app.post('/upload/stream', uploaderStream);

			KBRoutes.setup(app);
			ChatsRoutes.setup(app);
			UsersRoutes.setup(app);
			ConversationsRoutes.setup(app);
		} catch (e) {
			console.error('error catched', e);
		}
	}
}
