export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Redirect to login with a toast notification
// Note: With Clerk, authentication is handled by ClerkProvider
// Users will be automatically redirected to sign in when needed
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Unauthorized",
      description: "Please sign in to continue.",
      variant: "destructive",
    });
  }
  // Clerk handles authentication redirects automatically
  window.location.href = "/";
}
