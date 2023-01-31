"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const promise_mysql_1 = __importDefault(require("promise-mysql"));
const dbConfig = {
    host: config_1.default.host,
    port: config_1.default.dbPort,
    user: config_1.default.user,
    password: config_1.default.password,
    database: config_1.default.database,
    connectionLimit: 300,
    charset: 'utf8mb4'
};
console.log("create Pool");
exports.default = promise_mysql_1.default.createPool(dbConfig);
//# sourceMappingURL=db.js.map