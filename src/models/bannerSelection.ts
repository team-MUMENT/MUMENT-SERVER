import mongoose from 'mongoose';

const BannerSelection = new mongoose.Schema({
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
    impressionTag: Number,
    feelingTag: Number,
    tagTitle: {
        type: String,
        required: true,
    },
    displayDate: {
        type: Date,
        required: true,
    }
});