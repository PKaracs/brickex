"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  Compass,
  Sparkles,
  ImageIcon,
  CreditCard,
  LogOut,
  Zap,
  MessageCircle,
  Loader2,
  ChevronsLeft,
  ChevronsRight,
  Wrench,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import type { SubscriptionData } from "@/lib/actions/get-user-subscription";
import { SubscriptionModal } from "@/components/modals/subscription-modal";
import {
  openCrisp,
  setupCrispListeners,
  identifyCrispUser,
} from "@/lib/crisp";

interface AppSidebarProps {
  subscription?: SubscriptionData | null;
  children: React.ReactNode;
}

interface SidebarLinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  matchPath?: string;
}

export function AppSidebarLayout({ subscription, children }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [crispUnreadCount, setCrispUnreadCount] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);

  const isOpen = expanded || pinned;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setupCrispListeners((count) => {
      setCrispUnreadCount(count);
    });
  }, []);

  useEffect(() => {
    if (session?.user) {
      identifyCrispUser({
        id: session.user.id,
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        avatar: session.user.image || undefined,
      });
    }
  }, [session?.user]);

  const handleLogout = async () => {
    if (session?.user?.id) {
      sessionStorage.removeItem(`meta_user_data_set_${session.user.id}`);
    }
    await authClient.signOut();
    router.push("/login");
  };

  const isFreeUser = !subscription?.plan || subscription.plan === "free";
  const generationsRemaining = subscription?.creationsRemaining ?? 0;

  const handleGenerationsClick = () => {
    if (isFreeUser) {
      router.push("/pricing");
    } else {
      setSubscriptionModalOpen(true);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const primaryLinks: SidebarLinkItem[] = [
    {
      label: "Renders",
      href: "/dashboard",
      icon: <Sparkles className="h-5 w-5 flex-shrink-0" />,
      matchPath: "/dashboard",
    },
    {
      label: "Video",
      href: "/video",
      icon: <Video className="h-5 w-5 flex-shrink-0" />,
      matchPath: "/video",
    },
    {
      label: "Tools",
      href: "/tools",
      icon: <Wrench className="h-5 w-5 flex-shrink-0" />,
      matchPath: "/tools",
    },
    {
      label: "Explore",
      href: "/explore",
      icon: <Compass className="h-5 w-5 flex-shrink-0" />,
      matchPath: "/explore",
    },
    {
      label: "Gallery",
      href: "/gallery",
      icon: <ImageIcon className="h-5 w-5 flex-shrink-0" />,
      matchPath: "/gallery",
    },
  ];

  const secondaryLinks: SidebarLinkItem[] = [
    {
      label: "Subscription",
      href: "#",
      icon: <CreditCard className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Chat with Founder",
      href: "#",
      icon: <MessageCircle className="h-5 w-5 flex-shrink-0" />,
    },
  ];

  const isActive = (link: SidebarLinkItem) =>
    link.matchPath ? pathname?.includes(link.matchPath) : false;

  return (
    <div
      className={cn(
        "flex h-screen w-full flex-col overflow-hidden bg-neutral-800 md:flex-row"
      )}
    >
      {/* Desktop sidebar */}
      <motion.div
        className="hidden h-full flex-shrink-0 bg-neutral-800 px-3 py-4 md:flex md:flex-col justify-between"
        animate={{ width: isOpen ? 240 : 68 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Top section */}
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-1 mb-1"
          >
            <Image
              src="/brickex-logo.png"
              alt="BrickEx Logo"
              width={26}
              height={26}
              className="flex-shrink-0"
              priority
            />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-base font-bold tracking-tight text-white whitespace-nowrap overflow-hidden"
                >
                  BrickEx
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Generations counter */}
          <button
            onClick={handleGenerationsClick}
            className={cn(
              "flex items-center gap-2 mx-1 mb-3 px-3 py-2 rounded-lg bg-neutral-700/40 hover:bg-neutral-700/70 transition-colors",
              !isOpen && "justify-center px-0"
            )}
          >
            <Zap
              className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0"
              strokeWidth={2.5}
            />
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap"
                >
                  <span
                    className="text-sm font-bold text-amber-400 tracking-tight"
                    style={{
                      textShadow: "0 0 8px rgba(251, 191, 36, 0.3)",
                    }}
                  >
                    {generationsRemaining}
                  </span>
                  <span className="text-xs text-neutral-500">renders left</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Primary navigation */}
          <div className="mt-2 flex flex-col">
            {primaryLinks.map((link, idx) => (
              <NavSidebarLink
                key={idx}
                link={link}
                id={`primary-${idx}`}
                active={isActive(link)}
                isOpen={isOpen}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="my-3 mx-2">
            <div className="h-px w-full bg-neutral-700" />
          </div>

          {/* Secondary navigation */}
          <div className="flex flex-col">
            {secondaryLinks.map((link, idx) => (
              <NavSidebarLink
                key={idx}
                link={link}
                id={`secondary-${idx}`}
                active={false}
                isOpen={isOpen}
                onClick={() => {
                  if (link.label === "Subscription") {
                    handleGenerationsClick();
                  } else if (link.label === "Chat with Founder") {
                    openCrisp();
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom: user + pin toggle */}
        <div>
          {/* Pin/unpin button */}
          <AnimatePresence>
            {isOpen && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setPinned((p) => !p)}
                className="flex items-center gap-2 w-full px-4 py-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors rounded-lg hover:bg-neutral-700/40 mb-2"
              >
                {pinned ? (
                  <ChevronsLeft className="h-3.5 w-3.5" />
                ) : (
                  <ChevronsRight className="h-3.5 w-3.5" />
                )}
                <span>{pinned ? "Collapse sidebar" : "Pin sidebar open"}</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* User */}
          <div className="border-t border-neutral-700 pt-2">
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2",
                !isOpen && "justify-center px-0"
              )}
            >
              <Avatar className="h-7 w-7 border border-neutral-600 flex-shrink-0">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-neutral-700 text-[10px] flex items-center justify-center text-neutral-200">
                  {!hasMounted || isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
                  ) : (
                    getInitials(session?.user?.name)
                  )}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-w-0 overflow-hidden"
                  >
                    <p className="text-sm font-medium text-neutral-200 truncate">
                      {hasMounted && !isPending
                        ? session?.user?.name || "User"
                        : "..."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.button
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700/40 rounded-lg transition-colors overflow-hidden"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Log out</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Mobile top bar + sidebar */}
      <MobileSidebar
        primaryLinks={primaryLinks}
        secondaryLinks={secondaryLinks}
        session={session}
        isPending={isPending}
        hasMounted={hasMounted}
        crispUnreadCount={crispUnreadCount}
        onLogout={handleLogout}
        onSubscriptionClick={handleGenerationsClick}
        generationsRemaining={generationsRemaining}
        getInitials={getInitials}
        isActive={isActive}
      />

      {/* Main content area: rounded panel like the Aceternity design */}
      <div className="m-1.5 mt-[60px] md:mt-1.5 flex flex-1 min-w-0 overflow-hidden">
        <div className="relative h-full w-full flex-1 rounded-xl border border-neutral-700 bg-neutral-900 overflow-hidden">
          {children}
        </div>
      </div>

      <SubscriptionModal
        open={subscriptionModalOpen}
        onOpenChange={setSubscriptionModalOpen}
        subscription={subscription ?? null}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Mobile Sidebar
   ──────────────────────────────────────────────────────────── */

function MobileSidebar({
  primaryLinks,
  secondaryLinks,
  session,
  isPending,
  hasMounted,
  crispUnreadCount,
  onLogout,
  onSubscriptionClick,
  generationsRemaining,
  getInitials,
  isActive,
}: {
  primaryLinks: SidebarLinkItem[];
  secondaryLinks: SidebarLinkItem[];
  session: any;
  isPending: boolean;
  hasMounted: boolean;
  crispUnreadCount: number;
  onLogout: () => void;
  onSubscriptionClick: () => void;
  generationsRemaining: number;
  getInitials: (name: string | null | undefined) => string;
  isActive: (link: SidebarLinkItem) => boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex h-[52px] w-full items-center justify-between bg-neutral-800 px-4 md:hidden fixed top-0 left-0 right-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/brickex-logo.png"
            alt="BrickEx Logo"
            width={22}
            height={22}
            priority
          />
          <span className="text-sm font-bold tracking-tight text-white">
            BrickEx
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={onSubscriptionClick}
            className="flex items-center gap-1"
          >
            <Zap
              className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
              strokeWidth={2.5}
            />
            <span className="text-xs font-bold text-amber-400">
              {generationsRemaining}
            </span>
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <IconMenu2 className="w-5 h-5 text-neutral-200" />
          </button>
        </div>
      </div>

      {/* Mobile slide-in overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-neutral-800 p-6"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Image
                    src="/brickex-logo.png"
                    alt="BrickEx Logo"
                    width={28}
                    height={28}
                    priority
                  />
                  <span className="text-lg font-bold tracking-tight text-white">
                    BrickEx
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <IconX className="w-5 h-5 text-neutral-200" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {primaryLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors",
                      isActive(link)
                        ? "bg-neutral-700 text-white"
                        : "text-neutral-400 hover:bg-neutral-700/50 hover:text-white"
                    )}
                  >
                    {link.icon}
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="h-px bg-neutral-700 my-4" />

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    onSubscriptionClick();
                  }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors text-neutral-400 hover:bg-neutral-700/50 hover:text-white"
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Subscription</span>
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => openCrisp(), 300);
                  }}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors text-neutral-400 hover:bg-neutral-700/50 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">Chat with Founder</span>
                  </div>
                  {crispUnreadCount > 0 && (
                    <span className="relative flex h-2 w-2 ml-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-neutral-700 pt-4">
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="h-9 w-9 border border-neutral-600">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-neutral-700 text-xs flex items-center justify-center text-neutral-200">
                    {!hasMounted || isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                    ) : (
                      getInitials(session?.user?.name)
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-200 truncate">
                    {hasMounted && !isPending
                      ? session?.user?.name || "User"
                      : "..."}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {hasMounted && !isPending ? session?.user?.email : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700/40 rounded-lg transition-colors mt-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Nav Link with hover animation
   ──────────────────────────────────────────────────────────── */

function NavSidebarLink({
  link,
  id,
  active,
  isOpen,
  onClick,
}: {
  link: SidebarLinkItem;
  id: string;
  active?: boolean;
  isOpen: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const content = (
    <>
      {hovered === id && (
        <motion.div
          layoutId="hovered-sidebar-link"
          className="absolute inset-0 z-10 rounded-lg bg-neutral-900"
        />
      )}
      <div
        className={cn(
          "relative z-20 flex items-center gap-3 py-2",
          !isOpen && "justify-center gap-0",
          active ? "text-neutral-200" : "text-neutral-400"
        )}
      >
        {link.icon}
        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden transition-transform duration-150 group-hover/sidebar:translate-x-1"
            >
              {link.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  const sharedClass = cn(
    "group/sidebar relative px-3 py-0.5 rounded-lg",
    !isOpen && "flex justify-center"
  );

  if (onClick || link.href === "#") {
    return (
      <button
        className={cn(sharedClass, "text-left w-full")}
        onMouseEnter={() => setHovered(id)}
        onMouseLeave={() => setHovered(null)}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={link.href}
      className={sharedClass}
      onMouseEnter={() => setHovered(id)}
      onMouseLeave={() => setHovered(null)}
    >
      {content}
    </Link>
  );
}
