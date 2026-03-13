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
import { PlusCircle, Save, X, Pencil, Search, Loader2 } from "lucide-react";
import { supabase } from "@/app/supabase";
import { toast } from "sonner";

type ClassType = {
  id: number;
  name: string;
  subjects: string[];
};

type RawClass = {
  id: number;
  name: string;
  subjects: { id: number; name: string }[];
};

const makeEmptyClass = () => ({ name: "", subjects: "" });

export default function Classes() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRow, setNewRow] = useState<null | {
    name: string;
    subjects: string;
  }>(null);
  const [editId, setEditId] = useState<null | number>(null);
  const [editData, setEditData] = useState(makeEmptyClass());
  const [search, setSearch] = useState("");

  // Fetch all classes with their subjects
  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("class")
      .select("id, name, subjects(id, name)")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Error fetching classes: " + error.message);
    } else {
      setClasses(
        (data as RawClass[]).map((c) => ({
          id: c.id,
          name: c.name,
          subjects: c.subjects.map((s) => s.name),
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return classes;
    return classes.filter((c) =>
      [c.name, ...c.subjects].some((val) => val.toLowerCase().includes(q)),
    );
  }, [classes, search]);

  const subjectsToString = (subjects: string[]) => `${subjects.join(", ")}`;
  const stringToSubjects = (val: string) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

  const isValid = (data: { name: string; subjects: string }) =>
    data.name.trim() !== "" && data.subjects.trim() !== "";

  const handleAddRow = () => setNewRow(makeEmptyClass());

  const handleNewChange = (field: string, value: string) => {
    setNewRow((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  // Insert new class + subjects
  const handleSave = async () => {
    if (!newRow) return;
    if (!isValid(newRow)) {
      toast.info("Please fill in all fields before saving.");
      return;
    }
    setSaving(true);
    try {
      // Insert class
      const { data: classData, error: classError } = await supabase
        .from("class")
        .insert({ name: newRow.name.trim() })
        .select()
        .single();

      if (classError || !classData) throw classError;

      // Insert subjects
      const subjectRows = stringToSubjects(newRow.subjects).map((name) => ({
        name,
        class_id: classData.id,
      }));
      const { error: subjectsError } = await supabase
        .from("subjects")
        .insert(subjectRows);

      if (subjectsError) throw subjectsError;

      setNewRow(null);
      await fetchClasses();
    } catch (err) {
      console.error("Error saving class:", err);
      toast.error("Failed to save class. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelNew = () => setNewRow(null);

  const handleEdit = (cls: ClassType) => {
    setEditId(cls.id);
    setEditData({
      name: cls.name,
      subjects: cls.subjects.join(", "),
    });
    setNewRow(null);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update class name + replace all subjects
  const handleEditSave = async () => {
    if (!isValid(editData) || editId === null) {
      toast.error("Please fill in all fields before saving.");
      return;
    }
    setSaving(true);
    try {
      // Update class name
      const { error: classError } = await supabase
        .from("class")
        .update({ name: editData.name.trim() })
        .eq("id", editId);

      if (classError) throw classError;

      // Delete existing subjects and re-insert
      const { error: deleteError } = await supabase
        .from("subjects")
        .delete()
        .eq("class_id", editId);

      if (deleteError) throw deleteError;

      const subjectRows = stringToSubjects(editData.subjects).map((name) => ({
        name,
        class_id: editId,
      }));
      const { error: subjectsError } = await supabase
        .from("subjects")
        .insert(subjectRows);

      if (subjectsError) throw subjectsError;

      setEditId(null);
      await fetchClasses();
    } catch (err) {
      console.error("Error updating class:", err);
      toast.error("Failed to update class. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => setEditId(null);

  // Delete class (subjects cascade via FK)
  // const handleDelete = async (id: number) => {
  //   if (!confirm("Are you sure you want to delete this class?")) return;
  //   setSaving(true);
  //   try {
  //     const { error } = await supabase.from("class").delete().eq("id", id);
  //     if (error) throw error;
  //     await fetchClasses();
  //   } catch (err) {
  //     console.error("Error deleting class:", err);
  //     toast.error("Failed to delete class. Please try again.");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const renderEditableRow = (
    data: ReturnType<typeof makeEmptyClass>,
    onChange: (field: string, value: string) => void,
    onSave: () => void,
    onCancel: () => void,
    key: string | number,
  ) => (
    <TableRow key={key} className="bg-muted/40">
      <TableCell>
        <Input
          placeholder="Class name"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          placeholder="Subjects (comma-separated)"
          value={data.subjects}
          onChange={(e) => onChange("subjects", e.target.value)}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onSave}
            disabled={saving}
            className="h-7 w-7 text-green-600 hover:text-green-700"
            title="Save"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
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
    <Dashboard title="Classes">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search classes..."
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
          disabled={newRow !== null || loading}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Class
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading classes...
        </div>
      ) : (
        <Table>
          <TableCaption>
            {filteredClasses.length === 0 && search
              ? `No classes found for "${search}".`
              : filteredClasses.length === 0
                ? "No classes yet. Add one to get started."
                : "A list of classes."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.map((cls) =>
              editId === cls.id ? (
                renderEditableRow(
                  editData,
                  handleEditChange,
                  handleEditSave,
                  handleCancelEdit,
                  cls.id,
                )
              ) : (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{subjectsToString(cls.subjects)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(cls)}
                        disabled={newRow !== null || saving}
                        className="h-7 w-7 text-blue-500 hover:text-blue-600"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {/*<Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(cls.id)}
                        disabled={newRow !== null || saving}
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>*/}
                    </div>
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
