import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../api/orders';
import { formatDate, formatPrice, getErrorMessage } from '../utils/format';
import type { Order, OrderStatus } from '../types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente de paiement',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée'
};

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Commande introuvable');
      setLoading(false);
      return;
    }

    let cancelled = false;

    getOrderById(id)
      .then(({ data }) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Impossible de charger la commande'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="page">
        <p className="muted">Chargement de la commande…</p>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="page">
        <h1>Commande</h1>
        <p className="error" role="alert">{error || 'Commande introuvable'}</p>
        <Link className="button secondary" to="/orders">Retour à mes commandes</Link>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Commande #{order._id.slice(-8).toUpperCase()}</p>
          <h1>{order.status === 'paid' ? 'Merci pour votre commande !' : 'Détail de la commande'}</h1>
          <p className="muted">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`status-badge status-${order.status}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {order.status === 'paid' && (
        <p className="notice success">
          Le paiement a été confirmé. Votre commande est en préparation.
        </p>
      )}

      <div className="order-detail-layout">
        <div className="panel">
          <h2>Articles</h2>
          {order.items.map((item, index) => (
            <div className="order-line" key={item.product?._id || index}>
              <div>
                <h3>{item.product?.name || 'Produit indisponible'}</h3>
                <p className="muted">Quantité : {item.quantity}</p>
              </div>
              <p>{formatPrice(item.priceAtPurchase * item.quantity)}</p>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h2>Paiement</h2>
          <div className="summary-row">
            <span>Statut</span>
            <span>{STATUS_LABELS[order.status] || order.status}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
          {order.stripePaymentIntentId && (
            <p className="muted small">Réf. Stripe : {order.stripePaymentIntentId}</p>
          )}
          <Link className="button secondary full" to="/orders">Toutes mes commandes</Link>
        </aside>
      </div>
    </section>
  );
};

export default OrderDetailPage;
