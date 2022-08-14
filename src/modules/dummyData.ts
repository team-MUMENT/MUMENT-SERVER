import mongoose from "mongoose";

/**
 * 마이그레이션을 위한 임시 더미 데이터
*/ 
const musicDummy = {
    "_id": new mongoose.Types.ObjectId("62cd4416177f6e81ee8fa398"),
    "name": "더미 음악 제목",
    "artist": "THAMA",
    "image": "dummy.jpg"
};

const userDummy = {
    "_id": new mongoose.Types.ObjectId("62cd5d4383956edb45d7d0ef"),
    "name": "유저더미",
    "image": "dummy.jpg"
};

const loginDummy = {
    "id": new mongoose.Types.ObjectId("62cd5d4383956edb45d7d0ef"),
    "name": "유저더미",
    "profileId": "user",
    "image": "dummy.jpg"
};

const mumentDummy = {
    "_id": new mongoose.Types.ObjectId("62cd6d136500907694a2a548"),
    "music": {
        "_id": new mongoose.Types.ObjectId("62cd4416177f6e81ee8fa398")
    },
    "user": {
        "_id": new mongoose.Types.ObjectId("62cd5d4383956edb45d7d0ef"),
        "name": "유저더미",
        "image": "dummy.jpg"
    },
    "isFirst": true,
    "impressionTag": [
        100,
        101,
        103
    ],
    "feelingTag": [
        200,
        201
    ],
    "content": "더미 코멘트",
    "isPrivate": false,
    "likeCount": 2,
    "isDeleted": false,
    "createdAt": new Date("2022-07-12T12:46:11.591Z"),
    "updatedAt": new Date("2022-07-18T20:18:51.026Z"),
    "__v": 0
};


// 곡 상세보기 - 모든 뮤멘트 data 더미
const getMumentListDummy = {
    "mumentList": [
        {
            "_id": new mongoose.Types.ObjectId("62cd6d136500907694a2a548"),
            "music": {
                "_id": new mongoose.Types.ObjectId("62cd4416177f6e81ee8fa398")
            },
            "user": {
                "_id": new mongoose.Types.ObjectId("62cd5d4383956edb45d7d0ef"),
                "name": "더미유저",
                "image": "dummy.jpg"
            },
            "isFirst": true,
            "impressionTag": [
                100,
                101,
                103
            ],
            "feelingTag": [
                200,
                201
            ],
            "content": "더미 텍스트",
            "isPrivate": false,
            "likeCount": 2,
            "isDeleted": false,
            "createdAt": new Date("2022-07-12T12:46:11.591Z"),
            "updatedAt": new Date("2022-07-18T20:18:51.026Z"),
            "__v": 0,
            "cardTag": [
                100,
                200
            ],
            "date": "12 Jul, 2022",
            "isLiked": false
        }
    ]
};

// 나의 히스토리 임시 data
const myHistoryDummy = {
    "music": musicDummy,
    "mumentHistory": getMumentListDummy["mumentList"]
};

// 홈 임시 data
const todaySelectionDummy = {
    "mumentId": new mongoose.Types.ObjectId("62cd6d136500907694a2a548"),
    "music": {
        "_id": "62cd4416177f6e81ee8fa398",
        "name": "더미 음악 제목",
        "artist": "THAMA"
    },
    "user": {
        "_id": "62cd5d4383956edb45d7d0ef",
        "name": "유저더미",
        "image": "dummy.jpg"
    },
    "content": "더미 텍스트",
    "isFirst": false,
    "feelingTag": [],
    "impressionTag": [],
    "cardTag": [],
    "createdAt": new Date("2022-07-12T12:46:11.591Z"),
    "date": "20 Jul, 2022",
    "displayDate": new Date("2022-07-18T20:18:51.026Z")
};

export default {
    musicDummy,
    userDummy,
    loginDummy,
    mumentDummy,
    getMumentListDummy,
    myHistoryDummy,
    todaySelectionDummy,
};