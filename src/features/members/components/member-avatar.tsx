import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MemberAvatarAvatarProps {
  fallBackClassName?: string;
  name: string | null | undefined;
  className?: string;
  showName?: boolean; // Optional: conditionally show the name next to avatar
}

export const MemberAvatar = ({
  name,
  className,
  fallBackClassName,
  showName = true,
}: MemberAvatarAvatarProps) => {
  // Safely get first letter or fallback to a placeholder char
  const firstLetter =
    typeof name === "string" && name.length > 0
      ? name.charAt(0).toUpperCase()
      : "?";

  return (
    <div className="flex items-center gap-2">
      <Avatar className={cn("size-5 transition border", className)}>
        <AvatarFallback
          className={cn(
            "bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center text-xs",
            fallBackClassName
          )}
        >
          {firstLetter}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-sm text-neutral-700">{name ?? "Unknown"}</span>
      )}
    </div>
  );
};
