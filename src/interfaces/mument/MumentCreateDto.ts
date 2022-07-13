import mongoose from 'mongoose';

export interface MumentCreateDto {
  isFirst: boolean;
  impressionTag: number[];
  feelingTag: number[];
  content?: string;
  isPrivate?: boolean;
}
