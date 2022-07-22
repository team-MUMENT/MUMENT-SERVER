import mongoose from 'mongoose';
import config from '../config';
import Like from '../models/Like';
import Mument from '../models/Mument';
import Music from '../models/Music';
import User from '../models/User';
import HomeCandidate from '../models/HomeCandidate';
import BannerSelection from '../models/BannerSelection';
import TodaySelection from '../models/TodaySelection';
import AgainSelection from '../models/AgainSelection';

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoURI);
        mongoose.set('autoCreate', true);

        console.log('Mongoose Connected ...');

        /*
        User.createCollection().then(function (collection) {
            console.log('User Collection is created!!');
        });

        Music.createCollection().then(function (collection) {
            console.log('Music Collection is created!!');
        });

        Mument.createCollection().then(function (collection) {
            console.log('Mument Collection is created!!');
        });

        Like.createCollection().then(function (collection) {
            console.log('Like Collection is created!!');
        });

        HomeCandidate.createCollection().then(function (collection) {
            console.log('HomeCandidate Collection is created!!');
        });

        BannerSelection.createCollection().then(function (collection) {
            console.log('BannerSelection Collection is created!!');
        });

        TodaySelection.createCollection().then(function (collection) {
            console.log('TodaySelection Collection is created!!');
        });

        AgainSelection.createCollection().then(function (collection) {
            console.log('AgainSelection Collection is created!!');
        });
        */
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;
