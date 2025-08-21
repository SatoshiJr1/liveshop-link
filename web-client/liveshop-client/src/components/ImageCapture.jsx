import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { Button } from './ui/button';

const ImageCapture = ({ onImageCaptured, onImageRemoved }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Ajuster la taille du canvas à la vidéo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Capturer l'image
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertir en blob
      canvas.toBlob(async (blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage({ blob, url: imageUrl });
        stopCamera();
        
        // Upload l'image
        await uploadImage(blob);
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploading(true);
      await uploadImage(file);
      setUploading(false);
    }
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'payment_proof');

      const response = await fetch('http://localhost:3001/api/upload/image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        onImageCaptured(data.imageUrl);
      } else {
        console.error('Erreur upload image');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
    }
  };

  const removeImage = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
      onImageRemoved();
    }
  };

  return (
    <div className="space-y-4">
      {/* Image capturée */}
      {capturedImage && (
        <div className="relative">
          <img 
            src={capturedImage.url} 
            alt="Preuve de paiement" 
            className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <Check className="w-3 h-3 mr-1" />
            Image capturée
          </div>
        </div>
      )}

      {/* Contrôles de capture */}
      {!capturedImage && (
        <div className="space-y-3">
          {/* Capture avec caméra */}
          <Button
            type="button"
            onClick={startCamera}
            variant="outline"
            className="w-full py-3 border-2 border-dashed border-blue-300 hover:border-blue-400"
            disabled={isCapturing}
          >
            <Camera className="w-5 h-5 mr-2" />
            {isCapturing ? 'Initialisation caméra...' : 'Capturer avec la caméra'}
          </Button>

          {/* Upload depuis galerie */}
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full py-3 border-2 border-dashed border-green-300 hover:border-green-400"
            disabled={uploading}
          >
            <Upload className="w-5 h-5 mr-2" />
            {uploading ? 'Upload en cours...' : 'Choisir depuis la galerie'}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Interface de capture */}
      {isCapturing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Capture de la preuve de paiement</h3>
              <p className="text-sm text-gray-600">Positionnez votre téléphone pour capturer l'écran de paiement</p>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex gap-3 mt-4">
              <Button
                onClick={stopCamera}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={captureImage}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Capturer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCapture; 