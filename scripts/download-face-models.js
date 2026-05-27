/**
 * Script to download face-api.js models
 * Run: node scripts/download-face-models.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MODELS_DIR = path.join(PUBLIC_DIR, 'models');

// Models to download
const MODELS = [
  // Tiny Face Detector
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  
  // Face Landmark 68
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  
  // Face Recognition
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
];

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  console.log('✅ Created models directory');
}

// Download a single file
function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const url = `${MODEL_BASE_URL}/${filename}`;
    const filePath = path.join(MODELS_DIR, filename);
    
    console.log(`📥 Downloading ${filename}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// Download all models
async function downloadAllModels() {
  console.log('🚀 Starting face-api.js models download...\n');
  
  try {
    for (const model of MODELS) {
      await downloadFile(model);
    }
    
    console.log('\n✅ All models downloaded successfully!');
    console.log(`📁 Models location: ${MODELS_DIR}`);
    console.log('\n🎉 Face enrollment feature is ready to use!');
  } catch (error) {
    console.error('\n❌ Error downloading models:', error.message);
    console.error('\n💡 You can manually download models from:');
    console.error('   https://github.com/vladmandic/face-api/tree/master/model');
    console.error(`   and place them in: ${MODELS_DIR}`);
    process.exit(1);
  }
}

// Run the download
downloadAllModels();
