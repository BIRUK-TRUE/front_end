'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from '@/i18n/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertCircle, Save } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ChangePasswordPage() {
  const tc = useTranslations('common');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    try {
      // In a real app, you'd call an API here
      // await authService.changePassword(data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
      toast.success('Password changed successfully');
      reset();
      router.push('/dashboard/profile');
    } catch (error) {
      toast.error('Failed to change password. Please check your current password.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Change Password"
        actions={
          <Link href="/dashboard/profile">
            <Button variant="outline" className="gap-2 min-h-[44px]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {tc('back')}
            </Button>
          </Link>
        }
      />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                {...register('current_password')}
                aria-invalid={!!errors.current_password}
                className="h-11"
              />
              {errors.current_password && (
                <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.current_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                {...register('new_password')}
                aria-invalid={!!errors.new_password}
                className="h-11"
              />
              {errors.new_password && (
                <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                {...register('confirm_password')}
                aria-invalid={!!errors.confirm_password}
                className="h-11"
              />
              {errors.confirm_password && (
                <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2 min-h-[44px] mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
