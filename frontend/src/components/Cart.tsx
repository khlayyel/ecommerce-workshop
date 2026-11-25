import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

const Cart = () => {
  const { user } = useAuth();
  const { cart, loading, error, totalItems, totalPrice, updateQuantity, removeItem } = useCart();

  if (!user) {
    return (
      <section className="page">
        <h1>Panier</h1>
        <p className="notice">
          Vous devez être connecté pour consulter votre panier. <Link to="/login">Se connecter</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Votre sélection</p>
          <h1>Panier</h1>
          <p className="muted">{totalItems} article(s)</p>
        </div>
        <Link className="button secondary" to="/">Continuer mes achats</Link>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">Chargement du panier…</p>}

      {!loading && cart.items.length === 0 && (
        <p className="notice">Votre panier est vide. <Link to="/">Découvrir le catalogue</Link></p>
      )}

      {cart.items.length > 0 && (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <article className="cart-item" key={item.product._id}>
                <div className="cart-thumb">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} />
                  ) : (
                    <span>{item.product.category}</span>
                  )}
                </div>

                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  <p className="muted">{formatPrice(item.product.price)} l’unité</p>
                </div>

                <div className="quantity-control" aria-label={`Quantité pour ${item.product.name}`}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    aria-label="Diminuer la quantité"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>

                <p className="line-total">{formatPrice(item.product.price * item.quantity)}</p>

                <button
                  type="button"
                  className="link-button danger"
                  onClick={() => removeItem(item.product._id)}
                >
                  Supprimer
                </button>
              </article>
            ))}
          </div>

          <aside className="summary">
            <h2>Récapitulatif</h2>
            <div className="summary-row">
              <span>Sous-total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="summary-row">
              <span>Livraison</span>
              <span>Offerte</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <Link className="button full" to="/checkout">Passer au paiement</Link>
          </aside>
        </div>
      )}
    </section>
  );
};

export default Cart;
