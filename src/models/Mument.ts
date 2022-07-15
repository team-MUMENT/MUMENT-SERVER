import mongoose from 'mongoose';
import { MumentInfo } from '../interfaces/mument/MumentInfo';

const MumentSchema = new mongoose.Schema(
    {
        music: {
            _id: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'Music',
            },
        },
        user: {
            _id: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'User',
            },
            name: {
                type: String,
                required: true,
            },
            image: {
                type: String,
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
        likeCount: {
            type: Number,
            required: true,
            default: 0,
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<MumentInfo & mongoose.Document>(
    'Mument',
    MumentSchema,
);
