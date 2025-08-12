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
  quantity: {
    value: {
      type: Number,
      required: true,
      default: 1,              // default quantity value if not provided
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'litre', 'ml', 'pcs'],
      required: true,
      default: 'pcs',          // default unit if not provided
    }
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
    default: 0
  },
  noOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;