# Testing Guide - User List Display Fix

## Quick Start

### 1. Start the Application

```bash
# Make sure you're in the front_end directory
cd front_end

# Install dependencies if needed
npm install

# Start the development server
npm run dev
```

### 2. Login as Admin
- Navigate to `http://localhost:3000/login`
- Login with admin credentials
- Verify you see the dashboard

### 3. Test Each List Page

#### Users Page
1. Navigate to `/dashboard/users`
2. **Expected**: See a list of users with columns for name, email, roles, status
3. **Check Console**: Look for logs starting with `🔍 [Users Page]` and `🔍 [Users Service]`
4. **If Empty**: Check if "No users" message appears or if there's an error
5. **If Error**: Click "Try Again" button or navigate to `/dashboard/debug`

#### Teachers Page
1. Navigate to `/dashboard/teachers`
2. **Expected**: See a list of teachers with stats at the top
3. **Check Console**: Look for logs starting with `🔍 [Teachers Service]`
4. **Test Filters**: Try filtering by status (active, on leave, etc.)
5. **Test Search**: Search for a teacher by name

#### Students Page
1. Navigate to `/dashboard/students`
2. **Expected**: See a list of students with stats
3. **Check Console**: Look for logs starting with `🔍 [Students Service]`
4. **Test Filters**: Try filtering by status and gender
5. **Test Search**: Search for a student by name

#### Guardians Page
1. Navigate to `/dashboard/guardians`
2. **Expected**: See a list of guardians with stats
3. **Check Console**: Look for logs starting with `🔍 [Guardians Service]`
4. **Test Filters**: Try filtering by active/inactive status
5. **Test Search**: Search for a guardian by name

### 4. Use the Debug Page

1. Navigate to `/dashboard/debug` (admin only)
2. Click "Test API Endpoints" button
3. **Expected Results**:
   - All endpoints should show green checkmarks (✓)
   - Response times should be displayed
   - Item counts should be shown

4. **If Errors Occur**:
   - Red X marks indicate failed endpoints
   - Error messages will be displayed
   - Check if backend server is running

## Troubleshooting

### Problem: "Authentication not ready" message
**Solution**: 
- Wait a few seconds for auth to hydrate
- Refresh the page
- Log out and log back in

### Problem: All lists show "Failed to load"
**Solution**:
1. Check if backend is running:
   ```bash
   # Backend should be running on port 8000
   curl http://localhost:8000/api/users
   ```
2. Check `.env.local` file has correct API URL
3. Check browser console for specific error messages

### Problem: Lists show empty but no error
**Solution**:
1. Open browser console (F12)
2. Look for logs with 🔍, ✅, or ❌ symbols
3. Check if `authReady: true` in console logs
4. Verify backend has data in the database

### Problem: 401 Unauthorized errors
**Solution**:
1. Log out and log back in
2. Check if token is expired
3. Verify user has correct roles (admin, director, registrar)

### Problem: Connection refused / Network errors
**Solution**:
1. Verify backend server is running
2. Check backend is accessible at `http://localhost:8000`
3. Check firewall settings
4. Try accessing backend directly in browser

## Console Log Reference

### Success Flow
```
🔍 [useUsers Hook] authReady: true
🔍 [useUsers Hook] filters: {page: 1, size: 20}
🔍 [Users Service] Fetching users with filters: {page: 1, size: 20}
🔍 [Users Service] API URL: /users
🔍 [Users Service] Base URL: http://localhost:8000/api
✅ [Users Service] API Response received
✅ [Users Service] Data: {items: Array(20), total: 100, ...}
✅ [Users Service] Items: Array(20)
✅ [Users Service] Items length: 20
```

### Error Flow
```
🔍 [useUsers Hook] authReady: true
🔍 [Users Service] Fetching users with filters: {page: 1, size: 20}
❌ [Users Service] Error fetching users: AxiosError {...}
❌ [Users Service] Error response: {status: 500, data: {...}}
❌ [Users Service] Error status: 500
❌ [Users Service] Error data: {message: "Internal server error"}
```

## API Endpoint Testing

### Manual Testing with curl

```bash
# Test users endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/users

# Test teachers endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/teachers

# Test students endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/students

# Test guardians endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/guardians
```

### Expected Response Format
```json
{
  "items": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      ...
    }
  ],
  "total": 100,
  "page": 1,
  "size": 20,
  "pages": 5
}
```

## Performance Monitoring

### Check Response Times
- Navigate to `/dashboard/debug`
- Click "Test API Endpoints"
- Response times should be under 1000ms for most endpoints
- If response times are high (>2000ms), check backend performance

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for requests to `/api/users`, `/api/teachers`, etc.
5. Check status codes (should be 200)
6. Check response times

## Feature Testing

### Pagination
1. Go to any list page
2. Scroll to bottom
3. Click "Next" button
4. Verify new page loads
5. Check console for new API request

### Search
1. Type in search box
2. Wait for debounce (usually 300ms)
3. Verify filtered results appear
4. Check console for API request with search parameter

### Filters
1. Select a filter option (e.g., status, role)
2. Verify filtered results appear
3. Check console for API request with filter parameter
4. Clear filter and verify all results return

### Sorting
1. Click on column headers (if sortable)
2. Verify data is sorted
3. Check console for API request with sort parameter

## Reporting Issues

If you encounter issues, please provide:
1. **Browser Console Logs**: Copy all logs with 🔍, ✅, ❌ symbols
2. **Network Tab**: Screenshot of failed requests
3. **Steps to Reproduce**: Exact steps that caused the issue
4. **Expected vs Actual**: What you expected vs what happened
5. **Environment**: Browser version, OS, backend version
6. **Debug Page Results**: Screenshot of `/dashboard/debug` test results

## Success Criteria

✅ All list pages load without errors
✅ Data displays correctly in tables
✅ Search functionality works
✅ Filters work correctly
✅ Pagination works
✅ Stats display at top of pages
✅ Error states show helpful messages
✅ Retry buttons work when errors occur
✅ Debug page shows all green checkmarks
✅ Console logs show successful API calls
