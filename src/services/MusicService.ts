import dayjs from 'dayjs';
import axios from 'axios';
import constant from '../modules/serviceReturnConstant';
import poolPromise from '../loaders/db';

import userDB from '../modules/db/User';

import { MumentCardViewInterface } from '../interfaces/mument/MumentCardViewInterface';
import { MusicMumentListResponseDto } from '../interfaces/music/MusicMumentListResponseDto';
import { MusicMyMumentResponseDto } from '../interfaces/music/MusicMyMumentResponseDto';
import { MusicResponseDto } from '../interfaces/music/MusicResponseDto';

import musicDB from '../modules/db/Music';

import cardTagList from '../modules/cardTagList';
import config from '../config';
import { MusicCreateDto } from '../interfaces/music/MusicCreateDto';

const qs = require('querystring');
require('dotenv').config();


/**
 * 곡 상세보기 - 음악, 나의 뮤멘트 조회
 */
const getMusicAndMyMument = async (musicId: string, userId: string, musicCreateDto: MusicCreateDto): Promise<MusicMyMumentResponseDto | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        // 우리 DB에 음악 존재안하면 새로 삽입
        await musicDB.SearchAndCreateMusic(musicCreateDto, connection);

        // 우리 DB에서 검색
        const music = await connection.query(musicDB.SearchMusic(musicId));
        if (music.length === 0) return constant.NO_MUSIC;

        // 가장 최근에 작성한 뮤멘트 조회
        const getLatestMumentQuery = `
        SELECT mument.*, user.profile_id as user_name, user.image as user_image
        FROM mument
        JOIN user
            ON mument.user_id = user.id
        WHERE mument.music_id = ?
            AND mument.user_id =?
            AND mument.is_deleted = 0
        ORDER BY mument.created_at DESC
        LIMIT 1;
        `;

        const latestMument = await connection.query(getLatestMumentQuery, [musicId, userId]);

        // myMument가 null일 경우 return
        if (latestMument.length === 0) {
            const data: MusicMyMumentResponseDto = {
                music: {
                    _id: music[0].id.toString(),
                    name: music[0].name,
                    artist: music[0].artist,
                    image: music[0].image,
                },
                myMument: null,
            };

            return data;
        };

        
        // 뮤멘트의 태그 전부 가져오기
        const getTagQuery = `
        SELECT tag_id
        FROM mument_tag
        WHERE mument_id = ?
            AND is_deleted = 0;
        `;

        const getTagResult = await connection.query(getTagQuery, [latestMument[0].id]);

        const tagList: number[] = [];
        const impressionTag: number[] = [];
        const feelingTag: number[] = [];

        for (const object of getTagResult) {
            tagList.push(object.tag_id);
            if (object.tag_id < 200) {
                impressionTag.push(object.tag_id);
            } else if (object.tag_id < 300) {
                feelingTag.push(object.tag_id);
            }
        };

        const mumentCardTag: number[] = await cardTagList.cardTag(tagList);

        const getIsLikedQuery = `
        SELECT EXISTS (
            SELECT *
            FROM mument.like
            WHERE mument_id = ?
                AND user_id = ?
        ) as is_liked;
        `;

        const isLikedResult = await connection.query(getIsLikedQuery, [latestMument[0].id, userId]);
        const isLiked: boolean = Boolean(isLikedResult[0].is_liked);


        // 날짜 가공
        const mumentDate = dayjs(latestMument[0].created_at).format('D MMM, YYYY');

        const myMument: MumentCardViewInterface = {
            _id: latestMument[0].id,
            music: {
                _id: latestMument[0].music_id.toString(),
            },
            user: {
                _id: latestMument[0].user_id,
                name: latestMument[0].user_name,
                image: latestMument[0].user_image,
            },
            isFirst: Boolean(latestMument[0].is_first),
            impressionTag,
            feelingTag,
            cardTag: mumentCardTag,
            content: latestMument[0].content,
            isPrivate: Boolean(latestMument[0].is_private),
            likeCount: latestMument[0].like_count,
            isDeleted: Boolean(latestMument[0].is_deleted),
            createdAt: latestMument[0].created_at,
            updatedAt: latestMument[0].updated_at,
            date: mumentDate,
            isLiked
        };

        const data: MusicMyMumentResponseDto = {
            music: {
                _id: music[0].id.toString(),
                name: music[0].name,
                artist: music[0].artist,
                image: music[0].image,
            },
            myMument
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};

