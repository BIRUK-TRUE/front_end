# Backend Implementation Guide - Missing Features

> **For:** Backend Development Team  
> **Priority:** Critical Features First  
> **Based on:** Comprehensive System Analysis

---

## Part 1: Database Schema Additions

### 1.1 Activity Log System

```sql
-- Create activity_logs table for real activity feed
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_type VARCHAR(50) NOT NULL,  -- 'user', 'system', 'api'
    action VARCHAR(100) NOT NULL,     -- 'student_created', 'grade_submitted', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'student', 'assessment', 'enrollment', etc.
    entity_id UUID,                   -- ID of the affected entity
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    
    -- Human-readable descriptions
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Metadata for filtering
    activity_category VARCHAR(50),  -- 'enrollment', 'grade', 'attendance', 'user', 'system'
    importance VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    
    -- JSON for additional context
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT idx_activity_logs_created_at BRIN (created_at),
    CONSTRAINT idx_activity_logs_actor_id BRIN (actor_id),
    CONSTRAINT idx_activity_logs_entity BRIN (entity_type, entity_id)
);

-- Indexes for common queries
CREATE INDEX idx_activity_logs_category ON activity_logs(activity_category);
CREATE INDEX idx_activity_logs_section ON activity_logs(section_id) WHERE section_id IS NOT NULL;
CREATE INDEX idx_activity_logs_year ON activity_logs(academic_year_id);
CREATE INDEX idx_activity_logs_recent ON activity_logs(created_at DESC);

-- Partial index for recent activity (last 90 days)
CREATE INDEX idx_activity_logs_recent_category ON activity_logs(activity_category, created_at DESC) 
WHERE created_at > NOW() - INTERVAL '90 days';
```

### 1.2 Interventions System

```sql
-- Create interventions table for at-risk student tracking
CREATE TABLE interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    
    -- Intervention details
    type VARCHAR(50) NOT NULL,  -- 'attendance', 'academic', 'behavioral', 'financial', 'other'
    severity VARCHAR(20) NOT NULL DEFAULT 'medium',  -- 'low', 'medium', 'high', 'critical'
    
    -- Descriptions
    description TEXT NOT NULL,
    action_plan TEXT,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Follow-up
    follow_up_date DATE,
    status VARCHAR(20) DEFAULT 'open',  -- 'open', 'in_progress', 'completed', 'cancelled'
    
    -- Resolution
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Risk factors at time of creation
    attendance_percentage DECIMAL(5,2),
    average_grade DECIMAL(5,2),
    payment_balance DECIMAL(10,2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_interventions_student ON interventions(student_id);
CREATE INDEX idx_interventions_status ON interventions(status);
CREATE INDEX idx_interventions_assigned ON interventions(assigned_to);
CREATE INDEX idx_interventions_follow_up ON interventions(follow_up_date) WHERE follow_up_date IS NOT NULL;
CREATE INDEX idx_interventions_created ON interventions(created_at DESC);

-- Intervention notes/comments
CREATE TABLE intervention_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id UUID REFERENCES interventions(id) ON DELETE CASCADE NOT NULL,
    note TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_intervention_notes_intervention ON intervention_notes(intervention_id);
```

### 1.3 Face Recognition System

```sql
-- Create face_descriptors table for biometric attendance
CREATE TABLE face_descriptors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    
    -- Face embedding (128-dimensional vector for most face recognition models)
    descriptor_vector FLOAT[128] NOT NULL,
    
    -- Photo reference
    photo_url TEXT,
    photo_hash VARCHAR(64),  -- For deduplication
    
    -- Quality metrics
    quality_score DECIMAL(3,2),  -- 0.00 to 1.00
    confidence DECIMAL(3,2),     -- Detection confidence
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    enrollment_attempts INTEGER DEFAULT 0,
    
    -- Timestamps
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_face_descriptors_student ON face_descriptors(student_id);
CREATE INDEX idx_face_descriptors_active ON face_descriptors(is_active) WHERE is_active = TRUE;

-- Face recognition attendance log
CREATE TABLE face_recognition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    
    -- Recognition results
    confidence DECIMAL(5,4),  -- Match confidence
    matched_descriptor_id UUID REFERENCES face_descriptors(id) ON DELETE SET NULL,
    
    -- Photo evidence (optional)
    captured_photo_url TEXT,
    
    -- Status
    recognition_status VARCHAR(50),  -- 'success', 'failed', 'unknown_face', 'low_confidence'
    attendance_marked BOOLEAN DEFAULT FALSE,
    
    -- Error details
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_face_recognition_logs_student ON face_recognition_logs(student_id);
CREATE INDEX idx_face_recognition_logs_section ON face_recognition_logs(section_id);
CREATE INDEX idx_face_recognition_logs_created ON face_recognition_logs(created_at DESC);
CREATE INDEX idx_face_recognition_logs_status ON face_recognition_logs(recognition_status);
```

### 1.4 Alert Rules System

