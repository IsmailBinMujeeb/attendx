import { supabase } from "@/app/supabase";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export function Logout() {
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const logout = async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoggingOut(false);
      }
    };
    logout();
  }, []);

  if (isLoggingOut) {
    return <div>Logging out...</div>;
  }

  return (
    <div>
      <Navigate to="/" />
    </div>
  );
}
