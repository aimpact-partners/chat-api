describe('run API', () => {
	test('tes endpoint ', async () => {
		const body = JSON.stringify({ prompt: 'dame un saludo motivacional' });
		const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };
		const url = 'https://chat-api-http-v2-rb5caohzgq-uc.a.run.app/prompts/templates/process';
		const response = await fetch(url, options);

		const { error, data } = await response.json();
		error ? console.error(error) : console.log(data);
	});
});
