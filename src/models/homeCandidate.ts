import mongoose from 'mongoose';
import { HomeCandidateInfo } from '../interfaces/home/HomeCandidateInfo';

const HomeCandidateSchema = new mongoose.Schema({
    mumentId: {
        type: mongoose.Types.ObjectId,
    },
    music: {
        _id: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Music',
        },
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
        required: true,
    },
    isPrivate: {
        type: Boolean,
        required: true,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    createdAt: {
        type: Date, // DB 스키마엔 timestamp라 써있음
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
});

export default mongoose.model<HomeCandidateInfo & mongoose.Document>('HomeCandidate', HomeCandidateSchema);
