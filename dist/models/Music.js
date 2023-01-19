"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MusicSchema = new mongoose_1.default.Schema({
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
});
exports.default = mongoose_1.default.model('Music', MusicSchema);
//# sourceMappingURL=Music.js.map