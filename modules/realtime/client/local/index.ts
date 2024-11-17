import type { IVoiceAudioDetection, AgentStatusType } from '@aimpact/agents-api/realtime/agent';
import { ClientSessionBase } from '@aimpact/agents-api/realtime/client/base';
import { Agent } from '@aimpact/agents-api/realtime/agent';

export /*bundle*/ class ClientSession extends ClientSessionBase {
	#agent: Agent;
	get agent() {
		return this.#agent;
	}

	get status(): AgentStatusType {
		return this.#agent.status;
	}

	constructor(settings: { vad: IVoiceAudioDetection }) {
		const apiKey = localStorage.getItem('openai-key');
		if (!apiKey) throw new Error('Open AI API key must be set as a localstorage item: `openai-key`');

		const agent = new Agent({ apiKey, dangerouslyAllowAPIKeyInBrowser: true });
		super(agent, agent.session, settings);
		this.#agent = agent;
	}

	async connect(): Promise<boolean> {
		super.connect();
		return await this.#agent.connect();
	}

	async close(): Promise<void> {
		const output = await this.#agent.close();
		super.close();
		return output;
	}

	listen(data: { mono: Int16Array; raw: Int16Array }): void {
		this.#agent.manager.listen(data.mono);
	}
}
