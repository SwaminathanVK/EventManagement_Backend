import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ConnectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log("MongoDb Connected Successfully!");
    } catch (error) {
        console.log(error);
    }
}

export default ConnectDB;