import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateCart = (cart) => cart.populate('items.product');

export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart) cart = { items: [] };
  res.json(cart);
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const parsedQuantity = Number(quantity) || 1;

  if (parsedQuantity < 1) {
    return res.status(400).json({ message: 'La quantité doit être supérieure à zéro' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Produit introuvable' });
  }

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += parsedQuantity;
  } else {
    cart.items.push({ product: productId, quantity: parsedQuantity });
  }

  await cart.save();
  await populateCart(cart);
  res.json(cart);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const quantity = Number(req.body.quantity);

  if (!Number.isFinite(quantity)) {
    return res.status(400).json({ message: 'Quantité invalide' });
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: 'Panier introuvable' });

  const item = cart.items.find((entry) => entry.product.toString() === productId);
  if (!item) return res.status(404).json({ message: 'Article introuvable dans le panier' });

  if (quantity <= 0) {
    cart.items = cart.items.filter((entry) => entry.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await populateCart(cart);
  res.json(cart);
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: 'Panier introuvable' });

  const hadItem = cart.items.some((entry) => entry.product.toString() === productId);
  if (!hadItem) return res.status(404).json({ message: 'Article introuvable dans le panier' });

  cart.items = cart.items.filter((entry) => entry.product.toString() !== productId);
  await cart.save();
  await populateCart(cart);
  res.json(cart);
});
