# Data Display Verification Guide

## Quick Verification Steps

### 1. Start the Application

```bash
# Terminal 1: Start Backend
cd sms_backend
# Activate virtual environment and run:
uvicorn app.main:app --reload

# Terminal 2: Start Frontend
cd front_end
npm run dev
```

### 2. Open Browser Console

1. Open the application in your browser (usually http://localhost:3000)
2. Press F12 to open DevTools
3. Go to the "Console" tab
4. Keep it open while testing

### 3. Test Each Page

#### A. Academic Years Page

1. Navigate to: `/dashboard/academics/years`
2. In console, look for:
   ```
   🔍 useAcademicYears called with page: 1 size: 20
   ✅ useAcademicYears RAW response: {...}
   ✅ Response type: object
   ✅ Has items?: true/false
   ✅ Items length: X
   ✅ Total: X
   ```

**What to Check**:
- If `Items length: 0` and `Total: 0` → No academic years in database (create one!)
- If `Items length: X` where X > 0 → Data exists, should display on page
- If page shows "No academic years" but console shows data → Component rendering issue

**Expected Behavior**:
- If database has academic years → They should display in a table
- If database is empty → Should show "Create your first academic year" message

#### B. Users Page

1. Navigate to: `/dashboard/users`
2. In console, look for:
   ```
   🔍 usersService.getAll called with filters: {...}
   🔍 Sending params to backend: {...}
   ✅ usersService.getAll RAW response: {...}
   ✅ Items length: X
   ✅ Total: X
   ```

**What to Check**:
- Check the filters being sent (especially `role_name`)
- If filtering by "student" role shows 0 users → This is EXPECTED if students don't have user accounts
- Total users should match what's in the database

**Expected Behavior**:
- Shows all user accounts (admin, teacher, etc.)
- Filtering by "student" may show 0 (students are separate from users!)

#### C. Students Page

1. Navigate to: `/dashboard/students` (or wherever students are listed)
2. In console, look for:
   ```
   🔍 studentsService.getAll called with filters: {...}
   ✅ studentsService.getAll RAW response: {...}
   ✅ Items length: X
   ✅ Total: X
   ```

**Expected Behavior**:
- Should show all student records
- This count is SEPARATE from users with "student" role

#### D. Dashboard Stats

1. Navigate to: `/dashboard`
2. Check the stats cards
3. In console, look for:
   ```
   🔍 studentsService.getStats called
   ✅ studentsService.getStats response: {...}
   ✅ Normalized stats: {...}
   ```

**Expected Behavior**:
- Student count on dashboard = records in students table
- User count on users page = records in users table
- **These numbers can be different!**

### 4. Common Scenarios & Solutions

#### Scenario 1: "No academic year found" but creation says "already exists"

**Diagnosis**:
1. Check console logs
2. If `Items length: 0` → Database is actually empty, backend error message is wrong
3. If `Items length: X` where X > 0 → Frontend display issue

**Solution**:
- If database is empty: Create a new academic year
- If data exists but not displaying: Check component props and rendering logic

#### Scenario 2: Dashboard shows 35 students, Users page shows 0

**Diagnosis**:
This is EXPECTED behavior!
- Dashboard shows: Physical student records (35 students enrolled)
- Users page (filtered by "student"): User accounts with student role (0 accounts)

**Explanation**:
```
Students Table (35 records)          Users Table (0 with student role)
├─ Student 1 (no user account)       ├─ admin@school.com (admin role)
├─ Student 2 (no user account)       ├─ teacher@school.com (teacher role)
├─ Student 3 (no user account)       └─ director@school.com (director role)
└─ ... (32 more)
```

**Solution**:
- This is correct if students don't need portal access
- If students should have accounts, check student creation logic

#### Scenario 3: Page shows loading spinner forever

**Diagnosis**:
1. Check console for errors
2. Check Network tab in DevTools
3. Look for failed API requests

**Solution**:
- If 401 error: Token expired, logout and login again
- If 500 error: Backend error, check backend logs
- If no request: Frontend routing or permission issue

#### Scenario 4: Console shows errors like "data.items is not an array"

**Diagnosis**:
Backend is returning unexpected response structure

**Solution**:
1. Check backend logs for errors
2. Test endpoint directly with curl or Postman
3. Verify backend is returning proper paginated response:
   ```json
   {
     "items": [...],
     "total": 10,
     "page": 1,
     "size": 20,
     "pages": 1
   }
   ```

### 5. Using the Test Script

```bash
cd front_end
node test-api.js
```

**Before running**:
1. Login to the application
2. Open DevTools → Application → Local Storage
3. Copy the value of `accessToken`
4. Edit `test-api.js` and replace `YOUR_ACCESS_TOKEN_HERE` with your token
5. Run the script

**What it tests**:
- Academic years endpoint
- Users endpoint
- Students endpoint
- Student stats endpoint
- User stats endpoint

**What to look for**:
- Status: 200 (success)
- Response structure has `items` array
- Total matches items length
- Items have expected fields

### 6. Database Verification

If you need to check the database directly:

```sql
-- Check academic years
SELECT id, name, start_date, end_date, is_current, status 
FROM academic_years 
ORDER BY start_date DESC;

-- Check users
SELECT id, email, full_name, role_names, is_active 
FROM users 
ORDER BY created_at DESC;

-- Check students
SELECT id, registration_number, full_name, status, user_id 
FROM students 
ORDER BY created_at DESC 
LIMIT 10;

-- Check students with user accounts
SELECT s.id, s.full_name, s.user_id, u.email, u.role_names
FROM students s
LEFT JOIN users u ON s.user_id = u.id
LIMIT 10;
```

### 7. Checklist

Before presenting to the school:

- [ ] Login works correctly
- [ ] Dashboard displays correct stats
- [ ] Academic years page shows all years
- [ ] Can create new academic year
- [ ] Users page shows all users
- [ ] Can filter users by role
- [ ] Students page shows all students
- [ ] Can filter students by status
- [ ] Teachers page shows all teachers
- [ ] Guardians page shows all guardians
- [ ] All search functions work
- [ ] All pagination works
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] All data is consistent across pages

