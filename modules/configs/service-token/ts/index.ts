import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';
import config from '@aimpact/chat-api/config';
import { serviceAccountConfig } from '@aimpact/chat-api/configs/service-accounts';

// Ruta al archivo de clave JSON de la cuenta de servicio
const serviceAccountKeyFile = serviceAccountConfig();

// ID de tu proyecto de Google Cloud
const projectId = process.env.GCLOUD_project_id;

// Construye la URL de la Cloud Function
const cloudFunctionUrl = config.params.AGENTS_SERVER;

// Genera un token de acceso y realiza la llamada a la Cloud Function
async function invokeCloudFunction(req, res) {
	try {
		// Crea el objeto de autenticación
		const auth = new GoogleAuth({
			keyFile: serviceAccountKeyFile,
			scopes: ['https://www.googleapis.com/auth/cloud-platform'],
		});

		// Obtiene las credenciales autenticadas
		const client = await auth.getClient();
		const token = await client.getAccessToken();

		console.log(5, client, token);

		// Configura la solicitud HTTP con el encabezado de autorización
		const options = {
			url: cloudFunctionUrl,
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: req.body,
		};

		// Realiza la solicitud HTTP a la Cloud Function

		const response = await fetch(this.#url, options);
		const responseJson = await response.json();
		console.log('respuesta', responseJson);
	} catch (error) {
		console.error('Error al obtener las credenciales:', error);
	}
}
