import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const user = session.user;

          // Always upsert profile
          const { error } = await supabase.from("profiles").upsert(
            {
              id: user.id, // PK from Supabase
              role: "pending", // default role
              first_name: user.user_metadata?.first_name || null,
              company_name: user.user_metadata?.company_name || null,
            },
            { onConflict: "id" }
          );

          if (error) {
            console.error("Error syncing profile:", error.message);
          } else {
            console.log("Profile synced ✅");
            navigate("/dashboard");
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
}
