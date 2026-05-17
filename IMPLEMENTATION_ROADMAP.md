# Implementation Roadmap - School Management System

> **Generated:** May 3, 2026  
> **Duration:** 8-10 weeks for all critical features  
> **Team Size:** 2-3 backend developers

---

## Phase 1: Foundation (Weeks 1-2)
**Goal:** Enable core functionality with database and basic CRUD

### Week 1: Database Schema & Migrations

#### Day 1-2: Create Migration Scripts
```bash
# File: alembic/versions/20240503_add_core_tables.py
```

**Priority 1 Tables:**
1. `activity_logs` - Activity tracking system
2. `interventions` - At-risk student interventions
3. `intervention_notes` - Intervention comments
4. `face_descriptors` - Face recognition data
5. `face_recognition_logs` - Recognition audit trail
6. `alert_rules` - Automated alert configuration
7. `alert_rule_executions` - Rule execution tracking

#### Day 3-4: Performance Indexes
```sql
-- Add to migration
CREATE INDEX CONCURRENTLY idx_attendance_sessions_date ON attendance_sessions(attendance_date DESC);
CREATE INDEX CONCURRENTLY idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX CONCURRENTLY idx_enrollments_status ON enrollments(status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_assessment_scores_enrollment ON assessment_scores(enrollment_id);
CREATE INDEX CONCURRENTLY idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
```

#### Day 5: Testing & Validation
- [ ] Run migrations on staging database
- [ ] Verify all tables created with correct columns
- [ ] Test index creation
- [ ] Rollback and re-run test

**Deliverable:** Working database schema on staging

---

### Week 2: Core Service Layer

#### Day 1: Activity Log Service
**File:** `app/analytics/activity_service.py`

**Tasks:**
- [ ] Create `ActivityLogService` class
- [ ] Implement `log_activity()` method
- [ ] Implement `get_recent_activity()` method
- [ ] Create activity logging decorator
- [ ] Add tests

**Integration Points:**
- Call from StudentService on student creation
- Call from EnrollmentService on enrollment/withdrawal
- Call from AssessmentService on grade submission
- Call from AttendanceService on attendance marking

#### Day 2: Intervention Service
**File:** `app/analytics/intervention_service.py`

**Tasks:**
- [ ] Create `InterventionService` class
- [ ] Implement CRUD operations
- [ ] Add intervention notes functionality
- [ ] Create method to get interventions by student
- [ ] Add status workflow (open → in_progress → completed)

#### Day 3-4: Student Portal Service
**File:** `app/portals/student_service.py`

**Tasks:**
- [ ] `get_student_dashboard()` - Aggregate all dashboard data
- [ ] `get_student_schedule()` - Weekly timetable
- [ ] `get_student_grades_summary()` - GPA and subject averages
- [ ] `get_student_attendance_calendar()` - Monthly view
- [ ] `get_student_attendance_records()` - Detailed records

**Complexity:** Medium-High (requires joining multiple tables)

#### Day 5: Integration & Testing
- [ ] Write unit tests for all services
- [ ] Run test suite: `pytest tests/test_services/ -v`
- [ ] Code review
- [ ] Fix any issues

**Deliverable:** All Phase 1 services implemented and tested

---

## Phase 2: Face Recognition (Weeks 3-4)
**Goal:** Working biometric attendance system

### Week 3: Face Recognition Backend

#### Day 1-2: Face Recognition Service
**File:** `app/face_recognition/service.py`

**Tasks:**
- [ ] Research and select face recognition library
  - Option A: face-api.js (JavaScript, would need Node service)
  - Option B: DeepFace (Python, easier integration)
  - Option C: dlib + face_recognition library
- [ ] Implement `enroll_face()` method
  - Decode base64 image
  - Detect face in image
  - Extract 128-d embedding
  - Validate photo quality
  - Store in database
- [ ] Implement `recognize_face()` method
  - Extract embedding from captured photo
  - Compare with enrolled descriptors (cosine similarity)
  - Return match with confidence score

**Library Installation:**
```bash
pip install deepface opencv-python-headless
# OR
pip install face-recognition dlib
```

#### Day 3: Face Recognition Router
**File:** `app/face_recognition/router.py`

**Endpoints to implement:**
- [ ] `POST /face-recognition/enroll` - Enroll face
- [ ] `GET /face-recognition/descriptors` - Get enrolled faces
- [ ] `DELETE /face-recognition/enroll/{student_id}` - Delete enrollment
- [ ] `GET /face-recognition/enrollment-status/{student_id}` - Check status

#### Day 4: Attendance Integration
**File:** `app/face_recognition/service.py` (extend)

**Tasks:**
- [ ] `recognize_and_mark_attendance()` method
- [ ] Integrate with AttendanceService
- [ ] Handle duplicate attendance prevention
- [ ] Log recognition attempts (success/failure)

#### Day 5: Testing & Optimization
**File:** `tests/test_face_recognition.py`

- [ ] Unit test: Face enrollment
- [ ] Unit test: Face recognition with known face
- [ ] Unit test: Face recognition with unknown face
- [ ] Integration test: Full attendance marking flow
- [ ] Performance test: Recognition time < 2 seconds

