import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { stripe, createPaymentIntent } from '../services/stripe.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const checkout = asyncHandler(async (req, res) => {
  const { items, totalAmount } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Le panier est vide' });
  }

  const amount = Number(totalAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Montant total invalide' });
  }

  const normalizedItems = items.map((item) => ({
    product: item.product?._id || item.product,
    quantity: Number(item.quantity),
    priceAtPurchase: Number(item.priceAtPurchase)
  }));

  // Créer l'intention de paiement
  const paymentIntent = await createPaymentIntent(amount);

  // Créer la commande en statut pending
  const order = new Order({
    user: req.user.id,
    items: normalizedItems,
    totalAmount: amount,
    stripePaymentIntentId: paymentIntent.id
  });
  await order.save();

  res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate('items.product');
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Identifiant de commande invalide' });
  }

  const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
    .populate('items.product');

  if (!order) return res.status(404).json({ message: 'Commande introuvable' });
  res.json(order);
});

// Webhook Stripe pour confirmer la commande après paiement réussi
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    const order = await Order.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id, status: { $ne: 'paid' } },
      { status: 'paid' },
      { new: true }
    );

    // Décrémenter le stock uniquement lors du premier passage du webhook.
    if (order) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }
  }

  res.json({ received: true });
};
