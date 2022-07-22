import mongoose from 'mongoose';
import { AgainSelectionInfo } from '../interfaces/home/AgainSelectionInfo';

const AgainSelectionSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        required: true,
    },
    displayDate: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<AgainSelectionInfo & mongoose.Document>('AgainSelection', AgainSelectionSchema);
