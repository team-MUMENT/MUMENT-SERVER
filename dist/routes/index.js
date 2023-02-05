"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//router index file
const express_1 = require("express");
const UserRouter_1 = __importDefault(require("./UserRouter"));
const MumentRouter_1 = __importDefault(require("./MumentRouter"));
const MusicRouter_1 = __importDefault(require("./MusicRouter"));
const AuthRouter_1 = __importDefault(require("./AuthRouter"));
const router = (0, express_1.Router)();
router.use('/user', UserRouter_1.default);
router.use('/mument', MumentRouter_1.default);
router.use('/music', MusicRouter_1.default);
router.use('/auth', AuthRouter_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map