/**
 * 곡 상세보기 - 모든 뮤멘트 조회
 */
const getMumentList = async (musicId: string, userId: string, isLikeOrder: boolean, limit: any, offset: any): Promise<MusicMumentListResponseDto | number | null> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();
    
    try {
        const music = await connection.query(musicDB.SearchMusic(musicId));

        if (music.length === 0) return constant.NO_MUSIC;

        // 자신이 차단한, 자신을 차단한 유저 리스트
        const blockUserList: number[] = [];

        // 자신이 차단한 유저 반환
        const blockUserResult = await userDB.blockedUserList(userId);
        blockUserResult.forEach(element => {
            blockUserList.push(element.exist);
        });

        let strBlockUserList = '( 0 )';

        if (blockUserResult.length != 0) {
            strBlockUserList = '(' + blockUserList.toString() + ')';
        }

        let originalMumentList = [];
        switch (isLikeOrder) {
            case true: { // 좋아요순 정렬
                const getMumentListQuery = `
                SELECT mument.*, user.profile_id as user_name, user.image as user_image
                FROM mument
                JOIN user
                    ON mument.user_id = user.id
                WHERE mument.music_id = ?
                    AND mument.user_id NOT IN ${strBlockUserList}
                    AND mument.is_deleted = 0  
                    AND user.is_deleted = 0
                ORDER BY mument.like_count DESC
                LIMIT ? OFFSET ?;
                `;

                originalMumentList = await connection.query(getMumentListQuery, [musicId, limit, offset]);
            } case false: { // 최신순 정렬
                const getMumentListQuery = `
                SELECT mument.*, user.profile_id as user_name, user.image as user_image
                FROM mument
                JOIN user
                    ON mument.user_id = user.id
                WHERE mument.music_id = ?
                    AND mument.user_id NOT IN ${strBlockUserList}
                    AND mument.is_deleted = 0  
                    AND user.is_deleted = 0
                ORDER BY mument.created_at DESC
                LIMIT ? OFFSET ?;
                `;

                originalMumentList = await connection.query(getMumentListQuery, [musicId, limit, offset]);
            }
        }
        if (originalMumentList.length === 0) return null;

        // 태그 조회를 위해 뮤멘트 아이디만 빼오고, 스트링으로 만들어주기
        const mumentIdList = originalMumentList.map((x: { id: number; }) => x.id);
        const strMumentIdList = '(' + mumentIdList.join(', ') + ')';

        const tagList: {id: number, impressionTag: number[], feelingTag: number[], cardTag: number[]}[] = [];
        
        mumentIdList.forEach( (element: number) => {
            tagList.push({ id: element, impressionTag: [], feelingTag: [], cardTag: []})
        });

        // 해당 뮤멘트들의 태그 모두 가져오기
        const getAllTagQuery = `
        SELECT mument_id, tag_id
        FROM mument_tag
        WHERE mument_id IN ${strMumentIdList}
            AND is_deleted = 0
        ORDER BY mument_id, updated_at ASC;
        `;

        const getAllTagResult = await connection.query(getAllTagQuery);


        // impression tag, feeling tag 분류하기
        getAllTagResult.reduce((ac: any[], cur: any) =>  {
            const mumentIdx = tagList.findIndex(o => o.id === cur.mument_id);
            if (cur.tag_id < 200) {
                tagList[mumentIdx].impressionTag.push(cur.tag_id);
            } else if (cur.tag_id < 300) {
                tagList[mumentIdx].feelingTag.push(cur.tag_id);
            };
        }, getAllTagResult);

        for (const object of tagList) {
            const allTagList = object.impressionTag.concat(object.feelingTag);
            object.cardTag = await cardTagList.cardTag(allTagList);
        };

        
        // 뮤멘트 id와 isLiked를 담을 리스트 생성
        const isLikedList: {id: number, isLiked: boolean}[] = []

        mumentIdList.forEach((element: number) => {
            isLikedList.push({id: element, isLiked: false});
        });

        const getisLikedQuery = `
        SELECT mument_id as mid, EXISTS(
            SELECT *
            FROM mument.like
            WHERE mument_id = mid
                AND user_id = ?
        ) as is_liked
        FROM mument.like
        WHERE mument_id IN ${strMumentIdList}
        `;

        const getIsLikedResult = await connection.query(getisLikedQuery, [userId]);

        // 쿼리 결과에 존재하는 경우에만 isLiked를 true로 바꿈
        getIsLikedResult.reduce((ac: any[], cur: any) => {
            const mumentIdx = isLikedList.findIndex(o => o.id === cur.mument_id);
            if (mumentIdx != -1) isLikedList[mumentIdx].isLiked = true;
        }, getIsLikedResult);

        // string으로 날짜 생성해주는 함수
        const createDate = (createdAt: Date): string => {
            const date = dayjs(createdAt).format('D MMM, YYYY');
            return date;
        };

        const mumentList: MumentCardViewInterface[] = [];

        for (const mument of originalMumentList) {
            mumentList.push({
                _id: mument.id,
                musicId: mument.music_id.toString(),
                user: {
                    _id: mument.user_id,
                    name: mument.user_name,
                    image: mument.user_image,
                },
                isFirst: Boolean(mument.is_first),
                impressionTag: tagList[tagList.findIndex(o => o.id == mument.id)].impressionTag,
                feelingTag: tagList[tagList.findIndex(o => o.id == mument.id)].feelingTag,
                cardTag: tagList[tagList.findIndex(o => o.id == mument.id)].cardTag,
                content: mument.content,
                isPrivate: Boolean(mument.is_private),
                likeCount: mument.like_count,
                isDeleted: Boolean(mument.is_deleted),
                createdAt: mument.created_at,
                updatedAt: mument.updated_at,
                date: createDate(mument.created_at),
                isLiked: Boolean(isLikedList[isLikedList.findIndex(o => o.id == mument.id)].isLiked),
            });
        };

        const data: MusicMumentListResponseDto = {
            mumentList,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        connection.release(); 
    }
};

