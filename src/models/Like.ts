import mongoose from 'mongoose';
import { LikeInfo } from '../interfaces/like/LikeInfo';

const LikeSchema = new mongoose.Schema({
    user: {
        _id: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    mument: [
        {
            _id: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'Mument',
            },
            user: {
                name: {
                    type: String,
                    required: true,
                },
                image: {
                    type: String,
                    required: true,
                },
            },
            music: {
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
            },
            isFirst: {
                type: Boolean,
                required: true,
            },
            impressionTag: [Number],
            feelingTag: [Number],
            content: {
                type: String,
            },
            isPrivate: {
                type: Boolean,
                required: true,
                default: false,
            },
            createdAt: {
                type: Date,
                required: true,
            },
        },
    ],
});

export default mongoose.model<LikeInfo & mongoose.Document>('Like', LikeSchema);
