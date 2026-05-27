const MODEL_URL = "/models";
const FALLBACK_MODEL_URL =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";

let loadPromise: Promise<typeof import("face-api.js")> | null = null;

/** Load face-api.js models once (local /models with CDN fallback). */
export async function loadFaceApiModels() {
  if (!loadPromise) {
    loadPromise = (async () => {
      const faceapi = await import("face-api.js");

      const loadFrom = async (url: string) => {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(url),
          faceapi.nets.faceLandmark68Net.loadFromUri(url),
          faceapi.nets.faceRecognitionNet.loadFromUri(url),
        ]);
      };

      try {
        await loadFrom(MODEL_URL);
      } catch {
        await loadFrom(FALLBACK_MODEL_URL);
      }

      return faceapi;
    })();
  }

  return loadPromise;
}

/** Convert academic confidence setting (0–100) to face-api distance threshold. */
export function confidenceToDistanceThreshold(confidencePercent?: number) {
  const percent = confidencePercent ?? 60;
  return 1 - percent / 100;
}
