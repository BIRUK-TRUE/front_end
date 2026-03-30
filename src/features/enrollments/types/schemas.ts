import { z } from 'zod';

export const enrollmentSchema = z.object({
  student_id: z.string().uuid("Invalid Student ID"),
  academic_year_id: z.string().uuid("Invalid Academic Year ID"),
  class_id: z.string().uuid("Invalid Class ID"),
  section_id: z.string().uuid("Invalid Section ID"),
  enrollment_date: z.string().min(1, "Enrollment date is required"),
});

export type EnrollmentForm = z.infer<typeof enrollmentSchema>;

export const transferSchema = z.object({
  new_section_id: z.string().uuid("Invalid Section ID"),
  transfer_date: z.string().min(1, "Transfer date is required"),
  reason: z.string().optional(),
});

export type TransferForm = z.infer<typeof transferSchema>;

export const withdrawalSchema = z.object({
  withdrawal_date: z.string().min(1, "Withdrawal date is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export type WithdrawalForm = z.infer<typeof withdrawalSchema>;
