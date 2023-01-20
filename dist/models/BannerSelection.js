"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BannerSelectionSchema = new mongoose_1.default.Schema({
    music: {
        _id: {
            type: mongoose_1.default.Types.ObjectId,
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
    },
});
exports.default = mongoose_1.default.model('BannerSelection', BannerSelectionSchema);
//# sourceMappingURL=BannerSelection.js.map