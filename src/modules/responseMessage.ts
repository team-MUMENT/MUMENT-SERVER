const message = {
    NULL_VALUE: '필요한 값이 없습니다.',
    NOT_FOUND: '존재하지 않는 자원',
    BAD_REQUEST: '잘못된 요청',
    INTERNAL_SERVER_ERROR: '서버 내부 오류',
    NOT_FOUND_ID: '존재하지 않는 id 입니다',
    WRONG_PARAMS: '파라미터값이 잘못되었습니다',
    WRONG_BODY: '바디 리퀘스트값이 잘못되었습니다',

    // user
    NO_USER_ID: '해당 아이디의 유저가 존재하지 않습니다.',
    NO_USER_PROFILEID: '존재하지 않는 프로필 아이디입니다',
    LOGIN_SUCCESS: '로그인 성공',
    LOGIN_FAIL: '로그인에 실패했습니다',
    SIGNUP_SUCCESS: '회원가입 성공',
    READ_MY_MUMENT_LIST_SUCCESS: '나의 뮤멘트 리스트 조회 성공',
    READ_LIKE_MUMENT_LIST_SUCCESS: '좋아요한 뮤멘트 리스트 조회 성공',
    BLOCK_SUCCESS: '유저 차단하기 성공',
    ALREADY_BLOCK_USER: '이미 차단한 유저입니다',
    SELF_BLOCK: '자기자신은 차단할 수 없습니다',
    READ_BLOCK_LIST: '차단 유저 조회 성공',
    DELETE_BLOCKED_USER_SUCCESS: '유저 차단 해제 성공',
    UPDATE_PROFILE_FAIL: '프로필 설정에 실패했습니다',
    PROFILE_SET_SUCCESS: '프로필 설정 성공',
    DUPLICATE_PROFILEID: '중복된 닉네임이 존재합니다',
    AVAILABLE_PROFILEID: '사용 가능한 닉네임입니다',
    CREATE_LEAVE_CATEGORY_FAIL: '탈퇴 사유 등록에 실패했습니다',
    CREATE_LEAVE_CATEGORY_SUCESS: '탈퇴 사유 등록 성공',
    DELETE_USER_FAIL: '유저 탈퇴에 실패했습니다',
    DELETE_USER_SUCCESS: '유저 탈퇴 성공',
    READ_NEWS_LIST_SUCCESS: '소식창 리스트 조회 성공',
    DELETE_NEWS_SUCCESS: '소식창 알림 제거 성공',
    READ_UNREAD_NEWS_SUCCESS: '소식창 새로운 알림 읽음 처리 성공',
    READ_UNREAD_NEWS_IS_EXIST_SUCCESS: '새로 추가된 알림이 있는지 조회 성공',
    COMPLETE_PROFILE_SET: '프로필 설정 완료된 유저입니다',
    BLOCKED_USER: '차단된 유저입니다',

    // mument
    NO_MUMENT_ID: '해당 아이디의 뮤멘트가 존재하지 않습니다',
    CREATE_MUMENT_SUCCESS: '뮤멘트 기록하기 성공',
    UPDATE_MUMENT_SUCCESS: '뮤멘트 수정하기 성공',
    READ_MUMENT_SUCEESS: '뮤멘트 상세보기 성공',
    DELETE_MUMENT_SUCCESS: '뮤멘트 삭제하기 성공',
    NOT_YOUR_MUMENT: '비밀글 입니다',
    READ_MUMENT_HISTORY_SUCCESS: '뮤멘트 히스토리 조회 성공',
    CREATE_LIKE_SUCCESS: '좋아요 등록 성공',
    CREATE_LIKE_FAIL: '좋아요 등록 실패',
    DELETE_LIKE_SUCCESS: '좋아요 취소 성공',
    DELETE_LIKE_FAIL: '좋아요 취소 실패',
    READ_ISFIRST_SUCCESS: '뮤멘트 처음/다시 조회 성공',
    READ_NOTICE_LIST_SUCCESS: '공지사항 리스트 조회 성공',
    READ_NOTICE_DETAIL_SUCCESS: '공지사항 상세보기 성공',
    CREATE_NOTICE_FAIL: '공지사항 등록 실패',
    READ_LIKE_USER_SUCCESS: '좋아요한 사용자 조회 성공',

    // home
    GET_RANDOM_MUMENT_SUCCESS: '랜덤 뮤멘트 리스트 조회 성공',
    RANDOM_TAG_FAIL: '랜덤 태그 생성 실패',
    GET_TODAY_MUMENT_SUCCESS: '오늘의 뮤멘트 리스트 조회 성공',
    GET_BANNER_SUCCESS: '배너 조회 성공',
    GET_AGAIN_MUMENT_SUCCESS: '다시 들은 곡 뮤멘트 리스트 조회 성공',

    // music
    NO_MUSIC_ID: '해당 아이디의 음악이 존재하지 않습니다',
    FIND_MUSIC_MYMUMENT_SUCCESS: '곡 상세, 나의 뮤멘트 조회 성공',
    READ_MUSIC_MUMENTLIST_SUCCESS: '뮤멘트 리스트 조회 성공',
    SEARCH_MUSIC_LIST_SUCCESS: '곡 검색하기 성공',

    // auth
    BODY_REQUIRED: '바디 리퀘스트에 필요한 값이 없습니다',
    NO_IDENTITY_TOKEN_SUB: 'apple authorization code에 sub(id)값이 없습니다',
    APPLE_LOGIN_SUCCESS: '애플 로그인 성공',
    APPLE_TOKEN_UNAUTHORIZED: '애플 API 개발자 토큰이 유효하지 않습니다',
    APPLE_SERVER_INTERNAL_ERROR: '애플 API 서버 자체 에러',
    NO_AUTHENTICATION_CODE: 'authentication code값이 없습니다',
    NO_KAKAO_REFRESH_TOKEN: '카카오 리프래쉬 토큰값이 없습니다',
    NOT_CORRECT_TOKEN: 'refresh token이 일치하지 않습니다',
    RENEW_ACCESS_TOKEN: 'access token 갱신 성공',
    RENEW_ACCESS_REFRESH_TOKEN: 'access token과 refresh token 갱신 성공',
    INVALID_AUTHENTICATION_CODE: '잘못된 AUTHENTICATION CODE 입니다.',

    //JWT
    NULL_VALUE_TOKEN: 'request-header에 토큰이 없습니다',
    TOKEN_EXPIRED: '토큰이 만료되었습니다',
    TOKEN_INVALID: '유효하지 않은 토큰입니다',
    WRONG_TOKEN: '잘못된 토큰입니다', //'jwt malformed' || 'jwt signature is required' || 'invalid signature'경우,
    PROFILE_SET_REQUIRED: '프로필 설정이 완료되지 않은 유저입니다',
    TOKEN_UNKNOWN_ERROR: '토큰 에러', // 그외의 토큰 에러

    //신고 제재
    REPORT_RESTRICTION_USER_SUCCESS: '신고 제재 유무 조회 성공',
    CREATE_REPORT_SUCCESS: '뮤멘트 신고하기 성공',

    //push alarm
    PUSH_ALARM_SUCCESS: '공지사항 등록, 소식창 등록 성공 / 푸시알림 성공',
    PUSH_ALARM_ERROR: '공지사항 등록, 소식창 등록 성공 / 푸시알림 실패',
};

export default message;
