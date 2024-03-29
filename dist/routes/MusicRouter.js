"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const express_validator_1 = require("express-validator");
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = (0, express_1.Router)();
router.get('/search', controllers_1.MusicController.getMusicListBySearch);
router.post('/:musicId', [
    (0, express_validator_1.param)('musicId').toInt().isInt(),
    (0, express_validator_1.body)('musicId').notEmpty(),
    (0, express_validator_1.body)('musicArtist').notEmpty(),
    (0, express_validator_1.body)('musicImage').notEmpty(),
    (0, express_validator_1.body)('musicName').notEmpty(),
], auth_1.default, controllers_1.MusicController.getMusicAndMyMument);
router.get('/:musicId/order', [
    (0, express_validator_1.param)('musicId').toInt().isInt(),
    (0, express_validator_1.query)('default').isString().isIn(['Y', 'N']),
], auth_1.default, controllers_1.MusicController.getMumentList);
exports.default = router;
//# sourceMappingURL=MusicRouter.js.map