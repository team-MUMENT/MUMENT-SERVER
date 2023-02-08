import { TagListInfo } from "../interfaces/common/TagListInfo";
import { MumentAndUserInfoRDB } from "../interfaces/mument/MumentAndUserInfoRDB";
/**
 * API에서 공통으로 쓰이는 함수 모듈 분리
*/


//뮤멘트 리스트의 id를 순서를 보장하여 새로운 리스트로 반환
const mumentIdFilter = async (mumentList: MumentAndUserInfoRDB[]): Promise<number[]> => {
    let mumentIdList: number[] = [];

    const tagIdFormat = async (item: any, idx: number) => {
        mumentIdList.push(item.id);
    };
    
    await (mumentList as MumentAndUserInfoRDB[]).reduce(async (acc, curr, index) => {
        return await acc.then(() => tagIdFormat(curr, index));
    }, Promise.resolve());

    return mumentIdList;
};

//뮤멘트 id 리스트의 id값만 TagListInfo타입의 배열에 push해서 반환
const insertMumentIdIntoTagList = async (mumentIdList: number[]): Promise<TagListInfo[]> => {
    const tagList: TagListInfo[] = [];      

    for await (let element of mumentIdList) {
        tagList.push({ id: element, impressionTag: [], feelingTag: [], cardTag: []})
    }

    return tagList;
};


export default {
    mumentIdFilter,
    insertMumentIdIntoTagList,
}