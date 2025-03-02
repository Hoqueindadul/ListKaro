import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
    name: String,
    imageUrl: String
});

const ImageModel = mongoose.model("lists", ImageSchema);
export default ImageModel;
