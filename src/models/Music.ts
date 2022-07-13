import mongoose from 'mongoose';
import { MusicInfo } from '../interfaces/music/MusicInfo';

const MusicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

export default mongoose.model<MusicInfo & mongoose.Document>('Music', MusicSchema);
