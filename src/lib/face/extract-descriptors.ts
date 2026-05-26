/**
 * Extract face descriptors from an image file using face-api.js.
 */

const MODEL_URL = "/models";
const FALLBACK_MODEL_URL =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";

let modelsLoaded = false;

async function ensureFaceModelsLoaded() {
  if (modelsLoaded) return;

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

  modelsLoaded = true;
  return faceapi;
}

export async function extractFaceDescriptorsFromFile(
  file: File,
): Promise<number[][]> {
  const faceapi = await ensureFaceModelsLoaded();
  if (!faceapi) {
    throw new Error("Failed to load face recognition models");
  }

  const image = await faceapi.bufferToImage(file);
  const detection = await faceapi
    .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error("No face detected in the image");
  }

  return [Array.from(detection.descriptor)];
}

export async function extractFaceDescriptorsFromDataUrl(
  dataUrl: string,
): Promise<number[][]> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
  return extractFaceDescriptorsFromFile(file);
}
