import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import { checkout } from '../api/orders';
import type { CheckoutResponse } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, getErrorMessage } from '../utils/format';

const publicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const hasStripeKey = Boolean(publicKey && !publicKey.includes('placeholder'));
const stripePromise = hasStripeKey ? loadStripe(publicKey as string) : null;

const Checkout = () => {
  const { user } = useAuth();
  const { cart, totalPrice, loading } = useCart();
  const [session, setSession] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!user || cart.items.length === 0 || !hasStripeKey || started.current) return;

    started.current = true;
    setError(null);

    const items = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtPurchase: item.product.price
    }));

    checkout(items, totalPrice)
      .then(({ data }) => setSession(data))
      .catch((err) => {
        started.current = false;
        setError(getErrorMessage(err, 'Impossible de préparer le paiement'));
      });
  }, [user, cart.items, totalPrice, attempt]);

  if (!user) {
    return (
      <section className="page">
        <h1>Paiement</h1>
        <p className="notice">
          Connectez-vous pour finaliser votre commande. <Link to="/login">Se connecter</Link>
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="page">
        <h1>Paiement</h1>
        <p className="muted">Chargement de votre panier…</p>
      </section>
    );
  }

  if (cart.items.length === 0) {
    return (
      <section className="page">
        <h1>Paiement</h1>
        <p className="notice">Votre panier est vide. <Link to="/">Retour au catalogue</Link></p>
      </section>
    );
  }

  if (!hasStripeKey) {
    return (
      <section className="page">
        <h1>Paiement</h1>
        <p className="notice">
          Configurez <code>REACT_APP_STRIPE_PUBLIC_KEY</code> dans <code>frontend/.env</code> pour
          activer le paiement Stripe.
        </p>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Étape finale</p>
          <h1>Paiement</h1>
          <p className="muted">Votre commande sera confirmée par le webhook Stripe.</p>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="panel">
          <h2>Informations de paiement</h2>

          {error && (
            <div className="error-block" role="alert">
              <p>{error}</p>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setError(null);
                  setAttempt((value) => value + 1);
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {!error && !session && <p className="muted">Préparation du paiement…</p>}

          {session && (
            <Elements stripe={stripePromise}>
              <CheckoutForm clientSecret={session.clientSecret} orderId={session.orderId} />
            </Elements>
          )}
        </div>

        <aside className="summary">
          <h2>Votre commande</h2>
          {cart.items.map((item) => (
            <div className="summary-row" key={item.product._id}>
              <span>{item.product.name} × {item.quantity}</span>
              <span>{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <p className="muted small">
            Carte de test : 4242 4242 4242 4242, date future, CVC quelconque.
          </p>
        </aside>
      </div>
    </section>
  );
};

export default Checkout;
