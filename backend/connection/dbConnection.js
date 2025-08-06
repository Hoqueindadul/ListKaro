import mongoose from "mongoose";

const connectDB = (uri) => {
    mongoose.connect(uri)
        .then(() => console.log("List Karo is Connected to database"))
        .catch((error) => {
            if (error.code === "ECONNREFUSED"){
                console.log("You are not connect to the network!!")
            }
            else{
                console.error("MongoDB Connection Error:", error);
            }
            process.exit(1);
        });
};

export default connectDB;

