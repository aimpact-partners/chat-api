export /*bundle*/ function serviceAccountConfig() {
	const config = {
		type: process.env.GCLOUD_type,
		project_id: process.env.GCLOUD_project_id,
		private_key_id: process.env.GCLOUD_private_key_id,
		private_key: process.env.GCLOUD_private_key,
		client_email: process.env.GCLOUD_client_email,
		client_id: process.env.GCLOUD_client_id,
		auth_uri: process.env.GCLOUD_auth_uri,
		token_uri: process.env.GCLOUD_token_uri,
		auth_provider_x509_cert_url: process.env.GCLOUD_auth_provider_x509_cert_url,
		client_x509_cert_url: process.env.GCLOUD_client_x509_cert_url,
		universe_domain: process.env.GCLOUD_universe_domain,
	};

	return config;
}
