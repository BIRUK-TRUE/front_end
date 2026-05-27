"use client";

import { useState, useCallback, useRef } from "react";
import Papa from "papaparse";
import { useTranslations } from "next-intl";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Download,
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  bulkImportService,
  type BulkImportResponse,
  type BulkRowResult,
  type StudentBulkRow,
  type TeacherBulkRow,
  type GuardianBulkRow,
} from "@/lib/api/bulk-import.service";
import { usePermissions } from "@/hooks/use-permissions";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportType = "students" | "teachers" | "guardians";
type ImportStep = "upload" | "preview" | "results";

// ─── CSV Templates ────────────────────────────────────────────────────────────

const TEMPLATES: Record<ImportType, { headers: string[]; example: string[] }> =
  {
    students: {
      headers: [
        "email",
        "full_name",
        "admission_date",
        "date_of_birth",
        "sex",
        "phone_number",
        "address",
        "nationality",
        "previous_school",
        "ministry_exam_result",
      ],
      example: [
        "student@school.edu.et",
        "Abebe Kebede",
        "2024-09-01",
        "2010-05-15",
        "M",
        "+251912345678",
        "Addis Ababa",
        "Ethiopian",
        "ABC Primary School",
        "85",
      ],
    },
    teachers: {
      headers: [
        "email",
        "full_name",
        "hire_date",
        "date_of_birth",
        "sex",
        "phone_number",
        "address",
        "qualification",
        "specialization",
        "emergency_contact_name",
        "emergency_contact_phone",
        "office_location",
      ],
      example: [
        "teacher@school.edu.et",
        "Tigist Alemu",
        "2020-09-01",
        "1985-03-20",
        "F",
        "+251911234567",
        "Addis Ababa",
        "BSc",
        "Mathematics",
        "Kebede Alemu",
        "+251922345678",
        "Room 12",
      ],
    },
    guardians: {
      headers: [
        "email",
        "full_name",
        "phone_number",
        "address",
        "occupation",
        "workplace",
      ],
      example: [
        "guardian@email.com",
        "Kebede Tadesse",
        "+251933456789",
        "Addis Ababa",
        "Engineer",
        "Ethio Telecom",
      ],
    },
  };

function downloadTemplate(type: ImportType) {
  const { headers, example } = TEMPLATES[type];
  const csv = [headers.join(","), example.join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type}_import_template.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateRow(row: Record<string, string>, type: ImportType): string[] {
  const errors: string[] = [];
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!row.email?.trim()) errors.push("email is required");
  else if (!emailRe.test(row.email.trim())) errors.push("invalid email format");

  if (!row.full_name?.trim() || row.full_name.trim().length < 2)
    errors.push("full_name must be at least 2 characters");

  if (type === "students") {
    if (!row.admission_date?.trim())
      errors.push("admission_date is required (YYYY-MM-DD)");
    if (!row.date_of_birth?.trim())
      errors.push("date_of_birth is required (YYYY-MM-DD)");
    if (!["M", "F"].includes(row.sex?.trim()))
      errors.push("sex must be M or F");
  }

  if (type === "teachers") {
    if (!row.hire_date?.trim())
      errors.push("hire_date is required (YYYY-MM-DD)");
    if (!row.date_of_birth?.trim())
      errors.push("date_of_birth is required (YYYY-MM-DD)");
    if (!["M", "F"].includes(row.sex?.trim()))
      errors.push("sex must be M or F");
  }

  return errors;
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

function DropZone({ onFile, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile, disabled],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer",
        dragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      role="button"
      tabIndex={0}
      aria-label="Upload CSV or Excel file"
      onKeyDown={(e) =>
        e.key === "Enter" && !disabled && inputRef.current?.click()
      }
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <FileSpreadsheet className="h-7 w-7 text-primary" />
      </div>
      <div>
        <p className="font-medium">Drag & drop your file here</p>
        <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Accepted: .csv · Max 500 rows
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
        disabled={disabled}
      />
    </div>
  );
}

// ─── Preview Table ────────────────────────────────────────────────────────────

interface ParsedRow {
  _rowNum: number;
  _errors: string[];
  [key: string]: unknown;
}

interface PreviewTableProps {
  rows: ParsedRow[];
  headers: string[];
}

