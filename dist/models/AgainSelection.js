"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AgainSelectionSchema = new mongoose_1.default.Schema({
    mumentId: {
        type: mongoose_1.default.Types.ObjectId,
    },
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
exports.default = mongoose_1.default.model('AgainSelection', AgainSelectionSchema);
//# sourceMappingURL=AgainSelection.js.map