```sql
-- Create alert_rules table for automated notifications
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Rule configuration
    rule_type VARCHAR(50) NOT NULL,  -- 'attendance', 'grade', 'payment', 'behavior', 'system'
    condition VARCHAR(50) NOT NULL,  -- 'less_than', 'greater_than', 'equals', 'between', 'changed'
    threshold DECIMAL(10,2),         -- Primary threshold
    threshold_max DECIMAL(10,2),   -- For 'between' condition
    
    -- Time-based conditions
    time_window_days INTEGER,        -- e.g., 'attendance < 75% over 7 days'
    
    -- Action configuration
    action VARCHAR(100) NOT NULL,    -- 'notify_admin', 'notify_guardian', 'notify_teacher', 'notify_student', 'webhook'
    target_roles TEXT[],             -- Array of roles to notify
    target_users UUID[],             -- Specific user IDs to notify
    
    -- Notification template
    notification_title_template VARCHAR(255),
    notification_body_template TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority VARCHAR(20) DEFAULT 'normal',  -- 'low', 'normal', 'high', 'critical'
    
    -- Rate limiting
    cooldown_minutes INTEGER DEFAULT 60,  -- Don't trigger same rule for same student within X minutes
    max_notifications_per_day INTEGER,   -- Limit daily notifications per target
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alert_rules_active ON alert_rules(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_alert_rules_type ON alert_rules(rule_type);

-- Alert rule execution log
CREATE TABLE alert_rule_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES alert_rules(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    
    -- Execution details
    triggered_value DECIMAL(10,2),
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_ids UUID[],  -- References to sent notifications
    
    -- Timestamps
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_rule_executions_rule ON alert_rule_executions(rule_id);
CREATE INDEX idx_alert_rule_executions_student ON alert_rule_executions(student_id);
CREATE INDEX idx_alert_rule_executions_time ON alert_rule_executions(executed_at DESC);

-- Prevent duplicate executions within cooldown period
CREATE UNIQUE INDEX idx_alert_rule_cooldown 
ON alert_rule_executions(rule_id, student_id, DATE(executed_at))
WHERE student_id IS NOT NULL;
```

### 1.5 Notification Templates

```sql
-- Create notification_templates table for reusable message templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    
    -- Template content
    title_template VARCHAR(255) NOT NULL,
    body_template TEXT NOT NULL,
    
    -- Template variables (stored as array of variable names)
    required_variables TEXT[],
    
    -- Category
    category VARCHAR(50),  -- 'attendance', 'grade', 'payment', 'general', 'system'
    
    -- Channels
    available_channels TEXT[] DEFAULT ARRAY['in_app', 'email'],  -- 'in_app', 'email', 'sms', 'push'
    default_channels TEXT[] DEFAULT ARRAY['in_app'],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_system_template BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO notification_templates (name, description, title_template, body_template, category, required_variables, is_system_template) VALUES
('attendance_alert', 'Alert for attendance issues', 
 'Attendance Alert: {{student_name}}', 
 '{{student_name}} has attendance of {{attendance_percentage}}% in {{class_name}}. {{message}}',
 'attendance', 
 ARRAY['student_name', 'attendance_percentage', 'class_name', 'message'],
 TRUE),

('grade_alert', 'Alert for poor grades',
 'Grade Alert: {{student_name}}',
 '{{student_name}} has an average grade of {{average_grade}} in {{subject_name}}. {{message}}',
 'grade',
 ARRAY['student_name', 'average_grade', 'subject_name', 'message'],
 TRUE),

('payment_reminder', 'Payment due reminder',
 'Payment Reminder: {{student_name}}',
 'A payment of {{amount}} is due for {{student_name}}. {{message}}',
 'payment',
 ARRAY['student_name', 'amount', 'message'],
 TRUE),

('welcome_student', 'Welcome new student',
 'Welcome to {{school_name}}',
 'Dear {{student_name}}, welcome to {{school_name}}. Your registration number is {{registration_number}}.',
 'general',
 ARRAY['school_name', 'student_name', 'registration_number'],
 TRUE);
```

### 1.6 Performance Indexes (Add to Existing Tables)

```sql
-- Attendance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_sessions_date 
ON attendance_sessions(attendance_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_sessions_section_date 
ON attendance_sessions(section_id, attendance_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_records_session 
ON attendance_records(session_id, is_present);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_records_enrollment 
ON attendance_records(enrollment_id);

-- Enrollment indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_status 
ON enrollments(status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_student_year 
ON enrollments(student_id, academic_year_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_section 
ON enrollments(section_id) WHERE status = 'active';

-- Assessment indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_scores_enrollment 
ON assessment_scores(enrollment_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_scores_assessment 
ON assessment_scores(assessment_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_teacher_subject 
ON assessments(teacher_subject_id, created_at DESC);

-- Payment indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_schedules_status 
ON payment_schedules(status) WHERE status = 'pending';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_schedules_student 
ON payment_schedules(student_id, status);

-- Notification indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, read_at) WHERE read_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created 
ON notifications(created_at DESC);
```

---

## Part 2: Service Layer Implementations

### 2.1 Activity Log Service

**File:** `app/analytics/activity_service.py`

