"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  classSchema,
  type ClassForm,
} from "@/features/academics/types/schemas";
import { type Class } from "@/features/academics/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Info } from "lucide-react";
import { useEffect } from "react";

interface ClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem?: Class | null;
  onSubmit: (data: ClassForm) => void;
  isLoading?: boolean;
}

export function ClassModal({
  open,
  onOpenChange,
  classItem,
  onSubmit,
  isLoading,
}: ClassModalProps) {
  const t = useTranslations("common");
  const ta = useTranslations("academics");

  const form = useForm<ClassForm>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: {
      name: "",
      grade_level: 1,
      stream: null,
      capacity: undefined,
      description: "",
    },
  });

  const gradeLevel = form.watch("grade_level");
  const needsStream = gradeLevel === 11 || gradeLevel === 12;

  // Reset form when modal opens/closes or class changes
  useEffect(() => {
    if (open) {
      if (classItem) {
        form.reset({
          name: classItem.name,
          grade_level: classItem.grade_level,
          stream:
            classItem.stream === "natural_science" ||
            classItem.stream === "social_science"
              ? classItem.stream
              : null,
          capacity: classItem.capacity || undefined,
          description: classItem.description || "",
        });
      } else {
        form.reset({
          name: "",
          grade_level: 1,
          stream: null,
          capacity: undefined,
          description: "",
        });
      }
    }
  }, [open, classItem, form]);

  // When grade changes away from 11/12, clear stream
  useEffect(() => {
    if (!needsStream) {
      form.setValue("stream", null);
    }
  }, [needsStream, form]);

  // Auto-fill name when grade + stream are both set
  useEffect(() => {
    if (!classItem) {
      const stream = form.getValues("stream");
      if (gradeLevel >= 1 && gradeLevel <= 12) {
        if (needsStream && stream) {
          const streamLabel =
            stream === "natural_science" ? "Natural Science" : "Social Science";
          form.setValue("name", `Grade ${gradeLevel} ${streamLabel}`);
        } else if (!needsStream) {
          form.setValue("name", `Grade ${gradeLevel}`);
        }
      }
    }
  }, [gradeLevel, form.watch("stream"), needsStream, classItem, form]);

  const handleSubmit = (data: ClassForm) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {classItem ? ta("editClassTitle") : ta("addClassTitle")}
          </DialogTitle>
          <DialogDescription>
            {classItem ? ta("editClassDesc") : ta("addClassDesc")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit as any)}
            className="space-y-4"
          >
            {/* Grade Level */}
            <FormField
              control={form.control}
              name="grade_level"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>
                    {ta("gradeYearLevel")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={12}
                      placeholder="e.g. 9"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    0 = Kindergarten, 1–12 for grades
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stream — only for grade 11 and 12 */}
            {needsStream && (
              <FormField
                control={form.control}
                name="stream"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>
                      Stream <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? null : v)
                      }
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stream…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="natural_science">
                          🔬 Natural Science
                        </SelectItem>
                        <SelectItem value="social_science">
                          📚 Social Science
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Grade {gradeLevel} can have two classes — one per stream.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Info banner for grade 11/12 */}
            {needsStream && (
              <Alert className="py-2">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  For Grade {gradeLevel}, you can create two separate classes:
                  one for <strong>Natural Science</strong> and one for{" "}
                  <strong>Social Science</strong>.
                </AlertDescription>
              </Alert>
            )}

            {/* Class Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>
                    {ta("className")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={ta("classNamePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Auto-filled — you can customise it.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{ta("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={ta("classDescriptionPlaceholder")}
                      className="resize-none"
                      rows={2}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {classItem ? t("save") : t("create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
