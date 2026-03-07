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
import { Save, X, Pencil, Search, Loader2 } from "lucide-react";
import { supabase } from "@/app/supabase";
import { toast } from "sonner";

type Subject = {
  id: number;
  name: string;
  class: { id: number; name: string };
};

const initialSubjects: Subject[] = [
  {
    id: 1,
    name: "Math",
    class: { id: 2, name: "BCS FY" },
  },
];

const makeEmptySubject = () => ({
  name: "",
  class: { id: 0, name: "" },
});

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [newRow, setNewRow] = useState<null | ReturnType<
    typeof makeEmptySubject
  >>(null);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<null | number>(null);
  const [editData, setEditData] = useState(makeEmptySubject());
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredSubjects = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return subjects;
    return subjects.filter((s) =>
      [s.name, s.class.name].some((val) => val.toLowerCase().includes(q)),
    );
  }, [subjects, search]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, class_id, class ( id, name )")
        .order("created_at", { ascending: true })
        .returns<Subject[]>();

      if (error) {
        toast.error("Error fetching subjects: " + error);
      } else {
        console.log(data);
        const subjects = data.map((d) => ({
          id: d.id,
          name: d.name,
          class: d.class,
        }));
        setSubjects(subjects);
      }
      setLoading(false);
    })();
  }, []);

  const handleEdit = (subject: Subject) => {
    setEditId(subject.id);
    setEditData({
      name: subject.name,
      class: subject.class,
    });
    setNewRow(null);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    const { name, class: classData } = editData;
    if (!name.trim() || !classData.name.trim()) {
      toast.error("Please fill in all fields before saving.");
      return;
    }

    setIsSaving(true);
    try {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === editId ? { id: s.id, name, class: classData } : s,
        ),
      );

      await supabase.from("subjects").update({ name }).eq("id", editId);
      setEditId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save subject. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => setEditId(null);

  const renderEditableRow = (
    data: ReturnType<typeof makeEmptySubject>,
    onChange: (field: string, value: string) => void,
    onSave: () => void,
    onCancel: () => void,
    key: string | number,
  ) => (
    <TableRow key={key} className="bg-muted/40">
      <TableCell>
        <Input
          placeholder="Subject name"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          placeholder="Subject name"
          value={data.class.name}
          onChange={(e) => onChange("class_name", e.target.value)}
          className="h-8"
          readOnly
        />
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
    <Dashboard title="Subjects">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search subjects..."
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading subjects...
        </div>
      ) : (
        <Table>
          <TableCaption>
            {filteredSubjects.length === 0
              ? `No subjects found for "${search}".`
              : "A list of subjects."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Subject Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubjects.map((subject) =>
              editId === subject.id ? (
                renderEditableRow(
                  editData,
                  handleEditChange,
                  handleEditSave,
                  handleCancelEdit,
                  subject.id,
                )
              ) : (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.class?.name}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(subject)}
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
          </TableBody>
        </Table>
      )}
    </Dashboard>
  );
}
