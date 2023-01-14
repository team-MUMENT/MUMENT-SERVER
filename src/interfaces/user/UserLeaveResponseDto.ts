export interface UserLeaveResponseDto {
    id: number;
    userId: number;
    profileId: string;
    leaveCategoryId: number;
    leaveCategoryName: string;
    reasonEtc: string | null;
    createdAt: string;
}