```python
"""
Activity Log Service
====================
Track and retrieve system activities for the admin dashboard.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, and_
from sqlalchemy.orm import joinedload

from app.analytics.models import ActivityLog
from app.users.models import User


class ActivityLogService:
    """Service for logging and retrieving system activities."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def log_activity(
        self,
        action: str,
        entity_type: str,
        entity_id: Optional[UUID] = None,
        actor_id: Optional[UUID] = None,
        actor_type: str = "user",
        title: str = "",
        description: str = "",
        category: str = "system",
        importance: str = "normal",
        section_id: Optional[UUID] = None,
        academic_year_id: Optional[UUID] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ActivityLog:
        """Create a new activity log entry."""
        
        activity = ActivityLog(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            actor_id=actor_id,
            actor_type=actor_type,
            title=title,
            description=description,
            activity_category=category,
            importance=importance,
            section_id=section_id,
            academic_year_id=academic_year_id,
            metadata_=metadata or {}
        )
        
        self.db.add(activity)
        await self.db.flush()
        return activity
    
    async def get_recent_activity(
        self,
        limit: int = 20,
        category: Optional[str] = None,
        section_id: Optional[UUID] = None,
        days: int = 7
    ) -> List[ActivityLog]:
        """Get recent activity feed."""
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = select(ActivityLog).where(
            ActivityLog.created_at >= cutoff_date
        ).order_by(desc(ActivityLog.created_at))
        
        if category:
            query = query.where(ActivityLog.activity_category == category)
        
        if section_id:
            query = query.where(ActivityLog.section_id == section_id)
        
        query = query.limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_activity_stats(
        self,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get activity statistics for dashboard."""
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Count by category
        category_counts = await self.db.execute(
            select(
                ActivityLog.activity_category,
                func.count(ActivityLog.id).label('count')
            ).where(
                ActivityLog.created_at >= cutoff_date
            ).group_by(ActivityLog.activity_category)
        )
        
        # Daily activity counts
        daily_counts = await self.db.execute(
            select(
                func.date(ActivityLog.created_at).label('date'),
                func.count(ActivityLog.id).label('count')
            ).where(
                ActivityLog.created_at >= cutoff_date
            ).group_by(
                func.date(ActivityLog.created_at)
            ).order_by('date')
        )
        
        return {
            "by_category": {row.activity_category: row.count for row in category_counts},
            "daily": [{"date": row.date, "count": row.count} for row in daily_counts],
            "total": sum(row.count for row in category_counts)
        }


# Activity logging decorator for easy integration
def log_activity_action(
    action: str,
    entity_type: str,
    category: str = "system",
    get_entity_id=None,
    get_section_id=None,
    get_title=None
):
    """Decorator to automatically log service method calls."""
    def decorator(func):
        async def wrapper(self, *args, **kwargs):
            # Execute the original function
            result = await func(self, *args, **kwargs)
            
            try:
                # Log the activity
                activity_service = ActivityLogService(self.db)
                
                entity_id = get_entity_id(result, args, kwargs) if get_entity_id else None
                section_id = get_section_id(result, args, kwargs) if get_section_id else None
                title = get_title(result, args, kwargs) if get_title else f"{action} {entity_type}"
                
                await activity_service.log_activity(
                    action=action,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    actor_id=kwargs.get('current_user', {}).id if 'current_user' in kwargs else None,
                    title=title,
                    category=category
                )
            except Exception:
                # Don't fail the operation if logging fails
                pass
            
            return result
        return wrapper
    return decorator
```

### 2.2 Face Recognition Service

**File:** `app/face_recognition/service.py`

