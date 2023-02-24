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
<<<<<<< HEAD
const API_URL = config_1.default.webhookURI;
=======
let API_URL = config_1.default.webhookURI;
if (process.env.NODE_ENV == 'production') {
    API_URL = config_1.default.webhookReleaseURI;
}
const API_REPORT_URL = config_1.default.webhookReportURI; // 기획_서버_신고접수 채널
>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
const slackErrorMessage = (errorStack) => {
    return {
        title: 'MUMENT ec2 서버 오류',
        text: '서버 내부 오류입니다',
<<<<<<< HEAD
=======
        type: 'error',
>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
        fields: [
            {
                title: 'Error Stack:',
                value: `\`\`\`${errorStack}\`\`\``,
            },
        ],
    };
};
<<<<<<< HEAD
// 슬랙 api url과 연결하는 함수
const getChannels = () => {
    return {
        production: API_URL,
    };
};
=======
const slackPushFailMessage = (errorStack) => {
    return {
        title: '푸시 실패자 알림',
        text: '푸시알림 실패자가 존재합니다',
        type: 'push',
        fields: [
            {
                title: 'Error Stack:',
                value: `\`\`\`${errorStack}\`\`\``,
            },
        ],
    };
};
const slackReportMessage = (errorStack) => {
    return {
        title: '신고 접수 알림',
        text: '신고가 접수되었습니다.',
        type: 'report',
        fields: [
            {
                title: 'Error Stack:',
                value: `\`\`\`${errorStack}\`\`\``,
            },
        ],
    };
};
// 슬랙 api url과 연결하는 함수
const getChannels = (type) => {
    if (type === 'error' || type === 'push') {
        return {
            production: API_URL,
        };
    }
    else {
        return {
            production: API_REPORT_URL,
        };
    }
};
>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
// 슬랙 알림 보내기
const sendMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (!message) {
        console.log('메세지 포맷이 없습니다.');
        return;
    }
    // 마크다운 적용
    const data = {
        mrkdwn: true,
        text: '',
        attachments: [],
    };
    // title과 text가 없을 경우
    if (!message.title && !message.text) {
        console.log('메세지 내용이 없습니다.');
        return;
    }
    data.attachments.push(message);
    (0, axios_1.default)({
<<<<<<< HEAD
        url: getChannels().production,
=======
        url: getChannels(message.type).production,
>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data,
    });
});
<<<<<<< HEAD
exports.default = { sendMessage, slackErrorMessage };
=======
exports.default = { sendMessage, slackErrorMessage, slackPushFailMessage, slackReportMessage };
>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
//# sourceMappingURL=slackWebHook.js.map