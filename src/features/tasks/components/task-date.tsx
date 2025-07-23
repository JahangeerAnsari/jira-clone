import { cn } from "@/lib/utils";
import {format,differenceInDays} from "date-fns"
interface TaskDateProps{
    value: string;
    className?:string
}
export const TaskDate = ({ value, className }: TaskDateProps) => {
    const today = new Date();
    const endDay = new Date(value);
    const diffInDays = differenceInDays(endDay, today);
    let textColor = "text-muted-forground";
    if (diffInDays <=3) {
        textColor = "text-red-500"
    } else if (diffInDays <= 7) {
        textColor = "text-orange-500";
    } else if (diffInDays <= 14) {
        textColor = "text-yellow-500"
    }
    return (
        <div className={textColor}>
            <span className={cn("truncate", className)}>
                {format(value,"PPP")}
            </span>
        </div>
    )
};