```python
"""
Face Recognition Service
========================
Handle face enrollment and recognition for biometric attendance.
"""

import base64
import io
from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any
from uuid import UUID, uuid4

import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.face_recognition.models import FaceDescriptor, FaceRecognitionLog
from app.students.models import Student
from app.attendance.service import AttendanceService


class FaceRecognitionService:
    """Service for face recognition operations."""
    
    # Face recognition threshold (adjust based on model)
    CONFIDENCE_THRESHOLD = 0.85
    
    def __init__(self, db: AsyncSession):
        self.db = db
        # Note: In production, load actual face recognition model here
        # self.face_model = load_face_model()
    
    async def enroll_face(
        self,
        student_id: UUID,
        photo_base64: str,
        quality_check: bool = True
    ) -> Dict[str, Any]:
        """Enroll a student's face for recognition."""
        
        # Verify student exists
        student = await self.db.get(Student, student_id)
        if not student:
            raise ValueError("Student not found")
        
        # Decode photo
        try:
            photo_bytes = base64.b64decode(photo_base64)
        except Exception:
            raise ValueError("Invalid photo encoding")
        
        # TODO: Implement actual face detection and embedding extraction
        # For now, generate a mock descriptor (128-dimensional vector)
        # In production, use face-api.js, DeepFace, or similar library
        descriptor = np.random.randn(128).tolist()
        quality_score = 0.92  # Mock quality score
        
        if quality_check and quality_score < 0.70:
            raise ValueError(f"Photo quality too low: {quality_score:.2f}. Please retake.")
        
        # Check if student already has a face enrolled
        existing = await self.db.execute(
            select(FaceDescriptor).where(
                and_(
                    FaceDescriptor.student_id == student_id,
                    FaceDescriptor.is_active == True
                )
            )
        )
        existing_descriptor = existing.scalar_one_or_none()
        
        if existing_descriptor:
            # Update existing descriptor
            existing_descriptor.descriptor_vector = descriptor
            existing_descriptor.quality_score = quality_score
            existing_descriptor.updated_at = datetime.utcnow()
            existing_descriptor.enrollment_attempts += 1
        else:
            # Create new descriptor
            face_descriptor = FaceDescriptor(
                student_id=student_id,
                descriptor_vector=descriptor,
                quality_score=quality_score,
                confidence=1.0,
                photo_url=f"/photos/faces/{student_id}_{uuid4()}.jpg",
                is_active=True
            )
            self.db.add(face_descriptor)
        
        await self.db.flush()
        
        return {
            "student_id": str(student_id),
            "enrollment_status": "enrolled" if existing_descriptor else "updated",
            "quality_score": quality_score,
            "enrolled_at": datetime.utcnow().isoformat(),
            "message": "Face enrolled successfully"
        }
    
    async def get_enrollment_status(
        self,
        student_id: UUID
    ) -> Dict[str, Any]:
        """Check if a student has face enrolled."""
        
        student = await self.db.get(Student, student_id)
        if not student:
            raise ValueError("Student not found")
        
        descriptors = await self.db.execute(
            select(FaceDescriptor).where(
                FaceDescriptor.student_id == student_id
            )
        )
        face_data = descriptors.scalars().all()
        
        active_descriptors = [d for d in face_data if d.is_active]
        
        return {
            "student_id": str(student_id),
            "student_name": student.user.full_name if student.user else "Unknown",
            "is_enrolled": len(active_descriptors) > 0,
            "enrolled_at": active_descriptors[0].enrolled_at.isoformat() if active_descriptors else None,
            "photo_count": len(face_data),
            "quality_score": active_descriptors[0].quality_score if active_descriptors else None
        }
    
    async def recognize_and_mark_attendance(
        self,
        photo_base64: str,
        section_id: UUID,
        confidence_threshold: float = None
    ) -> Dict[str, Any]:
        """Recognize face and mark attendance."""
        
        threshold = confidence_threshold or self.CONFIDENCE_THRESHOLD
        
        # Decode photo
        try:
            photo_bytes = base64.b64decode(photo_base64)
        except Exception:
            return {
                "student_id": None,
                "student_name": None,
                "attendance_marked": False,
                "confidence": 0,
                "message": "Invalid photo encoding",
                "recognition_status": "failed"
            }
        
        # TODO: Extract face embedding from photo
        # For now, use mock recognition
        query_descriptor = np.random.randn(128)
        
        # Get all enrolled faces for the section
        from app.enrollments.models import Enrollment
        
        enrolled_faces = await self.db.execute(
            select(FaceDescriptor, Student).join(
                Student, FaceDescriptor.student_id == Student.id
            ).join(
                Enrollment, Student.id == Enrollment.student_id
            ).where(
                and_(
                    Enrollment.section_id == section_id,
                    Enrollment.status == "active",
                    FaceDescriptor.is_active == True
                )
            )
        )
        
        enrolled_faces = enrolled_faces.all()
        
        if not enrolled_faces:
            # Log unknown face
            log = FaceRecognitionLog(
                section_id=section_id,
                recognition_status="no_enrolled_faces",
                error_message="No faces enrolled for this section"
            )
            self.db.add(log)
            await self.db.flush()
            
            return {
                "student_id": None,
                "student_name": None,
                "attendance_marked": False,
                "confidence": 0,
                "message": "No faces enrolled for this section",
                "recognition_status": "no_enrolled_faces"
            }
        
        # Find best match using cosine similarity
        best_match = None
        best_confidence = 0
        
        for face_descriptor, student in enrolled_faces:
            enrolled_descriptor = np.array(face_descriptor.descriptor_vector)
            similarity = np.dot(query_descriptor, enrolled_descriptor) / (
                np.linalg.norm(query_descriptor) * np.linalg.norm(enrolled_descriptor)
            )
            confidence = (similarity + 1) / 2  # Convert to 0-1 range
            
            if confidence > best_confidence:
                best_confidence = confidence
                best_match = (face_descriptor, student)
        
        # Check if confidence meets threshold
        if best_confidence < threshold:
            # Log unknown face
            log = FaceRecognitionLog(
                section_id=section_id,
                confidence=best_confidence,
                recognition_status="unknown_face",
                error_message=f"Confidence {best_confidence:.2f} below threshold {threshold:.2f}"
            )
            self.db.add(log)
            await self.db.flush()
            
            return {
                "student_id": None,
                "student_name": None,
                "attendance_marked": False,
                "confidence": round(best_confidence, 4),
                "message": f"Face not recognized (confidence: {best_confidence:.2f})",
                "recognition_status": "unknown_face"
            }
        
        # Mark attendance
        face_descriptor, student = best_match
        
        attendance_service = AttendanceService(self.db)
        try:
            # Create or update attendance session
            from datetime import date
            from app.attendance.schemas import AttendanceSessionCreate
            
            session_data = AttendanceSessionCreate(
                section_id=section_id,
                attendance_date=date.today(),
                present_student_ids=[student.id]
            )
            
            session = await attendance_service.create_attendance_session(
                session_data, 
                requested_by=None  # System-generated
            )
            
            attendance_marked = True
            message = f"Attendance marked for {student.user.full_name}"
            
        except Exception as e:
            attendance_marked = False
            message = f"Recognition successful but attendance failed: {str(e)}"
        
        # Log successful recognition
        log = FaceRecognitionLog(
            student_id=student.id,
            section_id=section_id,
            matched_descriptor_id=face_descriptor.id,
            confidence=best_confidence,
            recognition_status="success" if attendance_marked else "failed",
            attendance_marked=attendance_marked
        )
        self.db.add(log)
        await self.db.flush()
        
        return {
            "student_id": str(student.id),
            "student_name": student.user.full_name if student.user else "Unknown",
            "attendance_marked": attendance_marked,
            "confidence": round(best_confidence, 4),
            "message": message,
            "recognition_status": "success" if attendance_marked else "failed"
        }
    
    async def get_face_descriptors(
        self,
        section_id: Optional[UUID] = None
    ) -> List[Dict[str, Any]]:
        """Get all face descriptors, optionally filtered by section."""
        
        query = select(FaceDescriptor, Student).join(
            Student, FaceDescriptor.student_id == Student.id
        ).where(FaceDescriptor.is_active == True)
        
        if section_id:
            from app.enrollments.models import Enrollment
            query = query.join(
                Enrollment, Student.id == Enrollment.student_id
            ).where(
                and_(
                    Enrollment.section_id == section_id,
                    Enrollment.status == "active"
                )
            )
        
        result = await self.db.execute(query)
        descriptors = result.all()
        
        return [
            {
                "student_id": str(face.student_id),
                "student_name": student.user.full_name if student.user else "Unknown",
                "registration_number": student.registration_number,
                "descriptor": face.descriptor_vector,  # In production, don't return raw descriptors
                "quality_score": face.quality_score,
                "enrolled_at": face.enrolled_at.isoformat()
            }
            for face, student in descriptors
        ]
```

