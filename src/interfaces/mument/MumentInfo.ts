import mongoose from 'mongoose';

export interface MumentInfo {
  music: {
    _id: mongoose.Types.ObjectId;
  };
  user: UserMumentInfo;
  isFirst: boolean;
  impressionTag: number[];
  feelingTag: number[];
  content: string;
  isPrivate: boolean;
  likeCount: number;
  isDeleted: boolean;
}

export interface UserMumentInfo {
  _id: mongoose.Types.ObjectId;
  name: string;
  image: string;
}
