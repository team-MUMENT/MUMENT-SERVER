"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middlewares/auth"));
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
// 소셜 로그인/회원가입
router.post('/login', controllers_1.AuthController.login);
// 액세스 토큰 재발급
router.get('/token', auth_1.default, controllers_1.AuthController.getNewAccessToken);
// 로그아웃
router.post('/logout', auth_1.default, controllers_1.AuthController.logout);
exports.default = router;
//# sourceMappingURL=AuthRouter.js.map