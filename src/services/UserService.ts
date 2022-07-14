import { UserMumentListResponseDto } from '../interfaces/user/UserMumentListResponseDto';
import Mument from '../models/Mument';
import User from '../models/User';
import Music from '../models/Music';
import dayjs from 'dayjs';
import Like from '../models/Like';
import { MumentResponseDto } from '../interfaces/mument/MumentResponseDto';

const getMyMumentList = async (userId: string): Promise<UserMumentListResponseDto | null> => {
  try {
    const loginUser = await User.findById(userId);
    if (!loginUser) return null;

    const myMumentList = await Mument.find({
      $and: [
        {
          'user._id': { $eq: userId },
        },
        {
          isDeleted: { $eq: false },
        },
      ],
    }).sort({ createdAt: -1 });

    if (!myMumentList) {
      return {
        muments: [],
      };
    }

    const data = await Promise.all(
      myMumentList.map(async (mument: any) => {
        const music = await Music.findById(mument.music._id);

        const isLiked = await Like.findOne({
          $and: [
            {
              mument: { $elemMatch: { _id: mument._id } },
            },
            {
              'user._id': { $eq: userId },
            },
          ],
        });

        const result: MumentResponseDto = {
          _id: mument._id,
          user: {
            _id: mument.user._id,
            image: mument.user.image,
            name: mument.user.name,
          },
          music: {
            _id: !music ? null : music._id,
            name: !music ? '존재하지 않는 음악' : music.name,
            artist: !music ? '존재하지 않는 음악' : music.artist,
            image: !music ? '존재하지 않는 음악' : music.image,
          },
          isFirst: mument.isFirst,
          impressionTag: mument.impressionTag,
          feelingTag: mument.feelingTag,
          content: mument.content,
          isPrivate: mument.isPrivate,
          likeCount: mument.likeCount,
          isLiked: !isLiked ? false : true,
          createdAt: dayjs(mument.createdAt).format('D MMM, YYYY'),
          year: Number(dayjs(mument.createdAt).format('YYYY')),
          month: Number(dayjs(mument.createdAt).format('M')),
        };

        return result;
      }),
    );

    return {
      muments: data,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  getMyMumentList,
};
