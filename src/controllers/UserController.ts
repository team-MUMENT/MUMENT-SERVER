import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { UserService } from '../services';

/**
 *  @ROUTE GET /my/:userId/list
 *  @DESC Get My Mument List
 */
const getMyMumentList = async (req: Request, res: Response) => {
  //const { tag1, tag2, tag3 } = req.query;
  const { userId } = req.params;

  try {
    const data = await UserService.getMyMumentList(userId);

    if (!data) res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NOT_FOUND_ID));
  } catch (error) {
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  }
};

export default {
  getMyMumentList,
};
