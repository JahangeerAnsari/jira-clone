interface MemberAvatarAvatarProps {
  fallBackClassName?: string;
  name: string;
  className?: string;
}
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const MemberAvatar = ({
  name,
  className,
  fallBackClassName,
}: MemberAvatarAvatarProps) => {
  
  return (
    <Avatar className={cn("size-5 transition border border-neutral-300 rounded-md", className)}>
      <AvatarFallback className={cn("bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center",fallBackClassName)}>
        {name.charAt(0).toLocaleUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
