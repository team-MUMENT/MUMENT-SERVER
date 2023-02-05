export interface UserLeaveResponseDto {
    id: number;
    userId: number;
    userName: string;
    leaveCategoryId: number;
    leaveCategoryName: string;
    reasonEtc: string | null;
    createdAt: string;
}