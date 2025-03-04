// import mongoose from "mongoose";

// async function connectDatabase(uri) {
//     return mongoose.connect(uri)
// }

// export default connectDatabase

import mongoose from "mongoose";

const connectDB = (uri) => {
    mongoose.connect(uri, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    })
    .then(() => console.log("List Karo is Connected to database"))
    .catch((error) => {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    });
};

export default connectDB;

