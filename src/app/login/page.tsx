"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLoginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      if (result?.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to log in with Google:", err);
      setError(err instanceof Error ? err.message : "Failed to log in with Google");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full max-w-md p-6 space-y-6 bg-gray-500 dark:bg-gray-900 shadow-lg rounded-2xl transition-all">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 text-center">
          Login to your account
        </h2>

        <button
          onClick={handleLoginWithGoogle}
          aria-label="Login with Google"
          type="button"
          className="flex items-center justify-center w-full p-3 space-x-3 border rounded-lg 
                     bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 
                     dark:border-gray-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-6 h-6 fill-current text-gray-700 dark:text-gray-200">
            <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
          </svg>
          <span className="text-lg font-medium text-gray-900 dark:text-gray-200">
            Login with Google
          </span>
        </button>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
