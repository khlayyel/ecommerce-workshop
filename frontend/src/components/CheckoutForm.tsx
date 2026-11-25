import { useState } from 'react';
import type { FormEvent } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';

interface CheckoutFormProps {
  clientSecret: string;
  orderId: string;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#172033',
      '::placeholder': { color: '#7b8496' }
    },
    invalid: { color: '#c0392b' }
  }
};

const CheckoutForm = ({ clientSecret, orderId }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    });

    if (stripeError) {
      setError(stripeError.message || 'Le paiement a échoué');
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      navigate(`/orders/${orderId}`, { replace: true });
      return;
    }

    setProcessing(false);
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="card-element">Carte bancaire</label>
      <div className="card-element" id="card-element">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <button className="button full" type="submit" disabled={!stripe || processing}>
        {processing ? 'Paiement en cours…' : 'Payer'}
      </button>

      <p className="muted small">Paiement sécurisé par Stripe. Utilisez une carte de test en mode test.</p>
    </form>
  );
};

export default CheckoutForm;
