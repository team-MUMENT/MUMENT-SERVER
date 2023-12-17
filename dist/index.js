"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const routes_1 = __importDefault(require("./routes"));
const admin = __importStar(require("firebase-admin"));
const serviceAccountKey_json_1 = __importDefault(require("../src/config/serviceAccountKey.json"));
const serviceAccountKeyRelease_json_1 = __importDefault(require("../src/config/serviceAccountKeyRelease.json"));
const functions = require("firebase-functions");
require('dotenv').config();
const serviceAccountEnv = process.env.NODE_ENV == 'production' ? serviceAccountKeyRelease_json_1.default : serviceAccountKey_json_1.default;
// firebase setting
let firebase;
if (admin.apps.length === 0) {
    firebase = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountEnv),
    });
}
else {
    firebase = admin.app();
}
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// router
app.use(routes_1.default);
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'production' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
// Express 앱을 Firebase Function으로 변환
const api = functions
    .runWith({
    timeoutSeconds: 300,
    memory: "512MB",
})
    .region("asia-northeast3")
    .https.onRequest((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // API 요청 디버깅용
    console.log("\n\n", "[api]", `[${req.method.toUpperCase()}]`, req.originalUrl, req.body);
    return app(req, res);
}));
// Firebase Function으로 변환된 모듈을 export
module.exports = {
    api,
};
/**
app.listen(process.env.PORT, () => {
   console.log(`
   ################################################
         🛡️  Server listening on port 🛡️
   ################################################
 `);
}).on('error', err => {
   console.error(err);
   process.exit(1);
});

export default app;
*/ 
//# sourceMappingURL=index.js.map