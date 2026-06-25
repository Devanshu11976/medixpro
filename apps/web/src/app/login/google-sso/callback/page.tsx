"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function GoogleSsoCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);

        // Get the session from Supabase after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session || !session.user) {
          throw new Error("No session found after Google authentication");
        }

        // Get the access token from the session
        const { data: { session: currentSession }, error: refreshError } = await supabase.auth.getSession();
        
        if (refreshError) {
          throw refreshError;
        }

        if (!currentSession) {
          throw new Error("Failed to get current session");
        }

        // Extract user info and token
        const email = currentSession.user.email;
        const name = currentSession.user.user_metadata?.full_name || currentSession.user.user_metadata?.name || email?.split('@')[0] || "User";
        const accessToken = currentSession.access_token;

        if (!email) {
          throw new Error("Email not found in session");
        }

        // Send the data back to the parent window
        if (window.opener) {
          // Desktop popup flow
          window.opener.postMessage(
            {
              type: "GOOGLE_SSO_SUCCESS",
              email,
              name,
              token: accessToken
            },
            window.location.origin
          );
          
          // Close the popup after a short delay
          setTimeout(() => {
            window.close();
          }, 500);
        } else {
          // Mobile redirect flow - store data and redirect
          sessionStorage.setItem('google_sso_data', JSON.stringify({
            email,
            name,
            token: accessToken
          }));
          window.location.href = "/login";
        }
      } catch (err: any) {
        setError(err.message || "Google authentication callback failed");
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

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 font-sans antialiased text-gray-800">
      {loading && (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Completing authentication...</p>
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
