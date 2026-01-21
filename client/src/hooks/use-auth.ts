import { useUser, useClerk } from "@clerk/clerk-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { useEffect } from "react";

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useAuth() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();

  // Fetch our database user info with aggressive caching
  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes - longer for user data
    gcTime: 15 * 60 * 1000, // 15 minutes in cache
    enabled: !!clerkUser, // Only fetch if Clerk user exists
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Prefetch content data when user is authenticated
  useEffect(() => {
    if (user && clerkUser) {
      // Prefetch content list for instant loading
      queryClient.prefetchQuery({
        queryKey: ["/api/content"],
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    }
  }, [user, clerkUser, queryClient]);

  const isLoading = !clerkLoaded || (clerkUser && userLoading);

  const logout = async () => {
    // Clear all cached data on logout
    queryClient.clear();
    await signOut();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!clerkUser,
    logout,
    isLoggingOut: false,
  };
}
