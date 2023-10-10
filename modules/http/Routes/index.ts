import { KBRoutes } from './actions/KB';
import { UsersRoutes } from './actions/Users';
import { ChatsRoutes } from './actions/Chats';
import { ConversationsRoutes } from './actions/Conversations';

export /*bundle*/ class Routes {
	static setup(app) {
		try {
			app.get('/', (req, res) => res.send('AImpact Chat API http server'));

			KBRoutes.setup(app);
			UsersRoutes.setup(app);
			ChatsRoutes.setup(app);
			ConversationsRoutes.setup(app);
		} catch (e) {
			console.error('error catched', e);
		}
	}
}