**Deliverable:** Working face recognition API

---

### Week 4: Face Recognition Frontend Integration

#### Day 1-2: Camera & Capture
**Frontend tasks:**
- [ ] Verify browser camera access works
- [ ] Test face detection overlay
- [ ] Implement photo capture
- [ ] Add quality indicators (lighting, face position)

#### Day 3-4: End-to-End Testing
- [ ] Enroll test student face
- [ ] Test recognition and attendance marking
- [ ] Verify attendance recorded in database
- [ ] Test with poor lighting/angles
- [ ] Document accuracy/confidence thresholds

#### Day 5: Documentation & Deployment Prep
- [ ] Update API documentation
- [ ] Create user guide for face enrollment
- [ ] Add troubleshooting section
- [ ] Prepare deployment checklist

**Deliverable:** Production-ready face recognition feature

---

## Phase 3: Portal Endpoints (Weeks 5-6)
**Goal:** Student, Teacher, Guardian portals fully functional

### Week 5: Portal Routers

#### Day 1: Student Portal Router
**File:** `app/portals/student_router.py`

**Endpoints:**
- [ ] `GET /students/{id}/dashboard` 
- [ ] `GET /students/{id}/schedule`
- [ ] `GET /students/{id}/grades/summary`
- [ ] `GET /students/{id}/attendance/calendar`
- [ ] `GET /students/{id}/attendance/records`

**Security:** Ensure students can only access their own data

#### Day 2: Teacher Portal Router
**File:** `app/portals/teacher_router.py`

**Endpoints:**
- [ ] `GET /teachers/{id}/dashboard-stats`
- [ ] `GET /teachers/{id}/classes`
- [ ] `GET /teachers/{id}/assessments`
- [ ] `GET /teachers/{id}/schedule`
- [ ] `GET /teachers/{id}/attendance-records`

#### Day 3: Guardian Portal Router
**File:** `app/portals/guardian_router.py`

**Endpoints:**
- [ ] `GET /guardians/{id}/dashboard`
- [ ] `GET /students/{studentId}/guardian-view`
- [ ] `GET /students/{studentId}/payments`

#### Day 4: Report Card Generation
**File:** `app/assessments/report_card_service.py`

**Tasks:**
- [ ] Calculate term GPA
- [ ] Aggregate all subject grades
- [ ] Include attendance statistics
- [ ] Calculate class rank (optional)
- [ ] Generate promotion status
- [ ] `GET /assessments/grades/report-card/{student_id}` endpoint

**Complexity:** High - requires complex aggregations

#### Day 5: Integration Testing
- [ ] Test each portal endpoint
- [ ] Verify authorization (user can only see own data)
- [ ] Test with real student data
- [ ] Performance test (response time < 500ms)

**Deliverable:** All portal endpoints working

---

### Week 6: Portal Frontend Integration

#### Day 1-2: Student Portal Testing
- [ ] Login as test student
- [ ] Verify dashboard loads with correct data
- [ ] Test schedule view
- [ ] Test grades view
- [ ] Test attendance calendar

#### Day 3: Teacher Portal Testing
- [ ] Login as test teacher
- [ ] Verify dashboard shows today's classes
- [ ] Test grade entry workflow
- [ ] Test attendance taking

#### Day 4: Guardian Portal Testing
- [ ] Login as test guardian
- [ ] Verify can see linked children
- [ ] Test viewing child performance
- [ ] Test payment history view

#### Day 5: Bug Fixes & Polish
- [ ] Address any integration issues
- [ ] Fix UI/UX problems
- [ ] Add loading states
- [ ] Error handling improvements

**Deliverable:** All portals functional and tested

---

## Phase 4: Alert System (Week 7)
**Goal:** Automated notifications for at-risk students

### Day 1-2: Alert Rules Service
**File:** `app/notifications/alert_rules_service.py`

**Tasks:**
- [ ] Create `AlertRulesService` class
- [ ] Implement CRUD for rules
- [ ] Implement rule evaluation logic
- [ ] Create condition evaluation (less_than, greater_than, etc.)
- [ ] Add cooldown mechanism

### Day 3: Alert Rules Router
**File:** `app/notifications/router.py` (extend)

**Endpoints:**
- [ ] `GET /notifications/alert-rules` (replace mock)
- [ ] `POST /notifications/alert-rules` (replace mock)
- [ ] `PATCH /notifications/alert-rules/{id}` (replace mock)
- [ ] `DELETE /notifications/alert-rules/{id}` (replace mock)
- [ ] `PATCH /notification-rules/{id}/toggle` (replace mock)

### Day 4: Scheduled Task Setup
**File:** `app/tasks/scheduled_tasks.py`

**Tasks:**
- [ ] Create Celery/BackgroundTasks setup
- [ ] Daily rule evaluation job
- [ ] Send notifications for triggered rules
- [ ] Log all rule executions

**Cron Schedule:**
```python
# Run daily at 8 AM
evaluate_rules_daily.schedule(crontab(hour=8, minute=0))
```

