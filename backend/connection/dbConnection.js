// import mongoose from "mongoose";

// async function connectDatabase(uri) {
//     return mongoose.connect(uri)
// }

// export default connectDatabase

import mongoose from "mongoose";

const connectDB = () => {
    mongoose.connect("mongodb://localhost:27017/ListKaro", {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    })
    .then(() => console.log("List Karo is Connected"))
    .catch((error) => {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    });
};

export default connectDB;