/**
 * 곡 검색 - apple music api 사용 곡 검색 / 최대 25개의 곡 리스트 반환 가능
 */
const getMusicListBySearch = async (keyword: string): Promise<MusicResponseDto[] | number | void> => {
    try {        
        const token = `Bearer ${config.appleDeveloperToken as string}`;

        let musicList: MusicResponseDto[] = [];

        const appleResponse = async (searchKeyword: string) => {
    
            await axios.get('https://api.music.apple.com/v1/catalog/kr/search?types=songs&limit=20&term=' 
                + encodeURI(searchKeyword), {
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'Authorization': token
                    }
                }
            )
            .then(async function (response: any) {
                /* apple api에서 받을 수 있는 3개 status code 대응 - 200, 401, 500*/       

                if (response.data.results.hasOwnProperty('songs')) {
                    // 401 - A response indicating an incorrect Authorization header
                    if (response.status == 401) return constant.APPLE_UNAUTHORIZED;

                    // 500 - indicating an error occurred on the apple music server
                    if (response.status == 500) return constant.APPLE_INTERNAL_SERVER_ERROR;

                    const appleMusicList = response.data.results.songs.data; 

                    musicList =  await appleMusicList.map((music: any) => {
                        let imageUrl = music.attributes.artwork.url;
                        imageUrl = imageUrl.replace('{w}x{h}', '400x400'); //앨범 이미지 크기 400으로 지정

                        const result: MusicResponseDto = {
                            '_id': music.id,
                            'name': music.attributes.name,
                            'artist': music.attributes.artistName,
                            'image': imageUrl
                        };
                        return result;
                    });
                }
                
                return musicList;
            })
            .catch(async function (error) {
                console.log('곡검색 애플 error', error);
                return constant.APPLE_INTERNAL_SERVER_ERROR;
            });

            return musicList;
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
