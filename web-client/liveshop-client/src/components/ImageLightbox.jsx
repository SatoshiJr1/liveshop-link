import React from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ImageLightbox = ({ imageUrl, productName, onClose, isOpen }) => {
  const [zoom, setZoom] = React.useState(1);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Bouton fermer */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-10 h-10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Contrôles de zoom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 rounded-full p-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full"
          disabled={zoom <= 1}
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <span className="text-white px-3 flex items-center font-medium">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full"
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
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
      <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
        <p className="font-medium">{productName}</p>
      </div>
    </div>
  );
};

export default ImageLightbox;
