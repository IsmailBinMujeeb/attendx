import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase";
import Dashboard from "@/components/dashboard";
import {
  Loader2,
  GraduationCap,
  MapPin,
  Mail,
  Calendar,
  Hash,
  User,
} from "lucide-react";

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

const avatarGradients = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500",
];

function getAvatarGradient(name: string) {
  return avatarGradients[name.charCodeAt(0) % avatarGradients.length];
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
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <Dashboard title="My Portal">
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading your profile...
        </div>
      </Dashboard>
    );
  }

  if (!student) {
    return (
      <Dashboard title="My Portal">
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          Student profile not found.
        </div>
      </Dashboard>
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
    // <Dashboard title="My Portal">
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-5 items-start">
      {/* ── Profile Card ── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Hero banner */}
        <div className="relative h-32 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(139,92,246,0.3),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(6,182,212,0.2),transparent_60%)]" />
          <div className="absolute -bottom-px left-0 right-0 h-8 bg-card [clip-path:ellipse(55%_100%_at_50%_100%)]" />
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          {/* Avatar */}
          <div className="mb-4 inline-block p-0.75 rounded-full bg-linear-to-br from-violet-500 to-cyan-500">
            <div className="p-0.75 rounded-full bg-card">
              <div
                className={`w-20 h-20 rounded-full bg-linear-to-br ${getAvatarGradient(student.name)} flex items-center justify-center text-2xl font-bold text-white`}
              >
                {getInitials(student.name)}
              </div>
            </div>
          </div>

          {/* Name */}
          <h1 className="text-xl font-bold tracking-tight text-foreground mb-2 leading-tight">
            {student.name}
          </h1>

          {/* Class badge */}
          {student.class && (
            <div className="inline-flex items-center gap-1.5 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 rounded-full px-3 py-1 text-xs font-medium mb-5">
              <GraduationCap className="w-3.5 h-3.5" />
              {student.class.name}
            </div>
          )}

          {/* Detail grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {detailItems.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted border border-border"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink">
                  <Icon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
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
        </div>
      </div>

      {/* ── Subjects ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Subjects
          </h2>
          {student.class?.subjects?.length > 0 && (
            <span className="bg-violet-100 dark:bg-violet-900/40 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 rounded-full px-2.5 py-0.5 text-xs font-semibold">
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
                className="group flex flex-col items-center gap-2.5 p-5 rounded-2xl bg-card border border-border hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-200 cursor-default"
              >
                <div className="w-12 h-12 flex items-center justify-center text-2xl rounded-xl bg-linear-to-br from-violet-50 to-cyan-50 dark:from-violet-950/50 dark:to-cyan-950/50 border border-violet-100 dark:border-violet-900 group-hover:scale-110 transition-transform duration-200">
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
    // </Dashboard>
  );
}
