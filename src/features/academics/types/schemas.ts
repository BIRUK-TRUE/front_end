import { z } from 'zod';

// Academic Year Schema
export const academicYearSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters").max(20),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  description: z.string().max(500).optional().nullable()
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"]
});

export type AcademicYearForm = z.infer<typeof academicYearSchema>;

// Term Schema
export const termSchema = z.object({
  name: z.string().min(2).max(50),
  term_number: z.number().min(1).max(4),
  start_date: z.string().min(1),
  end_date: z.string().min(1)
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"]
});

export type TermForm = z.infer<typeof termSchema>;

// Subject Schema
export const subjectSchema = z.object({
  code: z.string().min(2).max(20), // Backend auto-uppercases
  name: z.string().min(2).max(100),
  category: z.enum(['core', 'elective', 'vocational', 'extracurricular']).default('core'),
  description: z.string().max(500).optional().nullable()
});

export type SubjectForm = z.infer<typeof subjectSchema>;

// Class Schema
export const classSchema = z.object({
  name: z.string().min(2).max(50),
  grade_level: z.number().min(0, "0 for KG").max(12),
  description: z.string().max(255).optional().nullable(),
  capacity: z.number().positive("Must be a positive number").optional().nullable()
});

export type ClassForm = z.infer<typeof classSchema>;

// Section Schema
export const sectionSchema = z.object({
  name: z.string().min(1).max(10),
  capacity: z.number().positive().default(40),
  room_number: z.string().max(20).optional().nullable(),
  homeroom_teacher_id: z.string().uuid("Invalid Teacher ID").optional().nullable()
});

export type SectionForm = z.infer<typeof sectionSchema>;
