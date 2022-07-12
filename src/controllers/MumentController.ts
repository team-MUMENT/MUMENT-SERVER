import express, { Request, Response } from "express";
import statusCode from "../modules/statusCode";
import message from "../modules/responseMessage";
import util from "../modules/util";
import { MumentService } from "../services";
import { MumentCreateDto } from "../interfaces/mument/MumentCreateDto";
import { PostBaseResponseDto } from "../interfaces/common/PostBaseResponseDto";

/**
 *  @route POST /mument/:userId/:musicId
 *  @desc Create Mument
 */
const createMument = async (req: Request, res: Response) => {
    const mumentCreateDto: MumentCreateDto = req.body;
    const { userId, musicId } = req.params;
    
    if (!userId || !musicId ) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.BAD_REQUEST));

    try {
        const data: PostBaseResponseDto | null = await MumentService.createMument(userId, musicId, mumentCreateDto);

        if (!data) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND));

        res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, message.CREATE_MUMENT_SUCCESS, data));
    } catch (error) {
        console.log(error);
        
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

export default {
    createMument,
}