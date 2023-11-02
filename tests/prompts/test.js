describe('run API', () => {
	test('tes endpoint ', async () => {
		const body = JSON.stringify({ prompt: 'dame un saludo motivacional' });
		const options = { method: 'POST', body };
		const url = 'https://chat-api-http-v2-rb5caohzgq-uc.a.run.app/prompts/templates/process';
		const response = await fetch(url, options);

		console.log(response);
		const json = await response.json();
		console.log('json', json);
	});
});
