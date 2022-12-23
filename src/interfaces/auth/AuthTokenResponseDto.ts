// access token, refresh token 발급시 리스폰스 dto
export interface AuthTokenResponseDto {
    accessToken: string;
    refreshToken: string;
}