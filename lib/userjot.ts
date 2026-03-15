// UserJot SDK types and utilities

declare global {
  interface Window {
    uj: {
      init: (projectId: string, options?: UserJotOptions) => void;
      identify: (user: UserJotUser) => void;
      open: () => void;
      close: () => void;
      toggle: () => void;
    };
    $ujq: unknown[];
  }
}

interface UserJotOptions {
  widget?: boolean;
  position?: "left" | "right";
  theme?: "light" | "dark" | "auto";
}

interface UserJotUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

/**
 * Identify a user to UserJot for tracking feedback
 */
export function identifyUserJot(user: UserJotUser): void {
  if (typeof window !== "undefined") {
    window.uj?.identify(user);
  }
}

/**
 * Open the UserJot feedback board
 */
export function openUserJot(): void {
  // Open the feedback board directly in a new tab
  window.open("https://brickex.userjot.com", "_blank");
}

/**
 * Close the UserJot feedback widget
 */
export function closeUserJot(): void {
  if (typeof window !== "undefined") {
    window.uj?.close();
  }
}

/**
 * Toggle the UserJot feedback widget
 */
export function toggleUserJot(): void {
  if (typeof window !== "undefined") {
    window.uj?.toggle();
  }
}

export type { UserJotUser, UserJotOptions };
