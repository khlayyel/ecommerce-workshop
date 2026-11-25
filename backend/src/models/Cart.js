import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 }
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optionnel, si authentification
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now, expires: 86400 } // expire après 24h
});

export default mongoose.model('Cart', cartSchema);
