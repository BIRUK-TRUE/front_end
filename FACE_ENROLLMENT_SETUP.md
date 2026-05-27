# Face Enrollment Feature - Setup & Usage Guide

## Overview
The face enrollment feature allows students to register their facial biometrics for attendance tracking using face recognition technology.

## Features Implemented

### 1. **Multi-Capture Face Enrollment**
- Captures 3 face samples from different angles for better accuracy
- Real-time face detection using face-api.js
- Progress tracking during enrollment
- Visual guides and instructions

### 2. **Face Detection & Descriptor Extraction**
- Uses TinyFaceDetector for fast face detection
- Extracts 128-dimensional face descriptors
- Validates face presence before capture
- Handles errors gracefully

### 3. **User Experience**
- Step-by-step instructions for each capture
- Visual feedback during processing
- Progress bar showing capture completion
- Camera preview with face alignment guides
- Success/error notifications

## Setup Instructions

### Step 1: Download Face-API.js Models

The face recognition models need to be downloaded and placed in the `public/models` directory.

**Option A: Manual Download**
1. Download models from: https://github.com/vladmandic/face-api/tree/master/model
2. Create `public/models` directory
3. Download these files:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`

**Option B: Use the Download Script**
```bash
cd front_end
node scripts/download-face-models.js
```

### Step 2: Verify Backend API Endpoints

Ensure your backend has these endpoints:

#### 1. Enroll Face
```
POST /face-recognition/enroll
Body: {
  studentId: string,
  descriptors: number[][]  // Array of 128-dimensional vectors
}
Response: {
  student_id: string,
  enrollment_status: string,
  message: string,
  enrolled_at: string
}
```

#### 2. Get Enrollment Status
```
GET /face-recognition/enrollment-status/{studentId}
Response: {
  student_id: string,
  student_name: string,
  is_enrolled: boolean,
  enrolled_at?: string,
  photo_count: number
}
```

#### 3. Delete Enrollment
```
DELETE /face-recognition/enroll/{studentId}
Response: {
  message: string
}
```

#### 4. Recognize Faces (for attendance)
```
POST /face-recognition/recognize
Body: {
  sectionId: string,
  descriptors: number[][],
  threshold?: number  // Default: 0.6
}
Response: {
  matches: Array<{
    studentId: string,
    studentName: string,
    confidence: number,
    distance: number,
    enrollmentId: string
  }>,
  recognizedCount: number,
  message: string,
  sectionId: string
}
```

### Step 3: Test the Feature

1. Navigate to a student's profile page
2. Click on "Face Enrollment" or similar button
3. Allow camera access when prompted
4. Follow the on-screen instructions:
   - Step 1: Look straight at the camera
   - Step 2: Turn head slightly left
   - Step 3: Turn head slightly right
5. Click "Save Enrollment" after all captures are complete

## Technical Details

### Face Descriptor Format
- Each face is represented by a 128-dimensional vector
- Multiple descriptors (3) are captured for robustness
- Descriptors are sent to backend as `number[][]`

### Face Detection Options
```typescript
new TinyFaceDetectorOptions({
  inputSize: 416,
  scoreThreshold: 0.5
})
```

### Model Loading
- Primary: Loads from `/public/models` (local)
- Fallback: Loads from CDN if local models not found
- Models are loaded once and cached

### Browser Compatibility
- Requires WebRTC support (camera access)
- Works on modern browsers: Chrome, Firefox, Safari, Edge
- Mobile browsers supported

## Troubleshooting

### Issue: "Failed to load face recognition models"
**Solution:** 
- Ensure models are in `public/models` directory
- Check browser console for specific errors
- Verify internet connection (for CDN fallback)

### Issue: "No face detected"
**Solution:**
- Ensure good lighting
- Face should be clearly visible
- Remove glasses or face coverings if possible
- Position face within the guide circle

### Issue: Camera not working
**Solution:**
- Grant camera permissions in browser
- Check if camera is being used by another application
- Try a different browser
- Check browser console for errors

### Issue: Enrollment fails on backend
**Solution:**
- Check backend logs for errors
- Verify API endpoint is correct
- Ensure backend can handle face descriptor format
- Check database connection

## File Structure

```
front_end/
├── src/
│   ├── app/[locale]/(dashboard)/dashboard/
│   │   ├── students/[id]/face-enrollment/
│   │   │   └── page.tsx                    # Main enrollment page
│   │   └── attendance/face-enrollment/
│   │       └── page.tsx                    # Bulk enrollment page
│   ├── features/attendance/
│   │   ├── components/
│   │   │   └── FaceEnrollmentFlow.tsx      # Enrollment flow component
│   │   └── hooks/
│   │       └── useFaceEnrollment.ts        # Enrollment hooks
│   ├── hooks/
│   │   └── use-face-recognition.ts         # Face recognition hooks
│   ├── lib/
│   │   ├── api/
│   │   │   └── face-recognition.service.ts # API service
│   │   └── face/
│   │       └── extract-descriptors.ts      # Face descriptor extraction
│   └── components/ui/
│       └── progress.tsx                    # Progress bar component
└── public/
    └── models/                             # Face-API.js models (to be added)
```

## Security Considerations

1. **Privacy**: Face descriptors are mathematical representations, not actual photos
2. **Encryption**: Ensure HTTPS for all API calls
3. **Storage**: Backend should securely store face descriptors
4. **Access Control**: Only authorized users should access enrollment features
5. **Consent**: Ensure students consent to face recognition usage

## Performance Tips

1. **Model Loading**: Models are ~6MB total, loaded once per session
2. **Face Detection**: TinyFaceDetector is optimized for speed
3. **Multiple Captures**: 3 captures provide good balance of accuracy and speed
4. **Camera Resolution**: 1280x720 provides good quality without excessive processing

## Next Steps

1. Download and setup face-api.js models
2. Verify backend API endpoints
3. Test enrollment with different lighting conditions
4. Implement face recognition for attendance marking
5. Add re-enrollment capability for enrolled students
6. Add bulk enrollment management features

## Support

For issues or questions:
1. Check browser console for errors
2. Review backend logs
3. Verify API responses match expected format
4. Test with different students and lighting conditions
