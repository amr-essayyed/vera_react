import { useState } from "react";
import { getProductImageUrl } from "@/utils/imageUtils";

interface ProductImageProps {
  productId: number | string;
  productName: string;
  size?: string;
  className?: string;
  fallbackText?: string;
}

export default function ProductImage({ 
  productId, 
  productName, 
  size = "256", 
  className = "w-16 h-16 object-cover rounded border",
  fallbackText 
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageUrl = getProductImageUrl(productId, size);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-500 text-xs`}>
        {fallbackText || productName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-500 text-xs animate-pulse`}>
          Loading...
        </div>
      )}
      <img
        src={imageUrl}
        alt={productName}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
}