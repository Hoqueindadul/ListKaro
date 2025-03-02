import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/ListKaro", {
        });

        console.log("ListKaro Database is connected successfully");
    } catch (error) {
        console.error("Error found while connecting ListKaro Database", error);
        process.exit(1);
    }
};

export default connectDB;
