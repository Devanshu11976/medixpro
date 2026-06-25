"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function GoogleSsoPopup() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        setLoading(true);
        
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        }

        // Sign in with Google OAuth
        const { data, error: signInError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/login/google-sso/callback`,
            skipBrowserRedirect: false
          }
        });

        if (signInError) {
          throw signInError;
        }

        // Supabase will handle the redirect automatically
      } catch (err: any) {
        setError(err.message || "Google authentication failed");
        setLoading(false);
        
        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_SSO_ERROR",
              error: err.message
            },
            window.location.origin
          );
          setTimeout(() => window.close(), 2000);
        }
      }
    };

    handleGoogleAuth();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 font-sans antialiased text-gray-800">
      {loading && (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Connecting to Google...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center max-w-sm">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      )}
    </div>
  );
}
