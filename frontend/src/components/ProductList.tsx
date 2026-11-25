import { useEffect, useState } from 'react';
import { getProducts } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, getErrorMessage } from '../utils/format';
import type { Product } from '../types';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    getProducts()
      .then(({ data }) => {
        if (!cancelled) setProducts(data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Impossible de charger le catalogue'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = async (product: Product) => {
    setFeedback(null);

    try {
      await addToCart(product._id, 1);
      setFeedback(`${product.name} ajouté au panier.`);
    } catch (err) {
      setFeedback(getErrorMessage(err, 'Impossible d’ajouter au panier'));
    }
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Atelier informatique</p>
          <h1>Catalogue</h1>
          <p className="muted">
            PCs, tablettes et fournitures sélectionnés pour équiper votre bureau.
          </p>
        </div>
        {!user && <p className="notice">Connectez-vous pour ajouter des articles au panier.</p>}
      </div>

      {feedback && <p className="feedback" role="status">{feedback}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">Chargement du catalogue…</p>}

      {!loading && !error && products.length === 0 && (
        <p className="notice">
          Aucun produit en base. Lancez <code>npm run seed</code> dans le dossier backend.
        </p>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product._id || product.name}>
            <div className="product-image">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} loading="lazy" />
              ) : (
                <span>{product.category}</span>
              )}
            </div>

            <div className="product-body">
              <span className="badge">{product.category}</span>
              <h3>{product.name}</h3>
              {product.description && <p className="product-description">{product.description}</p>}
              <p className="price">{formatPrice(product.price)}</p>
              <p className={product.stock > 0 ? 'stock' : 'stock out'}>
                {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
              </p>
              <button
                type="button"
                className="button"
                disabled={product.stock <= 0}
                onClick={() => handleAdd(product)}
              >
                Ajouter au panier
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductList;
