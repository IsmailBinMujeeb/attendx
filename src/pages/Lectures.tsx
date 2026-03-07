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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusCircle, Save, X, Pencil, Search, Loader2 } from "lucide-react";
import { supabase } from "@/app/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Class = { id: number; name: string };
type Subject = { id: number; name: string };

type Lecture = {
  id: number;
  created_at: string;
  class: Class;
  subject: Subject;
};

const emptyLecture = {
  id: 0,
  class: { id: 0, name: "" },
  subject: { id: 0, name: "" },
  created_at: new Date().toISOString(),
};

export default function Lectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newRow, setNewRow] = useState<null | typeof emptyLecture>(null);
  const [editId, setEditId] = useState<null | number>(null);
  const [editData, setEditData] = useState<typeof emptyLecture>({
    ...emptyLecture,
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [
          { data: lecturesData, error: lecturesError },
          { data: classesData, error: classesError },
          { data: subjectsData, error: subjectsError },
        ] = await Promise.all([
          supabase
            .from("lectures")
            .select(
              "id, created_at, class:class_id(id, name), subject:subject_id(id, name)",
            )
            .order("created_at", { ascending: true }),
          supabase
            .from("class")
            .select("id, name")
            .order("created_at", { ascending: true }),
          supabase
            .from("subjects")
            .select("id, name")
            .order("created_at", { ascending: true }),
        ]);

        if (lecturesError) throw lecturesError;
        if (classesError) throw classesError;
        if (subjectsError) throw subjectsError;

        setLectures(lecturesData as unknown as Lecture[]);
        setClasses(classesData ?? []);
        setSubjects(subjectsData ?? []);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filteredLectures = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return lectures;
    return lectures.filter((l) =>
      [l.class.name, l.subject.name].some((val) =>
        val.toLowerCase().includes(q),
      ),
    );
  }, [lectures, search]);

  const resolveClass = (name: string): Class =>
    classes.find((c) => c.name === name) ?? { id: 0, name };

  const resolveSubject = (name: string): Subject =>
    subjects.find((s) => s.name === name) ?? { id: 0, name };

  const handleAddRow = () => setNewRow({ ...emptyLecture });

  const handleNewChange = (field: "class" | "subject", value: string) => {
    setNewRow((prev) => ({
      ...prev!,
      [field]: field === "class" ? resolveClass(value) : resolveSubject(value),
    }));
  };

  const handleSave = async () => {
    if (!newRow) return;
    const { class: cls, subject } = newRow;
    if (!cls.id || !subject.id) {
      toast.error("Please select both a class and a subject.");
      return;
    }
    setIsSaving(true);
    try {
      const { data: inserted, error } = await supabase
        .from("lectures")
        .insert({ class_id: cls.id, subject_id: subject.id })
        .select("id, class:class_id(id, name), subject:subject_id(id, name)")
        .single();

      if (error) {
        toast.error(`Failed to add lecture: ${error.message}`);
        return;
      }

      setLectures((prev) => [...prev, inserted as unknown as Lecture]);
      setNewRow(null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNew = () => setNewRow(null);

  const handleEdit = (lecture: Lecture) => {
    setEditId(lecture.id);
    setEditData({
      id: lecture.id,
      class: lecture.class,
      subject: lecture.subject,
      created_at: lecture.created_at,
    });
    setNewRow(null);
  };

  const handleEditChange = (field: "class" | "subject", value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: field === "class" ? resolveClass(value) : resolveSubject(value),
    }));
  };

  const handleEditSave = async () => {
    const { class: cls, subject } = editData;
    if (!cls.id || !subject.id) {
      toast.error("Please select both a class and a subject.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("lectures")
        .update({ class_id: cls.id, subject_id: subject.id })
        .eq("id", editId);

      if (error) {
        toast.error(`Failed to update lecture: ${error.message}`);
        return;
      }

      setLectures((prev) =>
        prev.map((l) =>
          l.id === editId
            ? { id: l.id, class: cls, subject, created_at: l.created_at }
            : l,
        ),
      );
      setEditId(null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => setEditId(null);

  const renderEditableRow = (
    data: typeof emptyLecture,
    onChange: (field: "class" | "subject", value: string) => void,
    onSave: () => void,
    onCancel: () => void,
    key: string | number,
  ) => (
    <TableRow key={key} className="bg-muted/40">
      <TableCell>
        <Select
          value={data.class.name}
          onValueChange={(val) => onChange("class", val)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={data.subject.name}
          onValueChange={(val) => onChange("subject", val)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>{new Date(data.created_at).toLocaleDateString()}</TableCell>
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
              <Loader2 className="animate-spin w-4 h-4" />
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
    <Dashboard title="Lectures">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search lectures..."
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
          Add Lecture
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading lectures...
        </div>
      ) : (
        <Table>
          <TableCaption>
            {filteredLectures.length === 0
              ? search
                ? `No lectures found for "${search}".`
                : "No lectures yet. Add one above."
              : "A list of lectures."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLectures.map((lecture) =>
              editId === lecture.id ? (
                renderEditableRow(
                  editData,
                  handleEditChange,
                  handleEditSave,
                  handleCancelEdit,
                  lecture.id,
                )
              ) : (
                <TableRow
                  key={lecture.id}
                  onClick={() => navigate(`/lectures/${lecture.id}`)}
                >
                  <TableCell>{lecture.class.name}</TableCell>
                  <TableCell>{lecture.subject.name}</TableCell>
                  <TableCell>
                    {new Date(lecture.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(lecture)}
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
