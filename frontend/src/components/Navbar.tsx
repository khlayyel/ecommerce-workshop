import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">A</span>
          <span>Atelier</span>
        </Link>

        <nav className="nav-links">
          <NavLink className={linkClass} to="/" end>Catalogue</NavLink>
          <NavLink className={linkClass} to="/cart">
            Panier{totalItems > 0 ? ` (${totalItems})` : ''}
          </NavLink>
          {user && <NavLink className={linkClass} to="/orders">Mes commandes</NavLink>}
        </nav>

        <div className="nav-account">
          {user ? (
            <>
              <span className="user-name">{user.name}</span>
              <button type="button" className="link-button" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink className={linkClass} to="/login">Connexion</NavLink>
              <NavLink className="button small" to="/register">Créer un compte</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
