import { useState, useMemo, useEffect } from "react";
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
import { PlusCircle, Save, X, Pencil, Search, Loader2 } from "lucide-react";
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

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    return students.filter((s) =>
      [s.rollNo, s?.name, s.email, s.gender, s.city, s.dob].some((val) =>
        val.toLowerCase().includes(q),
      ),
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

        console.log(classesData);
        setClasses(classesData);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAddRow = () => {
    setNewRow({ ...emptyStudent });
  };

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
        {
          body: { email, name, dob },
        },
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

        <Button
          onClick={handleAddRow}
          disabled={newRow !== null}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Student
        </Button>
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
    </Dashboard>
  );
}
