import axios from 'axios';
import config from '../config';

const API_URL = config.webhookURI;

// 마크다운 메세지 포맷 인터페이스
export interface SlackMdFormat {
    title: string;
    value: string;
}

// 마크다운
export interface SlackMessage {
    mrkdwn: boolean;
    text: string;
    attachments: SlackMdFormat[];
}

// 슬랙 메세지 포맷
export interface SlackMessageFormat {
    title: string;
    text: string;
    fields?: SlackMdFormat[];
    footer?: string;
}

// 슬랙 api url과 연결하는 함수
const getChannels = () => {
    return {
        production: API_URL,
    };
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
        text: ' ',
        attachments: [],
    };

    // title과 text가 없을 경우
    if (!message.title && !message.text) {
        console.log('메세지 내용이 없습니다.');
        return;
    }

    axios({
        url: getChannels().production,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data,
    });
};

export default sendMessage;
