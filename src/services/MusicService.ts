import dayjs from 'dayjs';
import { MumentCardViewInterface } from '../interfaces/mument/MumentCardViewInterface';
import { MumentInfo } from '../interfaces/mument/MumentInfo';
import { MusicMumentListResponseDto } from '../interfaces/music/MusicMumentListResponseDto';
import { MusicMyMumentResponseDto } from '../interfaces/music/MusicMyMumentResponseDto';
import { MusicResponseDto } from '../interfaces/music/MusicResponseDto';
import Like from '../models/Like';
import Mument from '../models/Mument';
import Music from '../models/Music';
import dummyData from '../modules/dummyData'; // 임시 더미 데이터
import axios from 'axios';
import constant from '../modules/serviceReturnConstant';
const qs = require('querystring');
require('dotenv').config();


/**
 * 곡 상세보기 - 음악, 나의 뮤멘트 조회
 */
const getMusicAndMyMument = async (musicId: string, userId: string): Promise<MusicMyMumentResponseDto | null> => {
    try {
        /**
         * ✅ 몽고디비 연결 임시 주석처리 + 변수에 임시로 더미 넣어둠
         */
        const music = dummyData.musicDummy;
        const latestMument = dummyData.mumentDummy;

        // // 곡 조회
        // const music = await Music.findById(musicId);

        // 음악 조회 결과가 없을 때 404 에러
        if (!music) {
            return null;
        }

        // // 가장 최근에 작성한 뮤멘트 조회
        // const latestMument = await Mument.findOne({
        //     'user._id': userId,
        //     'music._id': musicId,
        //     isDeleted: false,
        // }).sort({
        //     createdAt: -1,
        // });   
        

        // myMument가 null일 경우 return
        if (latestMument === null) {
            const data = {
                music,
                myMument: null,
            };

            return data;
        }

        // 날짜 가공
        const mumentDate = dayjs(latestMument.createdAt).format('D MMM, YYYY');

        const myMumentId: string = latestMument._id.toString();
        

        /**
         * ✅ 몽고디비 연결 임시 주석처리 + 변수에 임시로 더미 넣어둠
         */
        const isLiked = false;
        // // isLiked 조회
        // const isLiked = Boolean(
        //     await Like.findOne({
        //         $and: [
        //             {
        //                 'user._id': { $eq: userId },
        //             },
        //             {
        //                 mument: { $elemMatch: { _id: latestMument._id } },
        //             },
        //         ],
        //     }),
        // );

        // 카드뷰 태그 리스트
        const cardTag: number[] = [];
        const impressionTagLength = latestMument.impressionTag.length;
        const feelingTagLength = latestMument.feelingTag.length;

        if (impressionTagLength >= 1 && feelingTagLength >= 1) {
            cardTag.push(latestMument.impressionTag[0], latestMument.feelingTag[0]);
        } else if (impressionTagLength >= 1 && feelingTagLength < 1) {
            cardTag.push(...latestMument.impressionTag.slice(0, 2));
        } else if (impressionTagLength < 1 && feelingTagLength >= 1) {
            cardTag.push(...latestMument.feelingTag.slice(0, 2));
        }

        const data = {
            music: music,
            myMument: {
                //...latestMument.toObject(), // ✅ 오류나서 잠깐 주석처리했어요! - 채은
                ...latestMument,
                cardTag: cardTag,
                date: mumentDate,
                isLiked: isLiked,
            },
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * 곡 상세보기 - 모든 뮤멘트 조회
 */
const getMumentList = async (musicId: string, userId: string, isLikeOrder: boolean): Promise<MusicMumentListResponseDto | null> => {
    try {
         /**
         * ✅ 몽고디비 연결 임시 주석처리 + 변수에 임시로 더미 넣어둠
         */       
        // let originalMumentList;

        // // mumentList 조회
        // switch (isLikeOrder) {
        //     case true: {
        //         // 좋아요순 정렬
        //         originalMumentList = await Mument.find({
        //             'music._id': musicId,
        //             isDeleted: false,
        //         }).sort({
        //             likeCount: -1,
        //         });
        //         break;
        //     }
        //     case false: {
        //         // 최신순 정렬
        //         originalMumentList = await Mument.find({
        //             'music._id': musicId,
        //             isDeleted: false,
        //         }).sort({
        //             createdAt: -1,
        //         });
        //         break;
        //     }
        // }

        // // 결과값이 없을 경우
        // if (originalMumentList.length === 0) {
        //     return null;
        // }

        // // mumentId array 리턴
        // const mumentIdList = originalMumentList.map(mument => mument._id.toString());
    
        // // 해당 유저아이디의 document에서 mumentIdList find
        // const likeList = await Like.findOne({
        //     'user._id': userId,
        //     'mument._id': { $in: mumentIdList },
        // });

        // let likeMumentIdList: string[] = [];

        // if (likeList) {
        //     likeMumentIdList = likeList.mument.map(mument => mument._id.toString());
        // }

        // // map 함수 사용을 위해 날짜 가공해주는 함수
        // const createDate = (createdAt: Date): string => {
        //     const date = dayjs(createdAt).format('D MMM, YYYY');
        //     return date;
        // };

        // // 최종 리턴될 data
        // const mumentList: MumentCardViewInterface[] = [];
        // originalMumentList.reduce((ac: MumentCardViewInterface[], cur, index) => {
        //     // 카드뷰 태그 리스트
        //     const cardTag: number[] = [];
        //     const impressionTagLength = cur.impressionTag.length;
        //     const feelingTagLength = cur.feelingTag.length;

        //     if (impressionTagLength >= 1 && feelingTagLength >= 1) {
        //         cardTag.push(cur.impressionTag[0], cur.feelingTag[0]);
        //     } else if (impressionTagLength >= 1 && feelingTagLength < 1) {
        //         cardTag.push(...cur.impressionTag.slice(0, 2));
        //     } else if (impressionTagLength < 1 && feelingTagLength >= 1) {
        //         cardTag.push(...cur.feelingTag.slice(0, 2));
        //     }

        //     mumentList[index] = {
        //         ...cur.toObject(),
        //         cardTag: cardTag,
        //         date: createDate(cur.createdAt),
        //         isLiked: likeMumentIdList.includes(mumentIdList[index].toString()),
        //     };
        //     return mumentList;
        // }, []);

        // const data: MusicMumentListResponseDto = {
        //     mumentList,
        // };
        const data: MusicMumentListResponseDto = dummyData.getMumentListDummy;

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * 곡 검색 - apple music api 사용 곡 검색 / 최대 25개의 곡 리스트 반환 가능
 */
const getMusicListBySearch = async (keyword: string): Promise<MusicResponseDto[] | number | void> => {
    try {        
        const token = 'Bearer ' + process.env.APPLE_DEVELOPER_TOKEN as string;
        let musiclist: MusicResponseDto[] = [];

        const appleResponse = async (searchKeyword: string) => {
            await axios.get('https://api.music.apple.com/v1/catalog/kr/search?types=songs&limit=25&term=' 
                + encodeURI(searchKeyword), {
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'Authorization': token
                    },
                }
            )
            .then(function (response) {
                /* apple api에서 받을 수 있는 3개 status code 대응 - 200, 401, 500*/
                // 200 - success
                const appleMusicList = response.data.results.songs.data;

                musiclist =  appleMusicList.map((music: any) => {
                    let imageUrl = music.attributes.artwork.url;
                    imageUrl = imageUrl.replace('{w}x{h}', '400x400'); //앨범 이미지 크기 400으로 지정

                    const m: MusicResponseDto = {
                        '_id': music.id,
                        'name': music.attributes.name,
                        'artist': music.attributes.artistName,
                        'image': imageUrl
                    };
                    return m;
                });
                return musiclist;
            })
            .catch(function (error) {
                // 401 - A response indicating an incorrect Authorization header
                if (error.response.status == 401) return constant.APPLE_UNAUTHORIZED;

                // 500 - indicating an error occurred on the apple music server
                if (error.response.status == 500) return constant.APPLE_INTERNAL_SERVER_ERROR;

                console.log(error);
            });

            return musiclist;
        };
        const data = await appleResponse(keyword);

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
export default {
    getMusicAndMyMument,
    getMumentList,
    getMusicListBySearch,
};
