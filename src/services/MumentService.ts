import { PostBaseResponseDto } from "../interfaces/common/PostBaseResponseDto";
import { MumentCreateDto } from "../interfaces/mument/MumentCreateDto";
import Mument from "../models/Mument"
import Music from "../models/Music";
import User from "../models/User";

const createMument =async (userId: string, musicId: string, mumentCreateDto: MumentCreateDto): Promise<PostBaseResponseDto | null> => {
    try {
    
        const user = await User.findById(userId);
        if (!user) return null;

        const music = await Music.findById(musicId);
        if (!music) return null; 

        const mument = new Mument({
            music: {
                _id: musicId
            },
            user: {
                _id: userId,
                name: user.name,
                image: user.image
            },
            isFirst: mumentCreateDto.isFirst,
            impressionTag: mumentCreateDto.impressionTag,
            feelingTag: mumentCreateDto.feelingTag,
            content: mumentCreateDto.content ? mumentCreateDto.content : null,
            isPrivate: mumentCreateDto.isPrivate,
        });
        
        await mument.save();
        const data = {
            _id: mument._id
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default {
    createMument,
}