### 2.3 Alert Rules Service

**File:** `app/notifications/alert_rules_service.py`

```python
"""
Alert Rules Service
===================
Manage and evaluate alert rules for automated notifications.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc

from app.notifications.models import AlertRule, AlertRuleExecution
from app.students.models import Student
from app.users.models import User


class AlertRulesService:
    """Service for managing and evaluating alert rules."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_rule(
        self,
        name: str,
        rule_type: str,
        condition: str,
        threshold: float,
        action: str,
        description: str = "",
        threshold_max: Optional[float] = None,
        time_window_days: Optional[int] = None,
        target_roles: Optional[List[str]] = None,
        target_users: Optional[List[UUID]] = None,
        notification_title_template: str = "",
        notification_body_template: str = "",
        priority: str = "normal",
        cooldown_minutes: int = 60,
        max_notifications_per_day: Optional[int] = None,
        created_by: Optional[User] = None
    ) -> AlertRule:
        """Create a new alert rule."""
        
        rule = AlertRule(
            name=name,
            description=description,
            rule_type=rule_type,
            condition=condition,
            threshold=threshold,
            threshold_max=threshold_max,
            time_window_days=time_window_days,
            action=action,
            target_roles=target_roles or [],
            target_users=target_users or [],
            notification_title_template=notification_title_template,
            notification_body_template=notification_body_template,
            priority=priority,
            cooldown_minutes=cooldown_minutes,
            max_notifications_per_day=max_notifications_per_day,
            created_by=created_by.id if created_by else None,
            is_active=True
        )
        
        self.db.add(rule)
        await self.db.flush()
        return rule
    
    async def list_rules(
        self,
        is_active: Optional[bool] = None,
        rule_type: Optional[str] = None
    ) -> List[AlertRule]:
        """List alert rules with optional filtering."""
        
        query = select(AlertRule)
        
        if is_active is not None:
            query = query.where(AlertRule.is_active == is_active)
        
        if rule_type:
            query = query.where(AlertRule.rule_type == rule_type)
        
        query = query.order_by(desc(AlertRule.created_at))
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update_rule(
        self,
        rule_id: UUID,
        **updates
    ) -> AlertRule:
        """Update an alert rule."""
        
        rule = await self.db.get(AlertRule, rule_id)
        if not rule:
            raise ValueError("Alert rule not found")
        
        for key, value in updates.items():
            if hasattr(rule, key):
                setattr(rule, key, value)
        
        rule.updated_at = datetime.utcnow()
        await self.db.flush()
        return rule
    
    async def delete_rule(self, rule_id: UUID) -> None:
        """Delete an alert rule."""
        
        rule = await self.db.get(AlertRule, rule_id)
        if not rule:
            raise ValueError("Alert rule not found")
        
        await self.db.delete(rule)
        await self.db.flush()
    
    async def evaluate_rules_for_student(
        self,
        student_id: UUID,
        rule_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Evaluate all applicable rules for a student."""
        
        student = await self.db.get(Student, student_id)
        if not student:
            raise ValueError("Student not found")
        
        # Get active rules
        query = select(AlertRule).where(AlertRule.is_active == True)
        if rule_type:
            query = query.where(AlertRule.rule_type == rule_type)
        
        result = await self.db.execute(query)
        rules = result.scalars().all()
        
        triggered_rules = []
        
        for rule in rules:
            triggered = await self._evaluate_rule_for_student(rule, student)
            if triggered:
                triggered_rules.append(triggered)
        
        return triggered_rules
    
    async def _evaluate_rule_for_student(
        self,
        rule: AlertRule,
        student: Student
    ) -> Optional[Dict[str, Any]]:
        """Evaluate a single rule for a student."""
        
        # Check cooldown period
        recent_execution = await self.db.execute(
            select(AlertRuleExecution).where(
                and_(
                    AlertRuleExecution.rule_id == rule.id,
                    AlertRuleExecution.student_id == student.id,
                    AlertRuleExecution.executed_at >= datetime.utcnow() - timedelta(minutes=rule.cooldown_minutes)
                )
            )
        )
        
        if recent_execution.scalar_one_or_none():
            return None  # Cooldown period not elapsed
        
        # Get current value based on rule type
        current_value = await self._get_value_for_rule_type(rule, student)
        
        if current_value is None:
            return None
        
        # Evaluate condition
        triggered = self._evaluate_condition(
            rule.condition,
            current_value,
            rule.threshold,
            rule.threshold_max
        )
        
        if not triggered:
            return None
        
        # Log execution
        execution = AlertRuleExecution(
            rule_id=rule.id,
            student_id=student.id,
            triggered_value=current_value,
            notification_sent=False
        )
        self.db.add(execution)
        await self.db.flush()
        
        return {
            "rule_id": str(rule.id),
            "rule_name": rule.name,
            "student_id": str(student.id),
            "student_name": student.user.full_name if student.user else "Unknown",
            "triggered_value": current_value,
            "threshold": rule.threshold,
            "action": rule.action,
            "execution_id": str(execution.id)
        }
    
    async def _get_value_for_rule_type(
        self,
        rule: AlertRule,
        student: Student
    ) -> Optional[float]:
        """Get the current value to evaluate against the rule threshold."""
        
        from datetime import date
        from app.attendance.models import AttendanceRecord, AttendanceSession
        from app.assessments.models import AssessmentScore
        from app.payments.models import PaymentSchedule
        
        time_window = rule.time_window_days or 30
        cutoff_date = date.today() - timedelta(days=time_window)
        
        if rule.rule_type == "attendance":
            # Calculate attendance percentage over time window
            result = await self.db.execute(
                select(
                    func.count(AttendanceRecord.id).filter(AttendanceRecord.is_present == True),
                    func.count(AttendanceRecord.id)
                ).join(AttendanceSession).join(
                    lambda: AttendanceSession.__table__.join(
                        # Get enrollments for this student
                        # This is simplified - actual implementation would need proper joins
                    )
                ).where(
                    AttendanceSession.attendance_date >= cutoff_date
                )
            )
            present, total = result.first() or (0, 0)
            return (present / total * 100) if total > 0 else None
        
        elif rule.rule_type == "grade":
            # Calculate average grade
            result = await self.db.execute(
                select(func.avg(AssessmentScore.score))
                .join(lambda: AssessmentScore.enrollment)
                .where(
                    and_(
                        # Student enrollment filter would go here
                        AssessmentScore.created_at >= cutoff_date
                    )
                )
            )
            return result.scalar()
        
        elif rule.rule_type == "payment":
            # Calculate outstanding balance
            result = await self.db.execute(
                select(func.sum(PaymentSchedule.amount - PaymentSchedule.paid_amount))
                .where(
                    and_(
                        PaymentSchedule.student_id == student.id,
                        PaymentSchedule.status == "pending"
                    )
                )
            )
            return result.scalar() or 0
        
        return None
    
    def _evaluate_condition(
        self,
        condition: str,
        value: float,
        threshold: float,
        threshold_max: Optional[float] = None
    ) -> bool:
        """Evaluate if value meets the rule condition."""
        
        if condition == "less_than":
            return value < threshold
        elif condition == "greater_than":
            return value > threshold
        elif condition == "equals":
            return abs(value - threshold) < 0.001  # Float comparison
        elif condition == "between" and threshold_max is not None:
            return threshold <= value <= threshold_max
        elif condition == "changed":
            # Would need historical data to evaluate
            return True
        
        return False
```

