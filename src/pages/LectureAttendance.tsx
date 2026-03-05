import { supabase } from "@/app/supabase";
import Dashboard from "@/components/dashboard";
import CardStats from "@/components/stat-cards";
import { Dice5, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  QRCode,
  QRCodeCanvas,
  QRCodeOverlay,
  QRCodeSkeleton,
} from "@/components/ui/qr-code";

type Student = {
  id: string;
  rollNo: string;
  name: string;
  attendance: { is_present: boolean }[];
};

export default function LectureAttendance() {
  const { lectureId } = useParams();
  const [subjects, setSubjects] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [classes, setClasses] = useState<{
    id: string;
    name: string;
    students: Student[];
  } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("lectures")
          .select(
            `id, subject_id, created_at,
             subjects (id, name),
             class_id,
             class (id, name,
               students (id, rollNo, name,
                 attendance (is_present, lecture_id)
               )
             )`,
          )
          .eq("id", lectureId)
          .single()
          .returns<{
            id: string;
            created_at: string;
            subjects: { id: string; name: string };
            class_id: string;
            class: {
              id: string;
              name: string;
              students: {
                id: string;
                rollNo: string;
                name: string;
                attendance: { is_present: boolean; lecture_id: string }[];
              }[];
            };
          }>();

        if (error) {
          console.error(error);
          alert(error.message);
          return;
        }

        setSubjects(data.subjects);
        setClasses(data.class);

        const studentsWithFilteredAttendance = data.class.students.map((s) => ({
          ...s,
          attendance: s.attendance.filter(
            (a) => a.lecture_id.toString() === lectureId?.toString(),
          ),
        }));

        setStudents(studentsWithFilteredAttendance);
        setCreatedAt(data.created_at);
      } catch (error) {
        console.error(error);
        alert((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [lectureId]);

  const handleCheck = async (
    studentId: string,
    isPresent: boolean | "indeterminate",
  ) => {
    if (isPresent === "indeterminate") return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, attendance: [{ is_present: isPresent }] }
          : s,
      ),
    );

    const { error } = await supabase.from("attendance").upsert(
      {
        lecture_id: lectureId,
        student_id: studentId,
        class_id: classes?.id,
        subject_id: subjects?.id,
        is_present: isPresent,
      },

      { onConflict: "lecture_id,student_id" },
    );

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }
  };

  return (
    <Dashboard title="Attendance">
      <div className="flex flex-col items-center justify-center mb-4 gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading Lecture...
          </div>
        ) : (
          <>
            <CardStats
              data={[
                { name: "Class", stat: classes?.name || "N/A" },
                { name: "Subject", stat: subjects?.name || "N/A" },
                {
                  name: "Date",
                  stat: new Date(createdAt || "").toLocaleDateString() || "N/A",
                },
                {
                  name: "Students",
                  stat: students.length.toString() || "N/A",
                },
              ]}
            />
            <div className="w-full my-4 px-12 flex gap-16">
              <Table>
                <TableCaption>Attendance for this lecture.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-25">Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-25">Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow
                      key={s.rollNo}
                      className="cursor-pointer"
                      onClick={() =>
                        handleCheck(s.id, !s.attendance?.[0]?.is_present)
                      }
                    >
                      <TableCell>{s.rollNo}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell
                        className="font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={s.attendance?.[0]?.is_present ?? false}
                          onCheckedChange={(checked) =>
                            handleCheck(s.id, checked)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-col items-center gap-2">
                <QRCode
                  value={JSON.stringify({ lectureId })}
                  size={200}
                  level="H"
                  className="gap-4"
                >
                  <QRCodeSkeleton />
                  <QRCodeCanvas />
                  <QRCodeOverlay className="rounded-full border-2 border-white p-2">
                    <Dice5 className="size-6" />
                  </QRCodeOverlay>
                </QRCode>
                <p className="text-center text-muted-foreground text-sm">
                  Scan to attend
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </Dashboard>
  );
}
