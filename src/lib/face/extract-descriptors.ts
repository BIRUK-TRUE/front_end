/**
 * Extract face descriptors from an image file using face-api.js.
 */

import { loadFaceApiModels } from "./load-models";

export async function extractFaceDescriptorsFromFile(
  file: File,
): Promise<number[][]> {
  const faceapi = await loadFaceApiModels();

  const image = await faceapi.bufferToImage(file);
  const detections = await faceapi
    .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!detections.length) {
    throw new Error("No face detected in the image");
  }

  return detections.map((detection) => Array.from(detection.descriptor));
}

export async function extractFaceDescriptorsFromDataUrl(
  dataUrl: string,
): Promise<number[][]> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
  return extractFaceDescriptorsFromFile(file);
}
