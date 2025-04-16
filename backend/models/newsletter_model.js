import Mongoose from 'mongoose';

const newsletterSchema = new Mongoose.Schema({
  email: { type: String, required: true, unique: true },
  time: { type: Date, default: Date.now }
});

const Newsletter = Mongoose.model('Newsletters', newsletterSchema);
export default Newsletter;
