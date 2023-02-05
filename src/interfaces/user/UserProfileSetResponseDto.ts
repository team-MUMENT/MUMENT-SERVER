export interface UserProfileSetResponseDto {
    id: number;
    accessToken: string;
    refreshToken: string;
    userName: string;
    image?: string;
}
