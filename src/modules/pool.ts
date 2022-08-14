import poolPromise from "../loaders/db";

/**
 * 쿼리 처리 3가지 모듈
 */

// 완성된 query만 받을 시
const query = async (query: string) => {
    return new Promise ( async (resolve, reject) => {
        try {
            //Connection Pool 생성
            const pool: any = await poolPromise;

            //Connection 생성
            const connection = await pool.getConnection();

            try {
                //query 실행
                const result = await connection.query(query);
              
                //Connection 할당 해제
                connection.release(connection);
                
                //결과 반환
                resolve(result);
            } catch (err) {
                connection.release(connection);
                reject(err);
            }
        } catch (err) {
            reject(err);
        }
    });
};

// // query에 필요한 value를 따로 받을 시 
// const queryValue = async (query: string, value: any) => {
    
// };

// // 트랜잭션 필요 시
// const transaction =async (...args: any[]) => {
    
// };

export default {
    query,
    // queryValue,
    // transaction
};