import config from '../config';
import mysql from 'promise-mysql';

const dbConfig = {
    host: config.host,
    port: config.dbPort,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: 50 // 최대 connection 개수
};
console.log("create Pool");

export default mysql.createPool(dbConfig);