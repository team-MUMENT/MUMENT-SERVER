"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MumentSchema = new mongoose_1.default.Schema({
    music: {
        _id: {
            type: mongoose_1.default.Types.ObjectId,
            required: true,
            ref: 'Music',
        },
    },
    user: {
        _id: {
            type: mongoose_1.default.Types.ObjectId,
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
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Mument', MumentSchema);
//# sourceMappingURL=Mument.js.map