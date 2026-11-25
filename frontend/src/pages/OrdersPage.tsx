import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/orders';
import { formatDate, formatPrice, getErrorMessage } from '../utils/format';
import type { Order, OrderStatus } from '../types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente de paiement',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée'
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMyOrders()
      .then(({ data }) => {
        if (!cancelled) setOrders(data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Impossible de charger vos commandes'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Suivi</p>
          <h1>Mes commandes</h1>
          <p className="muted">Historique et statut de vos achats.</p>
        </div>
        <Link className="button secondary" to="/">Retour au catalogue</Link>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">Chargement des commandes…</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="notice">Aucune commande pour le moment. <Link to="/">Commencer mes achats</Link></p>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order._id}>
            <div>
              <p className="eyebrow">Commande</p>
              <h2>#{order._id.slice(-8).toUpperCase()}</h2>
              <p className="muted">{formatDate(order.createdAt)}</p>
            </div>

            <div>
              <span className={`status-badge status-${order.status}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
              <p className="muted">{order.items.length} ligne(s)</p>
            </div>

            <p className="order-total">{formatPrice(order.totalAmount)}</p>

            <Link className="button secondary small" to={`/orders/${order._id}`}>
              Voir le détail
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default OrdersPage;
