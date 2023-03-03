const constant = {
    NO_RESULT: 0, // 조회 결과가 없을 때
    
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
    NO_NOTICE: -17, // 아이디로 조회한 공지사항의 값이 없을 때
    CREATE_NOTICE_FAIL: -18, // 공지사항 등록 실패햇을 때
    WRONG_QUERYSTRING: -19, // 잘못된 쿼리스트링 일 때,
    FAIL_SOCIAL_AUTH: -20, // 소셜 로그인, 인증 관련 작업이 실패했을 때

    // apple
    NO_IDENTITY_TOKEN_SUB: -50, // 클라이언트에서 받은 identity token에 sub(id)값이 없을 때
    APPLE_UNAUTHORIZED: -51, // 애플 API 개발자 토큰 유효하지 않을 때
    APPLE_INTERNAL_SERVER_ERROR: -51, // 애플 API 서버 에러났을 때
    APPLE_SIGN_REVOKE_SUCCESS: -52, // 애플 탈퇴 시 서비스 연결 끊기 성공
    APPLE_SIGN_REVOKE_FAIL: -53, // 애플 탈퇴 시 서비스 연결 끊기 실패

    // kakao
    NO_AUTHENTICATION_CODE: -60, // authenticationCode가 클라이언트로부터 넘어오지 않았을 때
    INVALID_AUTHENTICATION_CODE: -61, // authenticationCode로 토큰 발급 or 프로필 조회가 불가할 때
    NO_KAKAO_REFRESH_TOKEN: -62, // 카카오 리프래쉬 토큰이 넘어오지 않았을 때
    LOGOUT_FAIL: -63, // 로그아웃 실패 시
    KAKAO_UNLINK_SUCCESS: -64, // 연결끊기 성공
    KAKAO_UNLINK_FAIL: -65, // 연결끊기 실패

    // jwt token
    TOKEN_EXPIRED: -100, // 토큰이 만료되었을 때
    TOKEN_INVALID: -101, // 유효하지 않은 토큰일 때
    WRONG_TOKEN: -102, // 올바르지 않은 토큰일 때
    TOKEN_NOT_BEFORE: -103, // 아직 갱신할 수 없는 토큰일 때
    NOT_PROFILE_SET_TOKEN: -110, // 프로필 설정이 안된 토큰일 때
    TOKEN_UNKNOWN_ERROR: -199, // 알 수 없는 토큰 에러

    // 유저 차단
    ALREADY_BLOCK: -200, // 이미 차단한 유저를 다시 차단하려 할 떄
    SELF_BLOCK: -201,
    BLOCKED_USER: -202, // 차단된 유저일 때

    // push alarm
    NOTICE_PUSH_FAIL: -300, // 공지사항 푸시 알림 실패
    NOTICE_PUSH_SUCCESS: -301, // 공지사항 푸시 알림 성공
    LIKE_PUSH_FAIL: -302, // 좋아요 푸시 알림 실패
    LIKE_PUSH_SUCCESS: -303, // 좋아요 푸시 알림 성공
};

export default constant;