---

## Part 3: New Router Implementations

### 3.1 Student Portal Router

**File:** `app/portals/student_router.py`

```python
"""
Student Portal Router
=====================
Endpoints for student self-service portal.
"""

from datetime import date, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc

from app.core.database import get_db
from app.auth.dependencies import require_roles, get_current_user
from app.users.models import User

router = APIRouter(prefix="/students", tags=["Student Portal"])


@router.get("/{student_id}/dashboard")
async def get_student_dashboard(
    student_id: UUID,
    current_user: User = Depends(require_roles(["student"])),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard summary for a student."""
    
    # Verify student is accessing their own data
    if str(current_user.student_id) != str(student_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only access own dashboard"
        )
    
    from app.students.models import Student
    from app.enrollments.models import Enrollment
    from app.schedule.models import Schedule
    from app.academics.models import AcademicYear, Term
    from datetime import datetime
    
    student = await db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get current enrollment
    current_year = await db.execute(
        select(AcademicYear).where(AcademicYear.is_current == True)
    )
    current_year = current_year.scalar_one_or_none()
    
    enrollment = None
    current_term = None
    if current_year:
        enrollment = await db.execute(
            select(Enrollment).where(
                and_(
                    Enrollment.student_id == student_id,
                    Enrollment.academic_year_id == current_year.id,
                    Enrollment.status == "active"
                )
            )
        )
        enrollment = enrollment.scalar_one_or_none()
        
        # Get current term
        if current_year:
            current_term = await db.execute(
                select(Term).where(
                    and_(
                        Term.academic_year_id == current_year.id,
                        Term.start_date <= date.today(),
                        Term.end_date >= date.today()
                    )
                )
            )
            current_term = current_term.scalar_one_or_none()
    
    # Get upcoming classes (if enrolled)
    upcoming_classes = []
    if enrollment and current_term:
        today = datetime.now().weekday()
        current_time = datetime.now().time()
        
        schedules = await db.execute(
            select(Schedule).where(
                and_(
                    Schedule.section_id == enrollment.section_id,
                    Schedule.day_of_week == today,
                    Schedule.start_time >= current_time
                )
            ).order_by(Schedule.start_time).limit(3)
        )
        
        for sched in schedules.scalars():
            upcoming_classes.append({
                "subject_name": sched.subject.name if sched.subject else "Unknown",
                "teacher_name": sched.teacher.user.full_name if sched.teacher and sched.teacher.user else "Unknown",
                "start_time": sched.start_time.strftime("%H:%M"),
                "end_time": sched.end_time.strftime("%H:%M"),
                "room_number": sched.room_number
            })
    
    # Get attendance summary (placeholder - implement actual query)
    attendance_summary = {
        "percentage": 0,
        "present_days": 0,
        "total_days": 0
    }
    
    # Get recent grades (placeholder)
    recent_grades = []
    
    # Get unread notification count
    from app.notifications.models import Notification
    unread_count = await db.execute(
        select(func.count(Notification.id)).where(
            and_(
                Notification.user_id == current_user.id,
                Notification.read_at.is_(None)
            )
        )
    )
    unread_count = unread_count.scalar() or 0
    
    return {
        "student": {
            "id": str(student.id),
            "name": student.user.full_name if student.user else "Unknown",
            "registration_number": student.registration_number
        },
        "current_enrollment": {
            "class_name": enrollment.section.class_.name if enrollment else None,
            "section_name": enrollment.section.name if enrollment else None,
            "academic_year": current_year.name if current_year else None,
            "term_name": current_term.name if current_term else None
        } if enrollment else None,
        "upcoming_classes": upcoming_classes,
        "attendance_summary": attendance_summary,
        "recent_grades": recent_grades,
        "unread_notifications": unread_count,
        "pending_payments": 0  # TODO: Implement
    }


@router.get("/{student_id}/schedule")
async def get_student_schedule(
    student_id: UUID,
    week_offset: int = Query(default=0, ge=-4, le=4),
    current_user: User = Depends(require_roles(["student"])),
    db: AsyncSession = Depends(get_db),
):
    """Get student's weekly schedule."""
    
    if str(current_user.student_id) != str(student_id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    from app.students.models import Student
    from app.enrollments.models import Enrollment
    from app.schedule.models import Schedule
    from app.academics.models import AcademicYear
    
    student = await db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get current enrollment
    current_year = await db.execute(
        select(AcademicYear).where(AcademicYear.is_current == True)
    )
    current_year = current_year.scalar_one_or_none()
    
    if not current_year:
        return {"schedule": [], "message": "No active academic year"}
    
    enrollment = await db.execute(
        select(Enrollment).where(
            and_(
                Enrollment.student_id == student_id,
                Enrollment.academic_year_id == current_year.id,
                Enrollment.status == "active"
            )
        )
    )
    enrollment = enrollment.scalar_one_or_none()
    
    if not enrollment:
        return {"schedule": [], "message": "Not enrolled in current year"}
    
    # Get schedule for the section
    schedules = await db.execute(
        select(Schedule).where(
            Schedule.section_id == enrollment.section_id
        ).order_by(Schedule.day_of_week, Schedule.start_time)
    )
    
    schedule_list = []
    for sched in schedules.scalars():
        schedule_list.append({
            "id": str(sched.id),
            "day_of_week": sched.day_of_week,
            "start_time": sched.start_time.strftime("%H:%M"),
            "end_time": sched.end_time.strftime("%H:%M"),
            "subject_name": sched.subject.name if sched.subject else "Unknown",
            "teacher_name": sched.teacher.user.full_name if sched.teacher and sched.teacher.user else "Unknown",
            "room_number": sched.room_number
        })
    
    return {
        "schedule": schedule_list,
        "week_offset": week_offset,
        "section_name": enrollment.section.name,
        "class_name": enrollment.section.class_.name
    }


@router.get("/{student_id}/grades/summary")
async def get_student_grades_summary(
    student_id: UUID,
    term_id: Optional[UUID] = Query(default=None),
    current_user: User = Depends(require_roles(["student"])),
    db: AsyncSession = Depends(get_db),
):
    """Get student's grade summary for a term."""
    
    if str(current_user.student_id) != str(student_id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # TODO: Implement actual grade aggregation
    return {
        "term_name": "Current Term",
        "subjects": [],
        "gpa": 0,
        "overall_average": 0
    }


@router.get("/{student_id}/attendance/calendar")
async def get_student_attendance_calendar(
    student_id: UUID,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020, le=2030),
    current_user: User = Depends(require_roles(["student"])),
    db: AsyncSession = Depends(get_db),
):
    """Get attendance calendar for a month."""
    
    if str(current_user.student_id) != str(student_id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # TODO: Implement attendance calendar query
    return {
        "month": month,
        "year": year,
        "days": []
    }


@router.get("/{student_id}/attendance/records")
async def get_student_attendance_records(
    student_id: UUID,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    month: Optional[int] = Query(default=None, ge=1, le=12),
    year: Optional[int] = Query(default=None, ge=2020, le=2030),
    status: Optional[str] = Query(default=None),
    current_user: User = Depends(require_roles(["student"])),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed attendance records."""
    
    if str(current_user.student_id) != str(student_id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # TODO: Implement attendance records query
    return {
        "items": [],
        "total": 0,
        "page": page,
        "size": size,
        "pages": 0
    }
```

