import mongoose from 'mongoose';
import { TodaySelectionInfo } from '../interfaces/home/TodaySelectionInfo';

const TodaySelectionSchema = new mongoose.Schema({
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
    content: {
        type: String,
        required: true,
    },
    isFirst: {
        type: Boolean,
        required: true,
    },
    feelingTag: [Number],
    impressionTag: [Number],
    cardTag: [Number],
    createdAt: {
        type: Date,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    displayDate: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<TodaySelectionInfo & mongoose.Document>('TodaySelection', TodaySelectionSchema);
