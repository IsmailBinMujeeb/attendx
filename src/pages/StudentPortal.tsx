import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase";
// import Dashboard from "@/components/dashboard";
import {
  Loader2,
  GraduationCap,
  MapPin,
  Mail,
  Calendar,
  Hash,
  User,
} from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/page-layouts/components/app-sidebar";
import { AppHeader } from "@/components/page-layouts/components/app-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import QRScanner from "@/components/QR-Scanner";
import { toast } from "sonner";

type Subject = { id: number; name: string };
type StudentData = {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  gender: string;
  dob: string;
  city: string;
  class: {
    id: number;
    name: string;
    subjects: Subject[];
  };
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const subjectIcons = [
  "📐",
  "🔬",
  "📖",
  "💻",
  "🌍",
  "🎨",
  "⚗️",
  "📊",
  "🏛️",
  "🎭",
];

export default function StudentPortal() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("students")
          .select(
            "id, rollNo, name, email, gender, dob, city, class:class_id(id, name, subjects(id, name))",
          )
          .eq("user_id", user.id)
          .single()
          .returns<StudentData>();

        if (error) throw error;
        setStudent(data);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAttendance = async (decodedText: string) => {
    try {
      const { lectureId, classId, subjectId } = JSON.parse(decodedText);

      if (!student) return;

      if (String(classId) !== student.class.id.toString())
        return toast.error("This QR code is not for your class.");

      const { error } = await supabase.from("attendance").upsert(
        {
          lecture_id: lectureId,
          class_id: classId,
          subject_id: subjectId,
          student_id: student.id,
          is_present: true,
        },
        { onConflict: "lecture_id,student_id" },
      );

      if (error) {
        throw error;
      }

      toast.success("Attendance marked successfully!");
    } catch (error) {
      toast.error("Failed to mark attendance. Please try again.");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      // <Dashboard title="My Portal">
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading your profile...
      </div>
      // </Dashboard>
    );
  }

  if (!student) {
    return (
      // <Dashboard title="My Portal">
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Student profile not found.
      </div>
      // </Dashboard>
    );
  }

  const formattedDob = new Date(student.dob).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const detailItems = [
    { icon: Hash, label: "Roll No", value: student.rollNo },
    { icon: Mail, label: "Email", value: student.email },
    { icon: User, label: "Gender", value: student.gender },
    { icon: Calendar, label: "Date of Birth", value: formattedDob },
    { icon: MapPin, label: "City", value: student.city },
    { icon: GraduationCap, label: "Class", value: student.class?.name ?? "—" },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted/50">
        <AppHeader />
        <div className="bg-background flex sm:flex-row flex-col min-h-screen flex-1 rounded-xl md:min-h-min mx-2 mb-2">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden w-full">
            <div className="relative h-32 bg-linear-to-br from-violet-600 via-violet-400 to-violet-600">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(139,92,246,0.3),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(6,182,212,0.2),transparent_60%)]" />
              <div className="absolute -bottom-px left-0 right-0 h-8 bg-card [clip-path:ellipse(55%_100%_at_50%_100%)]" />
            </div>

            <div className="px-6 pb-6 -mt-12 relative">
              <Avatar className="size-20 mb-4">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${student.name}&scale=100`}
                />
                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
              </Avatar>

              <h1 className="text-xl font-bold tracking-tight text-foreground mb-2 leading-tight">
                {student.name}
                <QRScanner onScan={(data) => handleAttendance(data)} />
              </h1>

              {student.class && (
                <div className="ml-2 inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full px-3 py-1 text-xs font-medium mb-5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {student.class.name}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {detailItems.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted border border-border"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900/40 flex items-center justify-center shrink">
                      <Icon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                        {label}
                      </p>
                      <p className="text-xs font-medium text-foreground truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="m-4">
                <div className="flex items-center gap-2.5 mb-4">
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    Subjects
                  </h2>
                  {student.class?.subjects?.length > 0 && (
                    <span className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {student.class.subjects.length}
                    </span>
                  )}
                </div>

                {!student.class?.subjects?.length ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground bg-muted rounded-2xl border border-dashed">
                    No subjects found for your class.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {student.class.subjects.map((subject, i) => (
                      <div
                        key={subject.id}
                        className="group flex flex-col items-center gap-2.5 p-5 rounded-2xl bg-card border border-border hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-default"
                      >
                        <div className="w-12 h-12 flex items-center justify-center text-2xl rounded-xl border border-zinc-100 dark:border-zinc-900 group-hover:scale-110 transition-transform duration-200">
                          {subjectIcons[i % subjectIcons.length]}
                        </div>
                        <span className="text-xs font-medium text-foreground text-center leading-snug">
                          {subject.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Subjects ── */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
