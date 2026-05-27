# User List Display Fix

## Problem
When logging in as an admin and navigating to the users page (and other role-specific pages like teachers, students, guardians), the lists were not displaying properly.

## Root Causes Identified
1. **Authentication State Issues**: Queries were not executing if authentication wasn't fully hydrated
2. **Missing Error Handling**: No proper error states or retry mechanisms
3. **API Connectivity Issues**: No visibility into backend connection problems
4. **No User Feedback**: Users couldn't see what was wrong or retry failed requests

## Fixes Applied

### 1. Enhanced Error Handling in Services
Added comprehensive logging and error handling to all data services:
- **users.service.ts**: Added detailed console logging and error tracking
- **teachers.service.ts**: Added logging for API requests and responses
- **students.service.ts**: Added error handling with detailed logs
- **guardians.service.ts**: Added comprehensive error tracking

### 2. Improved React Query Hooks
Enhanced all data fetching hooks with:
- **Retry Logic**: Automatically retry failed requests up to 3 times (except for 401/403 errors)
- **Exponential Backoff**: Retry delays increase exponentially (1s, 2s, 4s)
- **Stale Time**: Cache data for 5 minutes to reduce unnecessary requests
- **Garbage Collection**: Keep cached data for 10 minutes
- **Enhanced Logging**: Track authentication state and filter parameters

Updated hooks:
- `useUsers` in `use-users.ts`
- `useTeachers` in `use-teachers.ts`
- `useStudents` in `use-students.ts`
- `useGuardians` in `use-guardians.ts`

### 3. Better UI Error States
Added comprehensive error handling to all list pages:
- **Error Display**: Show clear error messages when data fails to load
- **Retry Button**: Allow users to manually retry failed requests
- **Debug Link**: Added link to debug page (users page only)
- **Error Details**: Display specific error messages from the API

Updated pages:
- `dashboard/users/page.tsx`
- `dashboard/teachers/page.tsx`
- `dashboard/students/page.tsx`
- `dashboard/guardians/page.tsx`

### 4. Debug Tools
Created diagnostic tools to help identify issues:
- **ApiDebugPanel Component**: Test API endpoints and view authentication state
- **Debug Page**: Accessible at `/dashboard/debug` (admin only)

Features:
- Check authentication hydration status
- Verify user login state
- Test all major API endpoints
- View response times and error details
- Display user information and roles

## How to Use

### For Users
1. **If lists don't load**:
   - Check the browser console for detailed error logs (F12 → Console)
   - Look for messages starting with 🔍, ✅, or ❌
   - Click the "Try Again" button if an error is displayed

2. **Use the Debug Page**:
   - Navigate to `/dashboard/debug` (admin only)
   - Click "Test API Endpoints" to check connectivity
   - Review authentication status and API responses

### For Developers

#### Console Logging
All services and hooks now log detailed information:

```
🔍 [Service Name] - Information/Debug messages
✅ [Service Name] - Success messages
❌ [Service Name] - Error messages
⚠️ [Service Name] - Warning messages
```

#### Common Issues and Solutions

**Issue**: Lists show empty but no error
- **Check**: Browser console for authentication state
- **Solution**: Ensure user is logged in and `authReady` is true

**Issue**: "Failed to load" error displayed
- **Check**: Network tab for failed API requests
- **Solution**: Verify backend is running on `http://localhost:8000/api`

**Issue**: 401/403 errors
- **Check**: Token expiration or insufficient permissions
- **Solution**: Log out and log back in, verify user roles

**Issue**: Connection refused
- **Check**: Backend server status
- **Solution**: Start the backend server

## Testing Checklist

- [ ] Login as admin user
- [ ] Navigate to `/dashboard/users` - verify list displays
- [ ] Navigate to `/dashboard/teachers` - verify list displays
- [ ] Navigate to `/dashboard/students` - verify list displays
- [ ] Navigate to `/dashboard/guardians` - verify list displays
- [ ] Test search functionality on each page
- [ ] Test filter functionality on each page
- [ ] Test pagination on each page
- [ ] Navigate to `/dashboard/debug` - run API tests
- [ ] Verify error states by stopping backend server
- [ ] Verify retry functionality works

## Environment Configuration

Ensure `.env.local` has the correct API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Backend Requirements

The backend must be running and accessible at the configured API URL. All endpoints should return data in the format:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "size": 20,
  "pages": 5
}
```

## Next Steps

If issues persist:
1. Check browser console for detailed error logs
2. Use the debug page to test API connectivity
3. Verify backend server is running and accessible
4. Check network tab for failed requests
5. Verify user has correct roles/permissions
6. Check backend logs for server-side errors

## Files Modified

### Services
- `src/lib/api/users.service.ts`
- `src/lib/api/teachers.service.ts`
- `src/lib/api/students.service.ts`
- `src/lib/api/guardians.service.ts`

### Hooks
- `src/hooks/use-users.ts`
- `src/hooks/use-teachers.ts`
- `src/hooks/use-students.ts`
- `src/hooks/use-guardians.ts`

### Pages
- `src/app/[locale]/(dashboard)/dashboard/users/page.tsx`
- `src/app/[locale]/(dashboard)/dashboard/teachers/page.tsx`
- `src/app/[locale]/(dashboard)/dashboard/students/page.tsx`
- `src/app/[locale]/(dashboard)/dashboard/guardians/page.tsx`

### New Files
- `src/components/debug/api-debug.tsx` - Debug panel component
- `src/app/[locale]/(dashboard)/dashboard/debug/page.tsx` - Debug page
