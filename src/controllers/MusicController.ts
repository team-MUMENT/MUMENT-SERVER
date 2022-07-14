import express, { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { UserService } from '../services';
import { MusicService } from '../services';

/**
 * @ROUTE GET /:musicId/:userId
 * @DESC 곡 상세보기 뷰에서 music 정보와 나의 뮤멘트 정보 가져오기
 */
const getMusicAndMyMument = async (req: Request, res: Response) => {
  const { musicId, userId } = req.params;
  const error = validationResult(req);

  if (!error.isEmpty()) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
  };


  try {
    const data = await MusicService.getMusicAndMyMument(musicId, userId);
    
    if (!data) {
        return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, message.FIND_MUSIC_MYMUMENT_SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.SERVICE_UNAVAILABLE, message.INTERNAL_SERVER_ERROR));
  }
};

export default {
    getMusicAndMyMument,
};
