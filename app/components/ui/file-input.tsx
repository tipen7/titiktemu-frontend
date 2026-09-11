"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { cn } from "cn";

type FileInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange"
> & {
  value?: File | null;
  onFileChange?: (file: File | null) => void;
  placeholder?: string;
  selectedLabel?: string;
};

function FileInput({
  className,
  value,
  onFileChange,
  placeholder = "Pilih File",
  selectedLabel,
  disabled,
  id,
  ...props
}: FileInputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const [selectedFile, setSelectedFile] = React.useState<File | null>(
    value ?? null,
  );
  const file = value === undefined ? selectedFile : value;
  const label = selectedLabel ?? file?.name ?? placeholder;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setSelectedFile(nextFile);
    onFileChange?.(nextFile);
  }

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-400 bg-neutral-50 px-4 py-5 font-sans text-b8 text-neutral-600 transition-colors hover:border-primary-500 hover:bg-primary-50 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 sm:min-h-36 sm:text-b7",
        file && "border-primary-500 bg-neutral-0 text-primary-600",
        disabled &&
          "pointer-events-none border-neutral-300 bg-neutral-200 text-neutral-400",
        className,
      )}
    >
      <Upload className="size-5 sm:size-6" strokeWidth={1.8} />
      <span className="max-w-full truncate text-center">{label}</span>
      <input
        {...props}
        id={inputId}
        type="file"
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />
    </label>
  );
}

export { FileInput };
export type { FileInputProps };
