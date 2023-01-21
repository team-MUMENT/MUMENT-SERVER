import constant from '../modules/serviceReturnConstant';
import config from '../config';
const admin = require("firebase-admin");
let serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default {

}