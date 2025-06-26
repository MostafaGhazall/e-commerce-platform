import { Product } from '../types/Product';
import { Heart, HeartOff } from 'lucide-react';
import { useWishlistStore } from '../contexts/useWishlistStore';
import { useAuthStore } from '../contexts/useAuthStore';
import { Link } from 'react-router-dom';

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const { user } = useAuthStore();

  const wishlistButton = (
    <button
      onClick={() => toggleWishlist(product.id)}
      className="absolute top-2 right-2 hover:cursor-pointer"
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isWishlisted ? (
        <Heart className="text-red-500 w-5 h-5" fill="currentColor" />
      ) : (
        <HeartOff className="text-gray-400 w-5 h-5" />
      )}
    </button>
  );

  return (
    <div className="relative border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition bg-white text-gray-900 flex flex-col h-full">
      {/* Wishlist Button */}
      {user ? (
        wishlistButton
      ) : (
        <Link to="/Login" className="absolute top-2 right-2" title="Sign in to use wishlist">
          <HeartOff className="text-gray-400 w-5 h-5" />
        </Link>
      )}

      {/* Product Info */}
      <Link to={`/product/${product.id}`} className="flex-1 flex flex-col">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-contain rounded mb-3"
        />
        <h3 className="font-bold text-lg text-[var(--primary-orange)] mb-1">{product.name}</h3>
        <p className="text-[var(--primary-redish)] font-semibold mb-2">EGP {product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">{product.description}</p>
      </Link>
    </div>
  );
};

export default ProductCard;
