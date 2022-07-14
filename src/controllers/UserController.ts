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

    if (!data) res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND_ID));
    res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_MY_MUMENT_LIST_SUCCESS, data));
  } catch (error) {
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  }
};

export default {
  getMyMumentList,
};
