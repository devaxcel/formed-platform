"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const supabase     = createClient();

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [show,      setShow]      = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [checking,  setChecking]  = useState(true);

  useEffect(() => {
    // Handle the token exchange
    const handleToken = async () => {
      // Get the full URL hash
      const hash = window.location.hash;
      console.log("Hash:", hash);
      
      if (hash && hash.includes('access_token')) {
        // Parse the hash parameters
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type');
        
        console.log("Token type:", type);
        console.log("Access token exists:", !!access_token);
        
        if (access_token && type === 'recovery') {
          // Set the session from the token
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });
          
          if (error) {
            console.error("Session error:", error);
            setError("Invalid or expired link. Please request a new one.");
            setChecking(false);
            return;
          }
          
          console.log("Session set successfully");
          setIsValidToken(true);
        } else {
          setError("Invalid recovery link");
        }
      } else {
        // Check if already has session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsValidToken(true);
        } else {
          setError("No valid session found. Please use the link from your email.");
        }
      }
      
      setChecking(false);
    };
    
    handleToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Get role and redirect correctly
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile }  = await supabase
      .from("users")
      .select("role")
      .eq("id", user?.id)
      .single();

    const role = profile?.role ?? "client";

    if (role === "admin")   router.push("/admin");
    else if (role === "trainer") router.push("/trainer");
    else router.push("/dashboard");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cream border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const field =
    "w-full bg-cream/5 border border-cream/20 text-cream placeholder:text-muted text-sm px-4 py-3 focus:outline-none focus:border-cream/50 transition-colors font-body";

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="font-display text-cream text-2xl font-light mb-2">FORMED</p>
        <p className="text-[10px] tracking-widest uppercase text-muted mb-8 font-body">
          Set Your Password
        </p>

        <h1 className="font-display text-3xl font-light text-cream mb-2">
          Create your password.
        </h1>
        <p className="text-muted text-sm font-body leading-relaxed mb-8">
          Choose a secure password to access your FORMED portal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-xs px-4 py-3 font-body">
              {error}
            </div>
          )}

          {isValidToken && (
            <>
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-muted mb-2 font-body">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    required
                    minLength={8}
                    className={`${field} pr-12`}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-cream transition-colors"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-muted mb-2 font-body">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  className={field}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cream text-ink text-[10px] tracking-widest uppercase font-body font-medium py-4 hover:bg-stone transition-colors disabled:opacity-50"
              >
                {loading ? "Setting password..." : "Set Password & Sign In"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cream border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}