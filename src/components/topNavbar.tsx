"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons/faCircleUser";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true); // Ensures hydration consistency

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserName(user.displayName || "User");
            } else {
                setUserName("Guest");
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUserName("Guest");
            router.push("/login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    if (!isClient) return null; // Prevent SSR mismatch

    return (
        <header className="flex items-center justify-between bg-background text-foreground shadow-md border-b border-gray-300 dark:border-gray-700 px-6 py-3">
            {/* Website Logo or Name */}
            <div className="text-xl font-semibold">MyApp</div>

            {/* User Info & Auth Buttons */}
            <div className="flex items-center gap-4">
                <button
                    className="flex items-center gap-2 font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    onClick={() => router.push("/profile")}
                >
                    <FontAwesomeIcon
                        icon={faCircleUser}
                        className="w-6 h-6 text-purple-700 dark:text-purple-400"
                    />
                    <span className="hidden md:inline">{userName}</span>
                </button>

                {/* Show Login if Guest, Logout if Authenticated */}
                {userName === "Guest" ? (
                    <button
                        onClick={() => router.push("/login")}
                        className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Login
                    </button>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
