import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export const createPaymentIntent = async (amount, currency = 'eur') => {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe utilise les centimes
    currency,
    automatic_payment_methods: { enabled: true }
  });
};

export { stripe };
export default stripe;
