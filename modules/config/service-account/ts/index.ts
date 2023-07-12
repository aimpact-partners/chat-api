import * as dotenv from 'dotenv';
dotenv.config();

export /*bundle*/ const credential = {
	type: process.env.GCLOUD_TYPE,
	project_id: process.env.GCLOUD_PROJECT_ID,
	private_key_id: process.env.GCLOUD_PRIVATE_KEY_ID,
	private_key: process.env.GCLOUD_PRIVATE_KEY,
	client_email: process.env.GCLOUD_CLIENT_EMAIL,
	client_id: process.env.GCLOUD_CLIENT_ID,
	auth_uri: process.env.GCLOUD_AUTH_URI,
	token_uri: process.env.GCLOUD_TOKEN_URI,
	auth_provider_x509_cert_url: process.env.GCLOUD_AUTH_PROVIDER,
	client_x509_cert_url: process.env.GCLOUD_CLIENT_CERT_URL,
	universe_domain: process.env.GCLOUD_UNIVERSE_DOMANIN,
};
