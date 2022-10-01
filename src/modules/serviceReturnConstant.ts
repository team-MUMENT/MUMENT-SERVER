const constant = {
    CREATE_SUCCESS: 1, // 생성 성공
    UPDATE_SUCCESS: 2, // 업데이트 성공
    DELETE_SUCCESS: 3, // 삭제 성공

    NO_USER: -1, // 아이디로 조회한 유저의 값이 없을 때
    NO_MUSIC: -2, // 아이디로 조회한 음악의 값이 없을 때
    NO_MUMENT: -3, // 아이디로 조회한 뮤멘트의 값이 없을 때
    WRONG_PASSWORD: -4, // 패스워드가 일치하지 않을 때
    NO_HOME_CONTENT: -5, // 홈에 들어갈 뮤멘트가 존재하지 않을 때
    PRIVATE_MUMENT: -6, // 비밀글에 다른 유저가 접속하려 할 때

    NO_IDENTITY_TOKEN_SUB: -50, // 클라이언트에서 받은 identity token에 sub(id)값이 없을 때
};

export default constant;