---

## Part 4: Integration Points

### 4.1 Activity Logging Integration

**Add to existing services:**

```python
# app/students/service.py

from app.analytics.activity_service import ActivityLogService

class StudentService:
    async def register_student(self, data: StudentCreate, created_by: User = None):
        # ... existing code ...
        
        # Log activity
        activity_service = ActivityLogService(self.db)
        await activity_service.log_activity(
            action="student_created",
            entity_type="student",
            entity_id=student.id,
            actor_id=created_by.id if created_by else None,
            title="New Student Registered",
            description=f"Student {student.user.full_name} was registered with ID {student.registration_number}",
            category="enrollment",
            importance="normal"
        )
        
        return student
```

### 4.2 Alert Rule Evaluation Integration

**Add to background tasks or scheduled jobs:**

```python
# app/notifications/alert_rules_service.py

async def evaluate_all_rules_daily(db: AsyncSession):
    """Evaluate alert rules for all students - run as scheduled task."""
    
    service = AlertRulesService(db)
    
    # Get all active students
    from app.students.models import Student
    from app.enrollments.models import Enrollment
    
    students = await db.execute(
        select(Student).join(Enrollment).where(
            Enrollment.status == "active"
        )
    )
    
    for student in students.scalars():
        triggered = await service.evaluate_rules_for_student(student.id)
        
        for rule_trigger in triggered:
            # Send notifications
            await service.send_alert_notification(rule_trigger)
    
    await db.commit()
```

