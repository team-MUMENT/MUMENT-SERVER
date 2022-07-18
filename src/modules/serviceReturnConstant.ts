const constant = {
    CREATE_SUCCESS: 1, // 생성 성공
    UPDATE_SUCCESS: 2, // 업데이트 성공
    DELETE_SUCCESS: 3, // 삭제 성공

    NO_USER: -1, // 아이디로 조회한 유저의 값이 없을 때
    NO_MUSIC: -2, // 아이디로 조회한 음악의 값이 없을 때
    NO_MUMENT: -3, // 아이디로 조회한 뮤멘트의 값이 없을 때
    WRONG_PASSWORD: -4, // 패스워드가 일치하지 않을 때
};

export default constant;
