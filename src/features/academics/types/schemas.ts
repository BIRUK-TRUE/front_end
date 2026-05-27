import { z } from 'zod';

// Academic Year Schema
export const academicYearSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters").max(20),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.enum(['planning', 'active', 'completed', 'archived']).default('planning'),
  description: z.string().max(500).optional().nullable()
}).refine((data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  if (end <= start) {
    return false;
  }
  return true;
}, {
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
}).refine((data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  if (end <= start) {
    return false;
  }
  return true;
}, {
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
  stream: z.enum(['natural_science', 'social_science']).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
  capacity: z.number().positive("Must be a positive number").optional().nullable()
}).superRefine((data, ctx) => {
  const needsStream = data.grade_level === 11 || data.grade_level === 12;
  if (needsStream && !data.stream) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Grade ${data.grade_level} requires a stream: Natural Science or Social Science`,
      path: ['stream'],
    });
  }
  if (!needsStream && data.stream) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Stream is only allowed for grades 11 and 12',
      path: ['stream'],
    });
  }
});

export type ClassForm = z.infer<typeof classSchema>;

// Section Schema
export const sectionSchema = z.object({
  name: z.string().min(1).max(10),
  capacity: z.number().positive().default(40),
  room_number: z.string().max(20).optional().nullable(),
  homeroom_teacher_id: z.string().uuid("Invalid Teacher ID").optional().nullable(),
  classroom_id: z.string().uuid("Invalid Classroom ID").optional().nullable()
});

export type SectionForm = z.infer<typeof sectionSchema>;

// Building Schema
export const buildingSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().max(20).optional().nullable(),
  description: z.string().max(500).optional().nullable()
});

export type BuildingForm = z.infer<typeof buildingSchema>;

// Classroom Schema
export const classroomSchema = z.object({
  building_id: z.string().uuid("Invalid Building ID"),
  room_number: z.string().min(1).max(20),
  capacity: z.number().positive().default(40),
  room_type: z.enum(['normal', 'laboratory', 'computer_lab', 'auditorium', 'other']).default('normal'),
  description: z.string().max(500).optional().nullable()
});

export type ClassroomForm = z.infer<typeof classroomSchema>;
