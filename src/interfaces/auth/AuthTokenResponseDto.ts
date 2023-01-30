/**
 * access token, refresh token 발급 후 Response DTO
*/ 

export interface AuthTokenResponseDto {
    _id: number; // 유저 id
    type: string; //signUp or login
    accessToken: string;
    refreshToken: string;
}