import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import Login from "@/pages/Login";
import Students from "@/pages/Students";
import Lectures from "@/pages/Lectures";
import LectureAttendance from "@/pages/LectureAttendance";
import Subjects from "@/pages/Subjects";
import Classes from "@/pages/Classes";
import StudentPortal from "./pages/StudentPortal";
import NotFound from "@/pages/NotFound";

import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return session ? children : <Navigate to="/login" />;
}

function App() {
  useEffect(() => {
    const isDarkMode = localStorage.getItem(`isDarkMode`);

    if (isDarkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, []);

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lectures"
              element={
                <ProtectedRoute>
                  <Lectures />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lectures/:lectureId"
              element={
                <ProtectedRoute>
                  <LectureAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects"
              element={
                <ProtectedRoute>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <Classes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <StudentPortal />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
