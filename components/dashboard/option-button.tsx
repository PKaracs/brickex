"use client";

interface OptionButtonProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function OptionButton({
  children,
  active,
  onClick,
  icon,
  disabled = false,
}: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium 
        transition-all duration-200 active:scale-[0.97]
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${
          active
            ? "bg-white text-neutral-900 shadow-[0_4px_12px_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]"
            : "bg-neutral-800/60 text-neutral-400 border border-neutral-700/50 shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.02)] hover:bg-neutral-700/70 hover:text-neutral-200 hover:border-neutral-600/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-[1.02]"
        }
      `}
    >
      {icon}
      {children}
    </button>
  );
}
