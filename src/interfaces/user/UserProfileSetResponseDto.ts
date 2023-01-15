export interface UserProfileSetResponseDto {
    id: number;
    accessToken: string;
    refreshToken: string;
    profileId: string;
    image?: string;
}
