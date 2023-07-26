import { join } from 'path';
import admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const credentials = join(process.cwd(), './credentials/gcloud.json');
initializeApp({ credential: admin.credential.cert(credentials) });

export /*bundle*/ const db = getFirestore();
console.log(0.1, db);
