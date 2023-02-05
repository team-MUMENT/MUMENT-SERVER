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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * API에서 공통으로 쓰이는 함수 모듈 분리
*/
//뮤멘트 리스트의 id를 순서를 보장하여 새로운 리스트로 반환
const mumentIdFilter = (mumentList) => __awaiter(void 0, void 0, void 0, function* () {
    let mumentIdList = [];
    const tagIdFormat = (item, idx) => __awaiter(void 0, void 0, void 0, function* () {
        mumentIdList.push(item.id);
    });
    yield mumentList.reduce((acc, curr, index) => __awaiter(void 0, void 0, void 0, function* () {
        return yield acc.then(() => tagIdFormat(curr, index));
    }), Promise.resolve());
    return mumentIdList;
});
//뮤멘트 id 리스트의 id값만 TagListInfo타입의 배열에 push해서 반환
const insertMumentIdIntoTagList = (mumentIdList) => { var mumentIdList_1, mumentIdList_1_1; return __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const tagList = [];
    try {
        for (mumentIdList_1 = __asyncValues(mumentIdList); mumentIdList_1_1 = yield mumentIdList_1.next(), !mumentIdList_1_1.done;) {
            let element = mumentIdList_1_1.value;
            tagList.push({ id: element, impressionTag: [], feelingTag: [], cardTag: [] });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (mumentIdList_1_1 && !mumentIdList_1_1.done && (_a = mumentIdList_1.return)) yield _a.call(mumentIdList_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return tagList;
}); };
exports.default = {
    mumentIdFilter,
    insertMumentIdIntoTagList,
};
//# sourceMappingURL=common.js.map