### 8. Troubleshooting Tips

**If a page shows "No data" but you know data exists**:

1. **Check Console First**:
   - Look for the 🔍 and ✅ logs
   - Verify `Items length` matches expected count
   - Check for any ❌ error logs

2. **Check Network Tab**:
   - Open DevTools → Network tab
   - Filter by "Fetch/XHR"
   - Find the API request
   - Check response status and body

3. **Check Backend**:
   - Look at backend terminal for errors
   - Check if request reached the backend
   - Verify database has data

4. **Check Permissions**:
   - Verify your user has permission to view the data
   - Try with an admin account

5. **Clear Cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear browser cache
   - Logout and login again

**If counts don't match between pages**:

1. **Understand the Data Model**:
   - Students ≠ Users with student role
   - Teachers ≠ Users with teacher role
   - Each entity has its own table and count

2. **Check What You're Comparing**:
   - Dashboard student count = students table
   - Users page student filter = users table with student role
   - These are DIFFERENT things!

3. **Verify Relationships**:
   - Check if entities have linked user accounts
   - Not all students/teachers need user accounts

### 9. Success Criteria

The system is working correctly when:

✅ All pages load without errors
✅ Console logs show data being fetched
✅ Data displayed matches backend database
✅ Filters and search work correctly
✅ Pagination works correctly
✅ Stats on dashboard are accurate
✅ No console errors
✅ No backend errors
✅ You understand why different pages show different counts

### 10. Final Notes

**Remember**:
- Students and Users are separate entities
- Dashboard shows physical student records
- Users page shows login accounts
- These counts can and should be different
- Enhanced logging helps debug any issues
- Check console first, then backend, then database

**For Presentation**:
- Test all features beforehand
- Have sample data ready
- Know how to explain the data model
- Be prepared to show the difference between students and users
- Have this guide handy for troubleshooting
