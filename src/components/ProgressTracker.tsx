import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, Calendar, TrendingUp, Scale, Upload, X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ProgressPhoto {
  id: string;
  photo_url: string;
  weight: number;
  notes: string;
  taken_at: string;
}

export function ProgressTracker() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  // Limpiar el stream de la cámara cuando se cierra
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const loadPhotos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      setPhotos(data);
    } catch (error) {
      console.error('Error al cargar fotos:', error);
      setError('Error al cargar las fotos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Ajustar el tamaño del canvas al video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar el frame actual del video en el canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir a blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          await handlePhotoUpload(blob);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handlePhotoUpload = async (file: Blob) => {
    try {
      setUploading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      // Validar el tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      // Crear un nombre único para el archivo
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const filePath = `progress/${fileName}`;

      // Subir foto a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Guardar referencia en la base de datos
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          photo_url: publicUrl,
          taken_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      await loadPhotos();
    } catch (error) {
      console.error('Error al subir foto:', error);
      setError(error instanceof Error ? error.message : 'Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handlePhotoUpload(file);
    }
  };

  const weightData = photos.map(photo => ({
    date: new Date(photo.taken_at).toLocaleDateString(),
    weight: photo.weight
  })).reverse();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          Seguimiento de Progreso
        </h2>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          {error}
        </div>
      )}

      {/* Modal de la cámara */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tomar Foto de Progreso</h3>
              <button
                onClick={stopCamera}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
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
            <div className="mt-4 flex justify-center">
              <button
                onClick={capturePhoto}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Camera className="w-5 h-5 mr-2" />
                )}
                Capturar Foto
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Scale className="w-5 h-5 mr-2" />
            Progreso de Peso
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Fotos de Progreso
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handlePhotoClick}
                disabled={uploading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Foto
              </button>
              <button
                onClick={startCamera}
                disabled={uploading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4 mr-2" />
                Tomar Foto
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.photo_url}
                  alt={`Progreso ${new Date(photo.taken_at).toLocaleDateString()}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                    <p className="text-white text-sm flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(photo.taken_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para ver foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src={selectedPhoto.photo_url}
                alt={`Progreso ${new Date(selectedPhoto.taken_at).toLocaleDateString()}`}
                className="w-full h-auto"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500">
                Fecha: {new Date(selectedPhoto.taken_at).toLocaleDateString()}
              </p>
              {selectedPhoto.weight && (
                <p className="text-sm text-gray-500">
                  Peso: {selectedPhoto.weight} kg
                </p>
              )}
              {selectedPhoto.notes && (
                <p className="mt-2 text-gray-700">{selectedPhoto.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}