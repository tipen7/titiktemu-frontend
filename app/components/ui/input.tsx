import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

type InputProps = React.ComponentProps<typeof InputPrimitive> & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

function Input({ className, type, startIcon, endIcon, ...props }: InputProps) {
  const isDisabled = props.disabled;
  const input = (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-transparent bg-neutral-50 px-4 py-2 font-sans text-b9 text-neutral-700 outline-none transition-colors placeholder:text-neutral-500 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:placeholder:text-neutral-400 disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 sm:h-12 sm:px-5 sm:text-b8 [&:not(:placeholder-shown)]:border-primary-500 [&:not(:placeholder-shown)]:bg-neutral-0",
        startIcon && "pl-11 sm:pl-12",
        endIcon && "pr-11 sm:pr-12",
        className,
      )}
      {...props}
    />
  );

  if (!startIcon && !endIcon) {
    return input;
  }

  return (
    <div className="relative w-full">
      {startIcon && (
        <span className={`pointer-events-none absolute inset-y-0 left-4 flex items-center ${isDisabled ? "text-neutral-500" : "text-primary-600"} sm:left-3`}>
          {startIcon}
        </span>
      )}
      {input}
      {endIcon && (
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-primary-600 sm:right-5">
          {endIcon}
        </span>
      )}
    </div>
  );
}

function FieldLabel({
  required = false,
  className,
  ...props
}: React.ComponentProps<"label"> & { required?: boolean }) {
  return (
    <label
      className={cn(
        "mb-2 block font-sans text-s8 text-primary-700 sm:text-s7",
        className,
      )}
      {...props}
    >
      {props.children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  );
}

export { Input, FieldLabel };
export type { InputProps };
