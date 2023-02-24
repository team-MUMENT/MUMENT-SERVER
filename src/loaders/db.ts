import config from '../config';
import mysql from 'promise-mysql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.NODE_ENV == 'production' ? config.hostProd : config.host,
    port: process.env.NODE_ENV == 'production' ? config.dbPortProd : config.dbPort,
    user: process.env.NODE_ENV == 'production' ? config.userProd: config.user,
    password: process.env.NODE_ENV == 'production' ? config.passwordProd : config.password,
    database: process.env.NODE_ENV == 'production' ? config.databaseProd : config.database,
    connectionLimit: 300,
    charset: 'utf8mb4'
};
console.log("create Pool");

export default mysql.createPool(dbConfig);