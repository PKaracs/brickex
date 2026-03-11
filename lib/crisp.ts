// Crisp Chat SDK types and utilities

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

/**
 * Open the Crisp chat widget
 */
export function openCrisp(): void {
  if (typeof window === "undefined") return;

  // Initialize $crisp array if it doesn't exist
  if (!window.$crisp) {
    window.$crisp = [];
  }

  // Show the widget first, then open the chat
  window.$crisp.push(["do", "chat:show"]);
  window.$crisp.push(["do", "chat:open"]);
}

/**
 * Close the Crisp chat widget
 */
export function closeCrisp(): void {
  if (typeof window !== "undefined" && window.$crisp) {
    window.$crisp.push(["do", "chat:close"]);
  }
}

/**
 * Show the Crisp chat widget
 */
export function showCrisp(): void {
  if (typeof window !== "undefined" && window.$crisp) {
    window.$crisp.push(["do", "chat:show"]);
  }
}

/**
 * Hide the Crisp chat widget
 */
export function hideCrisp(): void {
  if (typeof window !== "undefined" && window.$crisp) {
    window.$crisp.push(["do", "chat:hide"]);
  }
}

/**
 * Identify user in Crisp chat
 * This sets the user's email, name, and avatar so you can identify them in the Crisp dashboard
 */
export function identifyCrispUser(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar?: string | null;
}): void {
  if (typeof window === "undefined") return;

  // Initialize $crisp array if it doesn't exist
  if (!window.$crisp) {
    window.$crisp = [];
  }

  // Wait for Crisp to be ready, then set user data
  window.$crisp.push([
    "on",
    "session:loaded",
    function () {
      console.log("[Crisp] Identifying user:", user.email || user.name || user.id);

      // Set user email (required for identification)
      if (user.email) {
        window.$crisp.push(["set", "user:email", user.email]);
      }

      // Set user nickname/name
      if (user.name) {
        window.$crisp.push(["set", "user:nickname", user.name]);
      }

      // Set user avatar
      if (user.avatar) {
        window.$crisp.push(["set", "user:avatar", user.avatar]);
      }

      // Set custom session data with user ID
      window.$crisp.push([
        "set",
        "session:data",
        {
          user_id: user.id,
        },
      ]);

      console.log("[Crisp] ✅ User identified successfully");
    },
  ]);

  // Also try to set immediately if Crisp is already loaded
  if (user.email) {
    window.$crisp.push(["set", "user:email", user.email]);
  }
  if (user.name) {
    window.$crisp.push(["set", "user:nickname", user.name]);
  }
  if (user.avatar) {
    window.$crisp.push(["set", "user:avatar", user.avatar]);
  }
  window.$crisp.push([
    "set",
    "session:data",
    {
      user_id: user.id,
    },
  ]);
}

/**
 * Setup Crisp event listeners
 */
export function setupCrispListeners(
  onUnreadChange?: (count: number) => void
): void {
  if (typeof window === "undefined") return;

  if (!window.$crisp) {
    window.$crisp = [];
  }

  if (!onUnreadChange) return;

  console.log("[Crisp] Setting up event listeners...");

  // Wait for Crisp to be fully ready
  window.$crisp.push([
    "on",
    "session:loaded",
    function () {
      console.log("[Crisp] Session loaded, attaching event listeners");

      // DEBUG: Log ALL Crisp events
      const debugEvents = [
        "message:received",
        "message:sent",
        "message:compose:received",
        "chat:opened",
        "chat:closed",
      ];
      debugEvents.forEach((eventName) => {
        window.$crisp.push([
          "on",
          eventName,
          function (data: any) {
            console.log(`[Crisp DEBUG] Event "${eventName}" fired:`, data);
          },
        ]);
      });

      // Listen for message received from operator
      window.$crisp.push([
        "on",
        "message:received",
        function (message: any) {
          console.log("[Crisp] ✉️✉️✉️ MESSAGE RECEIVED EVENT FIRED! ✉️✉️✉️");
          console.log("[Crisp] Message data:", message);
          
          // Show badge immediately when message is received
          // It will be cleared when user opens the chat
          console.log("[Crisp] 🔴🔴🔴 SHOWING NOTIFICATION BADGE! 🔴🔴🔴");
          onUnreadChange(1);
        },
      ]);

      // Clear badge when chat is opened
      window.$crisp.push([
        "on",
        "chat:opened",
        function () {
          console.log("[Crisp] Chat opened, clearing badge");
          onUnreadChange(0);
        },
      ]);

      // Hide widget when chat is closed
      window.$crisp.push([
        "on",
        "chat:closed",
        function () {
          console.log("[Crisp] Chat closed, hiding widget");
          window.$crisp.push(["do", "chat:hide"]);
        },
      ]);

      console.log("[Crisp] ✅ All event listeners attached successfully");
    },
  ]);
}

