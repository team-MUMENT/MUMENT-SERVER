const constant = {
    CREATE_SUCCESS: 1, // 생성 성공
    UPDATE_SUCCESS: 2, // 업데이트 성공
    DELETE_SUCCESS: 3, // 삭제 성공

    CREATE_FAIL: -1, // 생성 실패
    UPDATE_FAIL: -2, // 업데이트 실패
    DELETE_FAIL: -3, // 삭제 실패

    NO_USER: -11, // 아이디로 조회한 유저의 값이 없을 때
    NO_MUSIC: -12, // 아이디로 조회한 음악의 값이 없을 때
    NO_MUMENT: -13, // 아이디로 조회한 뮤멘트의 값이 없을 때
    WRONG_PASSWORD: -14, // 패스워드가 일치하지 않을 때
    NO_HOME_CONTENT: -15, // 홈에 들어갈 뮤멘트가 존재하지 않을 때
    PRIVATE_MUMENT: -16, // 비밀글에 다른 유저가 접속하려 할 때

    // apple
    NO_IDENTITY_TOKEN_SUB: -50, // 클라이언트에서 받은 identity token에 sub(id)값이 없을 때
    APPLE_UNAUTHORIZED: -51, // 애플 API 개발자 토큰 유효하지 않을 때
    APPLE_INTERNAL_SERVER_ERROR: -51, // 애플 API 서버 에러났을 때

    // kakao
    NO_AUTHENTICATION_CODE: -60, // authenticationCode가 클라이언트로부터 넘어오지 않았을 때

    // jwt token
    TOKEN_EXPIRED: -100, // 토큰이 만료되었을 때
    TOKEN_INVALID: -101, // 유효하지 않은 토큰일 때
    WRONG_TOKEN: -102, // 올바르지 않은 토큰일 때
    TOKEN_NOT_BEFORE: -103, // 아직 갱신할 수 없는 토큰일 때
    TOKEN_UNKNOWN_ERROR: -199, // 알 수 없는 토큰 에러
};

export default constant;