### Day 5: Testing & Documentation
- [ ] Create test alert rules
- [ ] Trigger rule conditions manually
- [ ] Verify notifications sent
- [ ] Test cooldown period
- [ ] Document alert rule types

**Deliverable:** Working alert system

---

## Phase 5: Final Integration (Week 8)
**Goal:** Polish, testing, and deployment

### Day 1: Interventions Complete
**File:** `app/analytics/router.py` (extend)

- [ ] Replace mock intervention endpoints
- [ ] Connect to real database
- [ ] Add intervention workflow
- [ ] Test at-risk student → intervention flow

### Day 2: Activity Feed Complete
**File:** `app/analytics/router.py` (extend)

- [ ] Replace notification-based activity feed
- [ ] Use real activity_logs table
- [ ] Add activity categorization
- [ ] Implement activity detail view

### Day 3: Performance Optimization
- [ ] Add missing database indexes
- [ ] Optimize slow queries (N+1 issues)
- [ ] Add query result caching where appropriate
- [ ] Load testing

**Tools:**
```bash
# Use pg_stat_statements to find slow queries
# Use pytest-benchmark for API endpoint timing
# Use locust for load testing
```

### Day 4: Security & Configuration
- [ ] Set up rate limiting
- [ ] Configure CORS for production
- [ ] Set up SMTP for email notifications
- [ ] Review and rotate secrets
- [ ] Security audit

### Day 5: Deployment
- [ ] Run all migrations on production
- [ ] Deploy backend
- [ ] Verify all endpoints
- [ ] Run smoke tests
- [ ] Monitor for errors

**Deliverable:** System in production

---

## Week 9-10: Buffer & Enhancements

### Planned Buffer Time
- Address any issues from production
- Performance tuning based on real usage
- Additional bug fixes
- Documentation updates

### Optional Enhancements (if time permits)
1. **Bulk Enrollment Import** - Excel/CSV upload
2. **Grade Calculation Engine** - Weighted averages, GPA
3. **Notification Templates** - Reusable message templates
4. **Advanced Analytics** - Predictive at-risk scoring
5. **Mobile App APIs** - Optimized for mobile clients

---

## Daily Standup Checklist

### Each developer should report:
1. What I completed yesterday
2. What I'm working on today
3. Any blockers or help needed

### Week Review:
- [ ] All planned endpoints implemented?
- [ ] Tests passing?
- [ ] Documentation updated?
- [ ] Code reviewed?
- [ ] Ready for next phase?

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Face recognition accuracy | High | Test with diverse lighting/angles; set confidence threshold at 0.85; allow manual override |
| Database migration failures | High | Test migrations on staging first; keep rollback scripts; backup before production |
| Portal performance issues | Medium | Add caching; optimize queries; implement pagination; use CDN for static assets |
| Alert rule complexity | Medium | Start with simple rules; add complexity incrementally; thorough testing |
| Integration issues | Medium | Daily integration testing; use API contracts; mock services for frontend |

---

## Success Criteria

### Phase 1 Complete When:
- ✅ All database tables created
- ✅ Activity log tracking working
- ✅ Interventions CRUD working
- ✅ Student portal service functional

### Phase 2 Complete When:
- ✅ Face enrollment working
- ✅ Face recognition >90% accuracy
- ✅ Attendance marking via face working
- ✅ End-to-end tested

### Phase 3 Complete When:
- ✅ Student portal fully functional
- ✅ Teacher portal fully functional
- ✅ Guardian portal fully functional
- ✅ Report cards generating correctly

### Phase 4 Complete When:
- ✅ Alert rules CRUD working
- ✅ Daily rule evaluation running
- ✅ Notifications sent automatically
- ✅ All rule types tested

### Phase 5 Complete When:
- ✅ All features in production
- ✅ No critical bugs
- ✅ Performance targets met
- ✅ Users trained and using system

---

## Post-Launch Support

### Week 11-12: Monitoring
- Monitor error logs daily
- Track API response times
- Gather user feedback
- Fix critical bugs immediately

### Month 2-3: Iteration
- Address user feedback
- Add requested features
- Performance optimization
- Scale infrastructure if needed

---

## Resource Requirements

### Personnel
- 2-3 Backend Developers (Python/FastAPI)
- 1 DevOps Engineer (deployment, monitoring)
- 1 QA Engineer (testing)
- 0.5 Technical Writer (documentation)

### Infrastructure
- PostgreSQL database (production-grade)
- Redis (caching, task queue)
- S3-compatible storage (photos)
- SMTP service (email notifications)
- Monitoring (Sentry, DataDog, or similar)

### Tools
- IDE with Python support
- Postman/Insomnia (API testing)
- Git (version control)
- Docker (local development)
- pgAdmin (database management)

---

**End of Roadmap**

For detailed API specs: `API_SPECIFICATIONS.md`  
For implementation details: `BACKEND_IMPLEMENTATION_GUIDE.md`  
For current status: `FEATURE_STATUS_MATRIX.md`