function PreviewTable({ rows, headers }: PreviewTableProps) {
  const validCount = rows.filter((r) => r._errors.length === 0).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant="outline"
          className="gap-1.5 text-green-700 border-green-300 bg-green-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {validCount} valid
        </Badge>
        {invalidCount > 0 && (
          <Badge
            variant="outline"
            className="gap-1.5 text-red-700 border-red-300 bg-red-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            {invalidCount} with errors
          </Badge>
        )}
        <span className="text-sm text-muted-foreground">
          {rows.length} rows total
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border max-h-80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              {headers.slice(0, 6).map((h) => (
                <TableHead key={h} className="text-xs whitespace-nowrap">
                  {h}
                </TableHead>
              ))}
              {headers.length > 6 && (
                <TableHead className="text-xs">
                  +{headers.length - 6} more
                </TableHead>
              )}
              <TableHead className="w-32">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 50).map((row) => (
              <TableRow
                key={row._rowNum}
                className={row._errors.length > 0 ? "bg-red-50/50" : ""}
              >
                <TableCell className="text-xs text-muted-foreground">
                  {row._rowNum}
                </TableCell>
                {headers.slice(0, 6).map((h) => (
                  <TableCell key={h} className="text-xs max-w-[120px] truncate">
                    {String(row[h] ?? "")}
                  </TableCell>
                ))}
                {headers.length > 6 && <TableCell />}
                <TableCell>
                  {row._errors.length === 0 ? (
                    <Badge
                      variant="outline"
                      className="text-green-700 border-green-300 bg-green-50 text-xs"
                    >
                      Valid
                    </Badge>
                  ) : (
                    <div className="space-y-0.5">
                      {row._errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-600">
                          {err}
                        </p>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {rows.length > 50 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing first 50 of {rows.length} rows
        </p>
      )}
    </div>
  );
}

// ─── Results Table ────────────────────────────────────────────────────────────

function ResultsTable({ results }: { results: BulkRowResult[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border max-h-80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Row</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>ID / Reg. No.</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => (
            <TableRow key={r.row} className={r.success ? "" : "bg-red-50/50"}>
              <TableCell className="text-xs text-muted-foreground">
                {r.row}
              </TableCell>
              <TableCell className="text-xs">{r.email}</TableCell>
              <TableCell className="text-xs font-mono">
                {r.registration_number || r.employee_id || r.guardian_id || "—"}
              </TableCell>
              <TableCell>
                {r.success ? (
                  <Badge
                    variant="outline"
                    className="text-green-700 border-green-300 bg-green-50 text-xs gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" /> OK
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-red-700 border-red-300 bg-red-50 text-xs gap-1"
                  >
                    <XCircle className="h-3 w-3" /> Failed
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-xs text-red-600 max-w-[240px] truncate">
                {r.error || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Import Tab ───────────────────────────────────────────────────────────────

interface ImportTabProps {
  type: ImportType;
  canImport: boolean;
}

function ImportTab({ type, canImport }: ImportTabProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<BulkImportResponse | null>(null);

  const headers = TEMPLATES[type].headers;

  const handleFile = (file: File) => {
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        const rows: ParsedRow[] = parsed.data.map((row, idx) => ({
          ...row,
          _rowNum: idx + 1,
          _errors: validateRow(row, type),
        }));
        setParsedRows(rows);
        setStep("preview");
      },
      error: () => {
        toast.error("Failed to parse file. Make sure it is a valid CSV.");
      },
    });
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r._errors.length === 0);
    if (validRows.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }

    setImporting(true);
    try {
      let response: BulkImportResponse;

      if (type === "students") {
        const rows: StudentBulkRow[] = validRows.map((r) => ({
          email: String(r.email ?? "").trim(),
          full_name: String(r.full_name ?? "").trim(),
          admission_date: String(r.admission_date ?? "").trim(),
          date_of_birth: String(r.date_of_birth ?? "").trim(),
          sex: String(r.sex ?? "")
            .trim()
            .toUpperCase() as "M" | "F",
          phone_number: String(r.phone_number ?? "").trim() || undefined,
          address: String(r.address ?? "").trim() || undefined,
          nationality: String(r.nationality ?? "").trim() || "Ethiopian",
          previous_school: String(r.previous_school ?? "").trim() || undefined,
          ministry_exam_result: r.ministry_exam_result
            ? Number(r.ministry_exam_result)
            : undefined,
        }));
        response = await bulkImportService.importStudents(rows);
      } else if (type === "teachers") {
        const rows: TeacherBulkRow[] = validRows.map((r) => ({
          email: String(r.email ?? "").trim(),
          full_name: String(r.full_name ?? "").trim(),
          hire_date: String(r.hire_date ?? "").trim(),
          date_of_birth: String(r.date_of_birth ?? "").trim(),
          sex: String(r.sex ?? "")
            .trim()
            .toUpperCase() as "M" | "F",
          phone_number: String(r.phone_number ?? "").trim() || undefined,
          address: String(r.address ?? "").trim() || undefined,
          qualification: String(r.qualification ?? "").trim() || undefined,
          specialization: String(r.specialization ?? "").trim() || undefined,
          emergency_contact_name:
            String(r.emergency_contact_name ?? "").trim() || undefined,
          emergency_contact_phone:
            String(r.emergency_contact_phone ?? "").trim() || undefined,
          office_location: String(r.office_location ?? "").trim() || undefined,
        }));
        response = await bulkImportService.importTeachers(rows);
      } else {
        const rows: GuardianBulkRow[] = validRows.map((r) => ({
          email: String(r.email ?? "").trim(),
          full_name: String(r.full_name ?? "").trim(),
          phone_number: String(r.phone_number ?? "").trim() || undefined,
          address: String(r.address ?? "").trim() || undefined,
          occupation: String(r.occupation ?? "").trim() || undefined,
          workplace: String(r.workplace ?? "").trim() || undefined,
        }));
        response = await bulkImportService.importGuardians(rows);
      }

      setResult(response);
      setStep("results");

      if (response.failed === 0) {
        toast.success(
          `All ${response.succeeded} records imported successfully.`,
        );
      } else {
        toast.warning(
          `${response.succeeded} imported, ${response.failed} failed.`,
        );
      }
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      toast.error(
        e?.response?.data?.detail ||
          e?.message ||
          "Import failed. Please try again.",
      );
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setStep("upload");
    setParsedRows([]);
    setFileName("");
    setResult(null);
  };

  const validCount = parsedRows.filter((r) => r._errors.length === 0).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="space-y-5">
      {/* Template download */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-medium">Step 1 — Download the template</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in the CSV template with your data, then upload it below.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => downloadTemplate(type)}
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Upload step */}
      {step === "upload" && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Step 2 — Upload your file</p>
          <DropZone onFile={handleFile} disabled={!canImport} />
          {!canImport && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to import {type}.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Preview step */}
      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-medium">Step 3 — Review & confirm</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                File: <span className="font-mono">{fileName}</span>
              </p>
            </div>
            <Button variant="ghost" size="sm" className="gap-2" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Upload different file
            </Button>
          </div>

          <PreviewTable rows={parsedRows} headers={headers} />

          {invalidCount > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {invalidCount} row{invalidCount > 1 ? "s" : ""} have validation
                errors and will be skipped. Only the {validCount} valid row
                {validCount !== 1 ? "s" : ""} will be imported.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="gap-2 min-w-[140px]"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  Import {validCount} record{validCount !== 1 ? "s" : ""}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {importing && (
            <div className="space-y-1.5">
              <Progress value={undefined} className="h-1.5 animate-pulse" />
              <p className="text-xs text-center text-muted-foreground">
                Importing records… this may take a moment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results step */}
      {step === "results" && result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold">{result.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total rows</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {result.succeeded}
                </p>
                <p className="text-xs text-green-600 mt-1">Imported</p>
              </CardContent>
            </Card>
            <Card
              className={result.failed > 0 ? "border-red-200 bg-red-50/50" : ""}
            >
              <CardContent className="pt-4 pb-4 text-center">
                <p
                  className={cn(
                    "text-2xl font-bold",
                    result.failed > 0
                      ? "text-red-700"
                      : "text-muted-foreground",
                  )}
                >
                  {result.failed}
                </p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    result.failed > 0
                      ? "text-red-600"
                      : "text-muted-foreground",
                  )}
                >
                  Failed
                </p>
              </CardContent>
            </Card>
          </div>

          <ResultsTable results={result.results} />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Import another file
            </Button>
            {result.failed > 0 && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  const failedRows = result.results.filter((r) => !r.success);
                  const csv = [
                    "row,email,error",
                    ...failedRows.map(
                      (r) => `${r.row},${r.email || ""},${r.error || ""}`,
                    ),
                  ].join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${type}_import_errors.csv`;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" />
                Download error report
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function BulkImportPage() {
  const { canManageStudents, canManageTeachers, canManageGuardians } =
    usePermissions();

  const tabs = [
    {
      value: "students" as ImportType,
      label: "Students",
      icon: GraduationCap,
      show: canManageStudents,
    },
    {
      value: "teachers" as ImportType,
      label: "Teachers",
      icon: BookOpen,
      show: canManageTeachers,
    },
    {
      value: "guardians" as ImportType,
      label: "Guardians",
      icon: Users,
      show: canManageGuardians,
    },
  ].filter((t) => t.show);

  const defaultTab = tabs[0]?.value ?? "students";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Data Import"
        description="Import multiple students, teachers, or guardians at once from a CSV file."
        icon={Upload}
        breadcrumb={["Dashboard", "Bulk Import"]}
      />

      {/* How it works */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2 sm:grid-cols-3 text-sm">
            {[
              {
                step: "1",
                text: "Download the CSV template for the data type you want to import.",
              },
              {
                step: "2",
                text: "Fill in your data following the column headers. Required fields are marked in the template.",
              },
              {
                step: "3",
                text: "Upload the file, review the preview, and confirm the import.",
              },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {step}
                </span>
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Import tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-4">
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(({ value, show }) => (
          <TabsContent key={value} value={value}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base capitalize">
                  {value} Import
                </CardTitle>
                <CardDescription>
                  {value === "students" &&
                    "Import student records. Required: email, full_name, admission_date, date_of_birth, sex."}
                  {value === "teachers" &&
                    "Import teacher records. Required: email, full_name, hire_date, date_of_birth, sex. Director role required."}
                  {value === "guardians" &&
                    "Import guardian records. Required: email, full_name."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImportTab type={value} canImport={show} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function BulkImportPageWrapper() {
  return (
    <ProtectedRoute requireRoles={["admin", "director", "registrar"]}>
      <BulkImportPage />
    </ProtectedRoute>
  );
}
