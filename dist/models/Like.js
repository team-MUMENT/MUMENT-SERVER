"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const LikeSchema = new mongoose_1.default.Schema({
    user: {
        _id: {
            type: mongoose_1.default.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    mument: [
        {
            _id: {
                type: mongoose_1.default.Types.ObjectId,
                required: true,
                ref: 'Mument',
            },
            user: {
                _id: {
                    type: mongoose_1.default.Types.ObjectId,
                },
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
                _id: {
                    type: mongoose_1.default.Types.ObjectId,
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
exports.default = mongoose_1.default.model('Like', LikeSchema);
//# sourceMappingURL=Like.js.map