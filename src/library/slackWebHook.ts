import axios from 'axios';
import config from '../config';

let API_URL = config.webhookURI;

if (process.env.NODE_ENV == 'production') {
    API_URL = config.webhookReleaseURI;
} 

const API_REPORT_URL = config.webhookReportURI; // 기획_서버_신고접수 채널

// 마크다운 메세지 포맷 인터페이스
export interface SlackMdFormat {
    title: string;
    value: string;
}

// 슬랙 메세지 포맷
export interface SlackMessageFormat {
    title: string;
    text: string;
    type: string; // error / push / report
    fields?: SlackMdFormat[];
}

// 슬랙 메시지 전체
export interface SlackMessage {
    mrkdwn: boolean;
    text: string;
    attachments: SlackMessageFormat[];
}

const slackErrorMessage = (errorStack: any) => {
    return {
        title: 'MUMENT ec2 서버 오류',
        text: '서버 내부 오류입니다',
        type: 'error',
        fields: [
            {
                title: 'Error Stack:',
                value: `\`\`\`${errorStack}\`\`\``,
            },
        ],
    };
};

const slackPushFailMessage = (errorStack: any) => {
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

const slackReportMessage = (errorStack: any) => {
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
const getChannels = (type: string) => {
    if (type === 'error' || type === 'push') {
        return {
            production: API_URL,
        };
    } else {
        return {
            production: API_REPORT_URL,
        };
    }
};

// 슬랙 알림 보내기
const sendMessage = async (message: SlackMessageFormat) => {
    if (!message) {
        console.log('메세지 포맷이 없습니다.');
        return;
    }

    // 마크다운 적용
    const data: SlackMessage = {
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


    axios({
        url: getChannels(message.type).production,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data,
    });
};

export default { sendMessage, slackErrorMessage, slackPushFailMessage, slackReportMessage };
