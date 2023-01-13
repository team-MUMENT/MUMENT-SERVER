import express, { Request, Response, NextFunction } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import constant from '../modules/serviceReturnConstant';
import userDB from '../modules/db/User';
import sendMessage, { SlackMessageFormat } from '../library/slackWebHook';
import poolPromise from '../loaders/db';
import dayjs from 'dayjs';
import { ReportRestrictionInfoRDB } from '../interfaces/user/ReportRestrictionInfoRDB';

/**
 * 신고로 인해 이용 제재중인 유저 처리 미들웨어
 */
export default async (req: Request, res: Response, next: NextFunction) => {
    // request-header에서 Bearer 토큰 받아오기
    const userId = req.body.userId;
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        const selectReportRestrictionQuery = 'SELECT * FROM report_restriction WHERE user_id=?';
        const restriction: ReportRestrictionInfoRDB[] = await connection.query(selectReportRestrictionQuery, [userId]);

        if (restriction.length === 0 ) next();

        /**
         * 현재 날짜 < 제재 마감일 이면 컨트롤러로 가는 것 제재함
         *  */ 
        const curr = new Date();
        const utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
        const KR_TIME_DIFF = 9 * 60 * 60 * 1000;


        // 한국 시간으로 현재 날짜 생성
        const kr_curr_date = new Date(utc + (KR_TIME_DIFF));


        if (dayjs(kr_curr_date).isBefore(restriction[0].restrict_end_date)) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.REPORT_RESTRICTION_USER));
        }
        
        next();

        await connection.commit(); // query1, query2 모두 성공시 커밋(데이터 적용)
    } catch (error) {
        console.log(error);
        await connection.rollback(); // query1, query2 중 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};