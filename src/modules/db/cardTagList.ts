/**
 * 뮤멘트 카드뷰에 띄우는 태그 리스트 만드는 모듈 - 최대 2개를 띄우되 감정, 인상 태그가 섞여있으면 1개씩 넣도록함
 * : 감정 태그 1, 인상 태그1 or 인상 태그 2 or 감정 태그 2 or 1개 이하는 존재하는 태그 넣도록
 * 
 */

const cardTag  = async (tagList: number[]) => { //인자로 뮤멘트의 전체 태그 리스트를 넘겨주면 됨
    let impressionTag: number[] = [], feelingTag: number[] = [];
    let impressionTagLength: number;
    let feelingTagLength: number;
    const cardTag: number[] = [];

    // 100이상 200미만 - impression tag, 200이상 300미만 - feeling tag
    for (let idx in tagList) {
        if (tagList[idx] < 200) {
            impressionTag.push(tagList[idx]);
        } else if (tagList[idx] < 300) {
            feelingTag.push(tagList[idx]);
        }
    }
    
    impressionTagLength = impressionTag.length;
    feelingTagLength = feelingTag.length;

    if (impressionTagLength >= 1 && feelingTagLength >= 1) {
        // 인상, 감정 태그 둘다 존재 시 - 1개씩 삽입
        cardTag.push(impressionTag[0], feelingTag[0]);
    } else if (impressionTagLength >= 1 && feelingTagLength < 1) {
        // 인상 태그만 존재 시 - 인상태그만 최대 2개 삽입
        cardTag.push(...impressionTag.slice(0, 2));
    } else if (impressionTagLength < 1 && feelingTagLength >= 1) {
        // 감정 태그만 존재 시 - 감정태그만 최대 2개 삽입
        cardTag.push(...feelingTag.slice(0, 2));
    }
    console.log('인상태그 ', impressionTag);
    console.log('감정태그 ', feelingTag);

    return cardTag;
};

export default {
    cardTag
}
