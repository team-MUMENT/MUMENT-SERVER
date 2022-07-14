import { UserMumentListResponseDto } from '../interfaces/user/UserMumentListResponseDto';
import Mument from '../models/Mument';
import User from '../models/User';
import Music from '../models/Music';
import dayjs from 'dayjs';

const getMyMumentList = async (userId: string): Promise<UserMumentListResponseDto | null> => {
  try {
    const myMumentList = await Mument.find({
      $and: [
        {
          'user._id': { $eq: userId },
        },
        {
          isDeleted: { $eq: true },
        },
      ],
    });

    const data = await Promise.all(
      myMumentList.map(async (mument: any) => {
        const music = await Music.findById(mument.music._id);

        if (!music) return null;

        const result = {
          _id: mument._id,
          user: {
            _id: mument._id,
            image: mument.image,
            name: mument.name,
          },
          music: {
            _id: music._id,
            name: music.name,
            artist: music.artist,
            image: music.image,
          },
          isFirst: mument.isFirst,
          impressionTag: mument.impressionTag,
          feelingTag: mument.feelingTag,
          content: mument.content,
          isPrivate: mument.isPrivate,
          likeCount: mument.likeCount,
          isLiked: true, //to-do
          createdAt: mument.createdAt, //to-do
          count: null, //to-do
          year: 2022, //to-do
          month: 7, //to-do
        };

        return result;
      }),
    );

    if (!data) {
      return {
        muments: [],
      };
    } else {
      return {
        muments: [],
      };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  getMyMumentList,
};
