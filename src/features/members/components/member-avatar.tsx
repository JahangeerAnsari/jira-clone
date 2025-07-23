import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MemberAvatarAvatarProps {
  fallBackClassName?: string;
  name: string;
  className?: string;
  showName?: boolean; // Optional: conditionally show the name next to avatar
}

export const MemberAvatar = ({
  name,
  className,
  fallBackClassName,
  showName = true,
}: MemberAvatarAvatarProps) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar
        className={cn(
          "size-5 transition border",
          className
        )}
      >
        <AvatarFallback
          className={cn(
            "bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center text-xs",
            fallBackClassName
          )}
        >
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showName && <span className="text-sm text-neutral-700">{name}</span>}
    </div>
  );
};
