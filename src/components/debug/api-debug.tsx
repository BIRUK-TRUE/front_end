'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { axiosInstance } from '@/lib/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  error?: string;
  responseTime?: number;
}

export function ApiDebugPanel() {
  const { user, accessToken, isHydrated } = useAuthStore();
  const authReady = useAuthReady();
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const endpoints = [
    '/users',
    '/teachers', 
    '/students',
    '/guardians',
    '/auth/me'
  ];

  const testEndpoint = async (endpoint: string): Promise<ApiTestResult> => {
    const startTime = Date.now();
    try {
      const response = await axiosInstance.get(endpoint, {
        params: endpoint === '/users' ? { page: 1, size: 5 } : { page: 1, size: 5 }
      });
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint,
        status: 'success',
        data: response.data,
        responseTime
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint,
        status: 'error',
        error: error.response?.data?.message || error.message || 'Unknown error',
        responseTime
      };
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const endpoint of endpoints) {
      setTestResults(prev => [...prev, { endpoint, status: 'loading' }]);
      const result = await testEndpoint(endpoint);
      setTestResults(prev => 
        prev.map(r => r.endpoint === endpoint ? result : r)
      );
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: ApiTestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      loading: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          API Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auth Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Auth Hydrated</div>
            <div className="flex items-center gap-2">
              {isHydrated ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">{isHydrated ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Auth Ready</div>
            <div className="flex items-center gap-2">
              {authReady ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">{authReady ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">User Logged In</div>
            <div className="flex items-center gap-2">
              {user ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">{user ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Access Token</div>
            <div className="flex items-center gap-2">
              {accessToken ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">{accessToken ? 'Present' : 'Missing'}</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="space-y-2">
            <div className="text-sm font-medium">User Info</div>
            <div className="bg-muted p-3 rounded-md">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Name:</strong> {user.full_name}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Roles:</strong> {user.roles.join(', ')}</div>
                <div><strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Test Button */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={runTests} 
            disabled={isRunning || !authReady}
            className="gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Test API Endpoints
          </Button>
          
          {!authReady && (
            <div className="text-sm text-muted-foreground">
              Authentication not ready - please log in first
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Test Results</div>
            <div className="space-y-2">
              {testResults.map((result) => (
                <div key={result.endpoint} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <code className="text-sm">{result.endpoint}</code>
                    {getStatusBadge(result.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {result.responseTime && (
                      <span>{result.responseTime}ms</span>
                    )}
                    {result.status === 'success' && result.data && (
                      <span>
                        {Array.isArray(result.data.items) 
                          ? `${result.data.items.length} items` 
                          : 'Success'
                        }
                      </span>
                    )}
                    {result.status === 'error' && (
                      <span className="text-red-500 max-w-xs truncate">
                        {result.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}