---

## Part 5: Testing Guide

### 5.1 Unit Tests for New Services

```python
# tests/test_face_recognition.py

import pytest
from app.face_recognition.service import FaceRecognitionService

async def test_enroll_face(db_session):
    service = FaceRecognitionService(db_session)
    
    # Mock photo base64
    photo_base64 = base64.b64encode(b"fake_photo_data").decode()
    
    result = await service.enroll_face(
        student_id=student.id,
        photo_base64=photo_base64
    )
    
    assert result["enrollment_status"] == "enrolled"
    assert "quality_score" in result
    assert result["quality_score"] > 0.70

async def test_recognize_face(db_session):
    service = FaceRecognitionService(db_session)
    
    # First enroll a face
    await service.enroll_face(student.id, photo_base64)
    
    # Then try to recognize
    result = await service.recognize_and_mark_attendance(
        photo_base64=photo_base64,
        section_id=section.id
    )
    
    assert result["attendance_marked"] is True
    assert result["student_id"] == str(student.id)
```

---

## Part 6: Migration Commands

```bash
# Run all migrations
alembic revision --autogenerate -m "Add activity logs, interventions, face recognition, alert rules"
alembic upgrade head

# Create superuser for testing
python scripts/create_admin.py

# Seed test data
python scripts/seed_demo_data.py
```

---

**End of Implementation Guide**

For questions or clarifications, refer to the comprehensive system analysis document or contact the development team lead.
