"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  LogOut,
  ChevronDown,
  Loader2,
  Menu,
  Sparkles,
  ImageIcon,
  HelpCircle,
  MessageCircle,
  Compass,
  BrickWall,
  Wrench,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { SubscriptionModal } from "@/components/modals/subscription-modal";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SubscriptionData } from "@/lib/actions/get-user-subscription";
import { openUserJot } from "@/lib/userjot";
import { openCrisp, setupCrispListeners, identifyCrispUser } from "@/lib/crisp";

interface NavbarProps {
  projectId?: string;
  subscription?: SubscriptionData | null;
}

export function Navbar({ projectId, subscription }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [crispUnreadCount, setCrispUnreadCount] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  return (
    <nav className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-black">
      {/* Left - Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity touch-manipulation"
        >
          <Image
            src="/brickex-logo.png"
            alt="BrickEx Logo"
            width={32}
            height={32}
            className="w-7 h-7 sm:w-8 sm:h-8"
            priority
          />
          <span className="text-lg sm:text-xl font-bold tracking-tight">
            BrickEx
          </span>
        </Link>
      </div>

      {/* Center - Navigation Links (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/explore"
          className={`text-sm font-medium transition-colors ${
            pathname?.includes("/explore")
              ? "text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Explore
        </Link>
        <Separator orientation="vertical" className="h-4 bg-neutral-700" />
        <Link
          href="/dashboard"
          className={`text-sm font-medium transition-colors ${
            pathname?.includes("/dashboard")
              ? "text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Create
        </Link>
        <Separator orientation="vertical" className="h-4 bg-neutral-700" />
        <Link
          href="/tools"
          className={`text-sm font-medium transition-colors ${
            pathname?.includes("/tools")
              ? "text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Tools
        </Link>
        <Separator orientation="vertical" className="h-4 bg-neutral-700" />
        <Link
          href="/gallery"
          className={`text-sm font-medium transition-colors ${
            pathname?.includes("/gallery")
              ? "text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Gallery
        </Link>
      </div>

      {/* Right - Generations + User Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
        >
          <Menu className="w-5 h-5 text-neutral-300" />
        </button>

        {/* Bricks Remaining */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleGenerationsClick}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800/60 border border-neutral-700/40 select-none transition-all hover:bg-neutral-800 active:scale-95"
              >
                <BrickWall
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60"
                  strokeWidth={2}
                />
                <span className="text-[13px] sm:text-sm font-semibold text-white tabular-nums">
                  {generationsRemaining.toLocaleString()}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-neutral-900 border-neutral-700 text-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.3)] px-3 py-2"
            >
              <p className="text-xs text-neutral-400">Bricks Remaining</p>
              <p className="text-sm font-medium">
                {isFreeUser
                  ? "Upgrade to get more"
                  : `${generationsRemaining.toLocaleString()} bricks left`}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 sm:gap-2 outline-none hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px] justify-center">
              <Avatar className="h-8 w-8 border border-neutral-700">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-neutral-800 text-xs flex items-center justify-center">
                  {!hasMounted || isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                  ) : (
                    getInitials(session?.user?.name)
                  )}
                </AvatarFallback>
              </Avatar>
              {hasMounted && !isPending && (
                <>
                  <span className="hidden sm:block text-sm font-medium text-neutral-200 max-w-[120px] truncate">
                    {session?.user?.name || "User"}
                  </span>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-neutral-400" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-neutral-900 border-neutral-800"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-white">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem
              className="cursor-pointer text-neutral-300 focus:text-white focus:bg-neutral-800"
              onClick={handleGenerationsClick}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Subscription</span>
              <span className="ml-auto text-xs text-emerald-400">
                {subscription?.plan && subscription.plan !== "free"
                  ? `${subscription.plan.charAt(0).toUpperCase()}${subscription.plan.slice(1)} Plan`
                  : "Free Plan"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-neutral-300 focus:text-white focus:bg-neutral-800"
              onClick={() => openUserJot()}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Chat with the Founder</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem
              className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-neutral-800"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        open={subscriptionModalOpen}
        onOpenChange={setSubscriptionModalOpen}
        subscription={subscription ?? null}
      />

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="bottom"
          className="bg-neutral-950 border-neutral-800 rounded-t-2xl"
        >
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-neutral-600 rounded-full" />
          </div>
          <SheetHeader className="px-2 pb-4">
            <SheetTitle className="text-white text-lg">Navigate</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 pb-6">
            <Link
              href="/explore"
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors",
                pathname?.includes("/explore")
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white active:bg-neutral-800"
              )}
            >
              <Compass className="w-5 h-5" />
              <span className="font-medium">Explore</span>
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors",
                pathname?.includes("/dashboard")
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white active:bg-neutral-800"
              )}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Create</span>
            </Link>
            <Link
              href="/gallery"
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors",
                pathname?.includes("/gallery")
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white active:bg-neutral-800"
              )}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="font-medium">Gallery</span>
            </Link>
            <Link
              href="/tools"
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors",
                pathname?.includes("/tools")
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white active:bg-neutral-800"
              )}
            >
              <Wrench className="w-5 h-5" />
              <span className="font-medium">Tools</span>
            </Link>
            <button
              onClick={() => {
                setMobileNavOpen(false);
                setTimeout(() => openCrisp(), 300);
              }}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors text-neutral-400 hover:bg-neutral-800/50 hover:text-white active:bg-neutral-800"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Chat with the Founder</span>
              </div>
              {crispUnreadCount > 0 && (
                <span className="relative flex h-2 w-2 ml-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
