"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
require('dotenv').config();
const appleSignRevoke = (appleAccessToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield axios_1.default.post('https://appleid.apple.com/auth/revoke', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: {
                'client_id': process.env.APPLE_SERVICE_ID,
                'client_secret': config_1.default.appleDeveloperToken,
                'token': appleAccessToken,
                'token_type_hint': 'access_token'
            }
        })
            .then(function (response) {
            return __awaiter(this, void 0, void 0, function* () {
                if (response.status == 200) {
                    return serviceReturnConstant_1.default.APPLE_SIGN_REVOKE_SUCCESS;
                }
                else {
                    return serviceReturnConstant_1.default.APPLE_SIGN_REVOKE_FAIL;
                }
            });
        })
            .catch(function (error) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('애플 탈퇴 연동 끊기 axios error', error);
                return serviceReturnConstant_1.default.APPLE_INTERNAL_SERVER_ERROR;
            });
        });
        return serviceReturnConstant_1.default.APPLE_SIGN_REVOKE_SUCCESS;
    }
    catch (error) {
        console.log('애플 탈퇴 연동 끊기 error');
        console.log(error);
        throw error;
    }
});
exports.default = {
    appleSignRevoke,
};
//# sourceMappingURL=appleSignRevoke.js.map