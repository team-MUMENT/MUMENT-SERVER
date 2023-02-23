"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const promise_mysql_1 = __importDefault(require("promise-mysql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.NODE_ENV == 'production' ? config_1.default.hostProd : config_1.default.host,
    port: process.env.NODE_ENV == 'production' ? config_1.default.dbPortProd : config_1.default.dbPort,
    user: process.env.NODE_ENV == 'production' ? config_1.default.userProd : config_1.default.user,
    password: process.env.NODE_ENV == 'production' ? config_1.default.passwordProd : config_1.default.password,
    database: process.env.NODE_ENV == 'production' ? config_1.default.databaseProd : config_1.default.database,
    connectionLimit: 300,
    charset: 'utf8mb4'
};
console.log("create Pool");
exports.default = promise_mysql_1.default.createPool(dbConfig);
//# sourceMappingURL=db.js.map