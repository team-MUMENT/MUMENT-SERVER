"use strict";
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
const db_1 = __importDefault(require("../loaders/db"));
/**
 * 쿼리 처리 3가지 모듈
 */
// 완성된 query만 받을 시
const query = (query) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            //Connection Pool 생성
            const pool = yield db_1.default;
            //Connection 생성
            const connection = yield pool.getConnection();
            try {
                //query 실행
                const result = yield connection.query(query);
                //Connection 할당 해제
                connection.release();
                //결과 반환
                resolve(result);
            }
            catch (err) {
                connection.release();
                reject(err);
            }
        }
        catch (err) {
            reject(err);
        }
    }));
});
// // query에 필요한 value를 따로 받을 시 
const queryValue = (query, value) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            //Connection Pool 생성
            const pool = yield db_1.default;
            //Connection 생성
            const connection = yield pool.getConnection();
            try {
                // value와 함께 query 실행
                const result = yield connection.query(query, value);
                connection.release();
                resolve(result);
            }
            catch (err) {
                connection.release();
                reject(err);
            }
        }
        catch (err) {
            reject(err);
        }
    }));
});
// 트랜잭션 필요 시
const transaction = (...args) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.default = {
    query,
    queryValue,
    // transaction
};
//# sourceMappingURL=pool.js.map