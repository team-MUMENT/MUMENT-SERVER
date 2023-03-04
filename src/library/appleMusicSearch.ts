import axios from "axios";
import config from "../config";
import { MusicResponseDto } from "../interfaces/music/MusicResponseDto";
import constant from "../modules/serviceReturnConstant";

// Apple Music Api 곡 검색 최대 50개 가져오기
const searchMusic = async (searchKeyword: string, offset: number) => {
    const token = `Bearer ${config.appleDeveloperToken as string}`;
    let musicList: MusicResponseDto[] = [];

    await axios.get(`https://api.music.apple.com/v1/catalog/kr/search?types=songs&limit=25&offset=${offset}&term=`
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

                    musicList =  await appleMusicList
                        .map((music: any) => {
                            let imageUrl = music.attributes.artwork.url;
                            imageUrl = imageUrl.replace('{w}x{h}', '400x400'); //앨범 이미지 크기 400으로 지정

                            // 연령제한 거르기
                            if (music.attributes.hasOwnProperty('contentRating') && music.attributes.contentRating == 'explicit') return;
                            const result: MusicResponseDto = {
                                '_id': music.id,
                                'name': music.attributes.name,
                                'artist': music.attributes.artistName,
                                'image': imageUrl
                            };

                            return result;
                        })
                        .filter((music: MusicResponseDto | null) => music);
                }
                
                return musicList;
            })
            .catch(async function (error) {
                console.log('곡검색 애플 error', error);
                return constant.APPLE_INTERNAL_SERVER_ERROR;
            });

            return musicList;
};


export default {
    searchMusic,
}