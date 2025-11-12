import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json'));

if (serviceAccount.private_key.includes('\\n')) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function test() {
  try {
    // Fetch your project info
    const userList = await admin.auth().listUsers(1);
    console.log('✅ Service account authorized. Users fetched:', userList.users.length);
  } catch (err) {
    console.error('❌ Authorization failed:', err.message);
  }
}

test();
