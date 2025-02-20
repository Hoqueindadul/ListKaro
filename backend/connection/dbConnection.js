import mongoose from "mongoose";

async function connectDatabase(uri) {
    return mongoose.connect(uri)
}

export default connectDatabase