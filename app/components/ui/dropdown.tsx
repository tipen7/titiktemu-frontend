"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type DropdownProps = {
  options: DropdownOption[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
};

function Dropdown({
  options,
  placeholder = "Pilih X",
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  contentClassName,
}: DropdownProps) {
  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={(nextValue) => {
        if (nextValue !== null) {
          onValueChange?.(nextValue);
        }
      }}
    >
      <SelectTrigger
        disabled={disabled}
        className={cn(
          "h-10 w-full min-w-0 rounded-lg border border-primary-500 bg-neutral-0 px-3 font-sans text-b9 text-primary-700 shadow-none transition-colors data-placeholder:text-neutral-500 hover:bg-primary-50 focus-visible:border-primary-600 focus-visible:ring-2 focus-visible:ring-primary-200 disabled:border-transparent disabled:bg-neutral-100 disabled:text-neutral-400 disabled:opacity-100 sm:h-12 sm:px-4 sm:text-b7",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
        <ChevronDownIcon className="size-4 shrink-0 text-current sm:size-5" />
      </SelectTrigger>
      <SelectContent
        className={cn(
          "w-(--anchor-width) min-w-0 rounded-lg border-0 bg-neutral-100 p-2 shadow-none ring-0",
          contentClassName,
        )}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="h-10 rounded-md px-2 font-sans text-b9 text-neutral-500 focus:bg-neutral-200 focus:text-neutral-700 sm:h-12 sm:px-3 sm:text-b7"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { Dropdown };
export type { DropdownOption, DropdownProps };
