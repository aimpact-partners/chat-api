import { KBRoutes } from './actions/kb';
import { UsersRoutes } from './actions/users';
import { ChatsRoutes } from './actions/chats';
import { PromptsRoutes } from './actions/prompts';
import { ConversationsRoutes } from './actions/conversations';

export /*bundle*/ class Routes {
	static setup(app) {
		try {
			app.get('/', (req, res) => res.send('AImpact Chat API http server'));

			KBRoutes.setup(app);
			UsersRoutes.setup(app);
			ChatsRoutes.setup(app);
			PromptsRoutes.setup(app);
			ConversationsRoutes.setup(app);
		} catch (e) {
			console.error('error catched', e);
		}
	}
}
