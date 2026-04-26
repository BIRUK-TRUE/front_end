import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

// Load face-api models (prefer local if exists, else CDN)
const MODEL_URL = '/models';
const FALLBACK_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

export function useFaceModels() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceApi, setFaceApi] = useState<any>(null);
  const t = useTranslations('faceAttendance.enrollment');

  const loadModels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const faceapi = await import('face-api.js');
      setFaceApi(faceapi);
      
      const loadFrom = async (url: string) => {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(url),
          faceapi.nets.faceLandmark68Net.loadFromUri(url),
          faceapi.nets.faceRecognitionNet.loadFromUri(url),
        ]);
      };

      try {
        await loadFrom(MODEL_URL);
      } catch (e) {
        console.warn('Local models not found, falling back to CDN');
        await loadFrom(FALLBACK_MODEL_URL);
      }
      
      setIsLoaded(true);
    } catch (err) {
      const errorMessage = 'Failed to load face recognition models';
      setError(errorMessage);
      toast.error(t('loadModelsFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  return { isLoaded, isLoading, error, faceApi, reloadModels: loadModels };
}
