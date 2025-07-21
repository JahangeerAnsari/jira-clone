import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  className?: string;
  placeholder?: string;
}

export const DatePicker = ({
  onChange,
  value,
  className,
  placeholder = "Select Date",
}: DatePickerProps) => {
  const [open, setOpen] = useState(false); // ✅ control popover visibility

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setOpen((prev) => !prev)} // ✅ toggle manually
          className={cn(
            "w-full justify-start text-left font-normal px-3",
            !value && "text-muted-foreground",
            className
          )}
        >
         { value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50">
        {" "}
        {/* z-50 to avoid modal overlap issues */}
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date as Date);
            setOpen(false); // ✅ close on date select
          }}
          className="rounded-lg border"
        />
      </PopoverContent>
    </Popover>
  );
};
