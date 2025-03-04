import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      min: [0, 'Price cannot be less than 0']
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    image: [
        {
            public_id: {
              type: String,
              required: true
            },
            url: {
              type: String,
              required: true
            }
        }
    ],
      
    category: {
      type: String,
      required: [true, 'Please enter product category'],
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      min: [0, 'Stock cannot be less than 0'],
      default: 1
    },
    noOfReviews: {
      type: Number,
      default: 0
    },
    reviews: [
        {
            name: 
            {
                type: String,
                required: true
            },
            rating:{
                type: Number,
                required: true
            },
            comment:{
                type: String,
                required: true
            }
        }

    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const Product = mongoose.model('Product', productSchema);
  
  export default Product;