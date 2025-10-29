const path = require('path');
const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const serviceAccount = require(path.join(__dirname, '../../config/firebase-service-account.json'));

let app;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApp();
}

const auth = getAuth(app);

module.exports = { auth };
