import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

const ImageLightbox = ({ imageUrl, productName, onClose, isOpen }) => {
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Contrôles de zoom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 rounded-full p-2 backdrop-blur-sm">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          disabled={zoom <= 1}
          className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        
        <span className="text-white px-3 flex items-center font-medium min-w-[60px] justify-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          disabled={zoom >= 3}
          className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div 
        className="relative max-w-4xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Nom du produit */}
      {productName && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          <p className="font-medium">{productName}</p>
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
