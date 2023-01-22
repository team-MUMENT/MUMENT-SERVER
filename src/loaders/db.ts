import config from '../config';
import mysql from 'promise-mysql';

const dbConfig = {
    host: config.host,
    port: config.dbPort,
    user: config.user,
    password: config.password,
    database: config.database,
    charset: 'utf8mb4',
};
console.log("create Pool");

export default mysql.createPool(dbConfig);