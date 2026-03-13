import { useState, useMemo, useEffect, useRef } from "react";
import Dashboard from "@/components/dashboard";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Save,
  X,
  Pencil,
  Search,
  Loader2,
  Upload,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/app/supabase";
import { toast } from "sonner";

type Student = {
  id: number;
  rollNo: string;
  name: string;
  email: string;
  gender: string;
  city: string;
  dob: string;
  class: { id: number; name: string };
};

type CsvRow = {
  rollNo: string;
  name: string;
  email: string;
  gender: string;
  city: string;
  dob: string;
  class: string;
  _status?: "pending" | "success" | "error";
  _error?: string;
};

const initialStudents: Student[] = [
  {
    id: 1,
    rollNo: "123",
    name: "Ismail Syed",
    email: "ismail@example.com",
    gender: "Male",
    city: "Aurangabad",
    dob: "2000-05-15",
    class: { id: 1, name: "BCS" },
  },
];

const emptyStudent = {
  rollNo: "",
  name: "",
  email: "",
  gender: "",
  city: "",
  dob: "",
  class: { id: 0, name: "BCS" },
};

const REQUIRED_CSV_HEADERS = [
  "rollNo",
  "name",
  "email",
  "gender",
  "city",
  "dob",
  "class",
];

export default function Students() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [newRow, setNewRow] = useState<null | typeof emptyStudent>(null);
  const [editId, setEditId] = useState<null | number>(null);
  const [editData, setEditData] = useState<typeof emptyStudent>({
    ...emptyStudent,
  });
  const [search, setSearch] = useState("");
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // CSV import state
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    console.log(students);
    return students.filter((s) =>
      [s.rollNo, s?.name, s.email, s.gender, s.city, s.dob].some((val) => {
        if (!val || typeof val !== "string") return false;
        return val.toLowerCase().includes(q);
      }),
    );
  }, [students, search]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("students")
          .select(
            "id, rollNo, name, email, gender, city, dob, class_id, class (id, name)",
          )
          .order("created_at", { ascending: true })
          .returns<Student[]>();

        if (error) throw error;
        setStudents(data);

        const { data: classesData, error: classesError } = await supabase
          .from("class")
          .select("*")
          .order("created_at", { ascending: true })
          .returns<{ id: number; name: string }[]>();

        if (classesError) throw classesError;
        setClasses(classesData);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── CSV Import ────────────────────────────────────────────────────────────────

  const parseCsv = (text: string): { rows: CsvRow[]; error: string | null } => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2)
      return { rows: [], error: "CSV file is empty or has no data rows." };

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));
    const missing = REQUIRED_CSV_HEADERS.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      return {
        rows: [],
        error: `Missing required columns: ${missing.join(", ")}`,
      };
    }

    const rows: CsvRow[] = lines
      .slice(1)
      .map((line) => {
        const values = line
          .split(",")
          .map((v) => v.trim().replace(/^"|"$/g, ""));
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] ?? "";
        });
        return {
          rollNo: obj.rollNo,
          name: obj.name,
          email: obj.email,
          gender: obj.gender,
          city: obj.city,
          dob: obj.dob,
          class: obj.class,
          _status: "pending",
        } as CsvRow;
      })
      .filter((r) => r.rollNo || r.name || r.email); // skip blank rows

    return { rows, error: null };
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const { rows, error } = parseCsv(text);
      setCsvError(error);
      setCsvRows(rows);
      setImportDone(false);
      setCsvDialogOpen(true);
    };
    reader.readAsText(file);
  };

  const handleImportCsv = async () => {
    if (csvRows.length === 0) return;
    setIsImporting(true);

    const updatedRows = [...csvRows];

    for (let i = 0; i < updatedRows.length; i++) {
      const row = updatedRows[i];
      if (row._status === "success") continue;

      console.log(classes);
      const classObj = classes.find(
        (c) => c.name.toLowerCase() === row.class.toLowerCase(),
      );
      console.log("ClassIbj", classObj);

      if (!classObj) {
        updatedRows[i] = {
          ...row,
          _status: "error",
          _error: `Class "${row.class}" not found`,
        };
        setCsvRows([...updatedRows]);
        continue;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "supabase-functions-deploy-create-student-user",
          { body: { email: row.email, name: row.name, dob: row.dob } },
        );

        if (fnError) throw new Error(fnError.message);

        const { error: insertError } = await supabase.from("students").insert({
          rollNo: row.rollNo,
          name: row.name,
          email: row.email,
          gender: row.gender,
          city: row.city,
          dob: row.dob,
          class_id: classObj.id,
          user_id: data.userId,
        });

        if (insertError) throw new Error(insertError.message);

        updatedRows[i] = { ...row, _status: "success" };
        setStudents((prev) => [
          ...prev,
          {
            id: Date.now() + i,
            rollNo: row.rollNo,
            name: row.name,
            email: row.email,
            gender: row.gender,
            city: row.city,
            dob: row.dob,
            class: classObj,
          },
        ]);
      } catch (err) {
        updatedRows[i] = {
          ...row,
          _status: "error",
          _error: err instanceof Error ? err.message : String(err),
        };
      }

      setCsvRows([...updatedRows]);
    }

    setIsImporting(false);
    setImportDone(true);

    const successCount = updatedRows.filter(
      (r) => r._status === "success",
    ).length;
    const errorCount = updatedRows.filter((r) => r._status === "error").length;
    toast.success(
      `Import complete: ${successCount} succeeded, ${errorCount} failed.`,
    );
  };

  const handleCloseCsvDialog = () => {
    if (isImporting) return;
    setCsvDialogOpen(false);
    setCsvRows([]);
    setCsvError(null);
    setImportDone(false);
  };

  // ── Existing handlers ─────────────────────────────────────────────────────────

  const handleAddRow = () => setNewRow({ ...emptyStudent });

  const handleNewChange = (field: string, value: string) => {
    if (field === "class") {
      const found = classes.find((c) => c?.name === value);
      setNewRow((prev) => ({
        ...prev!,
        class: found ?? { id: 0, name: value },
      }));
    } else {
      setNewRow((prev) => ({ ...prev!, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!newRow) return;
    const { rollNo, name, email, gender, city, dob, class: classData } = newRow;
    if (!rollNo || !name || !email || !gender || !city || !dob) {
      toast.error("Please fill in all fields before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "supabase-functions-deploy-create-student-user",
        { body: { email, name, dob } },
      );

      if (fnError) {
        toast.error(`Failed to create user: ${fnError.message}`);
        return;
      }

      const { error: insertError } = await supabase.from("students").insert({
        rollNo,
        name,
        email,
        gender,
        city,
        dob,
        class_id: classData.id,
        user_id: data.userId,
      });

      if (insertError) {
        toast.error(`Failed to insert student: ${insertError.message}`);
        return;
      }

      setStudents((prev) => [
        ...prev,
        {
          id: Date.now(),
          rollNo,
          name,
          email,
          gender,
          city,
          dob,
          class: classData,
        },
      ]);
      setNewRow(null);
    } catch (error) {
      toast.error(
        `Failed to create student: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNew = () => setNewRow(null);

  const handleEdit = (student: Student) => {
    setEditId(student.id);
    setEditData({
      rollNo: student.rollNo,
      name: student?.name,
      email: student.email,
      gender: student.gender,
      city: student.city,
      dob: student.dob,
      class: student.class,
    });
    setNewRow(null);
  };

  const handleEditChange = (field: string, value: string) => {
    if (field === "class") {
      const found = classes.find((c) => c?.name === value);
      setEditData((prev) => ({
        ...prev,
        class: found ?? { id: 0, name: value },
      }));
    } else {
      setEditData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleEditSave = async () => {
    const {
      rollNo,
      name,
      email,
      gender,
      city,
      dob,
      class: classData,
    } = editData;
    if (!rollNo || !name || !email || !gender || !city || !dob) {
      toast.error("Please fill in all fields before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("students")
        .update({
          rollNo,
          name,
          email,
          gender,
          city,
          dob,
          class_id: classData.id,
        })
        .eq("id", editId);

      if (error) {
        toast.error(`Failed to update student: ${error.message}`);
        return;
      }

      setStudents((prev) =>
        prev.map((s) =>
          s.id === editId
            ? {
                id: s.id,
                rollNo,
                name,
                email,
                gender,
                city,
                dob,
                class: classData,
              }
            : s,
        ),
      );
      setEditId(null);
    } catch (error) {
      toast.error(
        `Failed to update student: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => setEditId(null);

  const renderEditableRow = (
    data: typeof emptyStudent,
    onChange: (field: string, value: string) => void,
    onSave: () => void,
    onCancel: () => void,
    key: string | number,
  ) => (
    <TableRow key={key} className="bg-muted/40">
      <TableCell>
        <Input
          placeholder="Roll No"
          value={data.rollNo}
          onChange={(e) => onChange("rollNo", e.target.value)}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          placeholder="Name"
          value={data?.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          placeholder="Email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Select
          value={data.gender}
          onValueChange={(val) => onChange("gender", val)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          placeholder="City"
          value={data.city}
          onChange={(e) => onChange("city", e.target.value)}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          type="date"
          value={data.dob}
          onChange={(e) => onChange("dob", e.target.value)}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Select
          value={data.class?.name}
          onValueChange={(val) => onChange("class", val)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c?.name}>
                {c?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onSave}
            className="h-7 w-7 text-green-600 hover:text-green-700"
            title="Save"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onCancel}
            className="h-7 w-7 text-red-500 hover:text-red-600"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Dashboard title="Students">
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* Search field */}
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvFileChange}
          />
          <Button
            variant="outline"
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>

          <Button
            onClick={handleAddRow}
            disabled={newRow !== null}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Student
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading students...
        </div>
      ) : (
        <Table>
          <TableCaption>
            {filteredStudents.length === 0
              ? `No students found for "${search}".`
              : "A list of students."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Roll No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) =>
              editId === student.id ? (
                renderEditableRow(
                  editData,
                  handleEditChange,
                  handleEditSave,
                  handleCancelEdit,
                  student.id,
                )
              ) : (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.rollNo}
                  </TableCell>
                  <TableCell>{student?.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell>{student.city}</TableCell>
                  <TableCell>{student.dob}</TableCell>
                  <TableCell>{student.class?.name}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(student)}
                      disabled={newRow !== null}
                      className="h-7 w-7 text-blue-500 hover:text-blue-600"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ),
            )}

            {newRow !== null &&
              renderEditableRow(
                newRow,
                handleNewChange,
                handleSave,
                handleCancelNew,
                "new-row",
              )}
          </TableBody>
        </Table>
      )}

      {/* CSV Import Dialog */}
      <Dialog
        open={csvDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseCsvDialog();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Students from CSV</DialogTitle>
            <DialogDescription>
              Expected columns:{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {REQUIRED_CSV_HEADERS.join(", ")}
              </code>
            </DialogDescription>
          </DialogHeader>

          {csvError ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{csvError}</span>
            </div>
          ) : (
            <div className="overflow-auto flex-1 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvRows.map((row, i) => (
                    <TableRow
                      key={i}
                      className={
                        row._status === "success"
                          ? "bg-green-50 dark:bg-green-950/20"
                          : row._status === "error"
                            ? "bg-red-50 dark:bg-red-950/20"
                            : ""
                      }
                    >
                      <TableCell className="text-muted-foreground text-xs">
                        {i + 1}
                      </TableCell>
                      <TableCell>{row.rollNo}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="max-w-35 truncate">
                        {row.email}
                      </TableCell>
                      <TableCell>{row.gender}</TableCell>
                      <TableCell>{row.city}</TableCell>
                      <TableCell>{row.dob}</TableCell>
                      <TableCell>{row.class}</TableCell>
                      <TableCell>
                        {row._status === "pending" && (
                          <span className="text-xs text-muted-foreground">
                            Pending
                          </span>
                        )}
                        {row._status === "success" && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        )}
                        {row._status === "error" && (
                          <span
                            className="flex items-center gap-1 text-xs text-red-600"
                            title={row._error}
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-20">
                              {row._error}
                            </span>
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCloseCsvDialog}
              disabled={isImporting}
            >
              {importDone ? "Close" : "Cancel"}
            </Button>
            {!csvError && !importDone && (
              <Button
                onClick={handleImportCsv}
                disabled={isImporting || csvRows.length === 0}
                className="flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Import {csvRows.length}{" "}
                    student{csvRows.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}
