import mongoose from 'mongoose';

export interface UserInfo {
  _id?: mongoose.Types.ObjectId;
  profileId: string;
  password: string;
  name: string;
  image: string;
}

export interface UserIdInfo {
  _id: mongoose.Types.ObjectId;
  image: string;
  name: string;
}
