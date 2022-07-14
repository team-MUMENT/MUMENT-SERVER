import mongoose from 'mongoose';

export interface MusicInfo {
  _id?: mongoose.Types.ObjectId;
  name: string;
  artist: string;
  image: string;
}
