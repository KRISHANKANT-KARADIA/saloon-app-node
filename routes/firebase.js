const admin = require('firebase-admin');

const serviceAccount = require('./saloonapp-227b0-firebase-adminsdk-fbsvc-34ac2f23eb.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
