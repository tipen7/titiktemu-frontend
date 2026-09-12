import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { XIcon } from "lucide-react";

const alertVariants = cva(
  "group/alert relative grid min-h-20 w-[314px] max-w-full grid-cols-[44px_1fr] items-center gap-x-4 gap-y-0 rounded-xl border-0 border-l-[14px] bg-neutral-0 px-4 py-3 text-left font-sans has-data-[slot=alert-action]:pr-10 has-[>[data-slot=alert-icon]]:grid-cols-[44px_1fr] sm:min-h-[92px] sm:gap-x-4 sm:px-4 sm:py-4",
  {
    variants: {
      variant: {
        error:
          "border-l-[#e50909] bg-[#fff0f0] text-[#e50909] *:data-[slot=alert-description]:text-neutral-1000 *:[svg]:text-neutral-0",
        warning:
          "border-l-[#ff9900] bg-[#fff8e9] text-[#e58a00] *:data-[slot=alert-description]:text-neutral-1000 *:[svg]:text-neutral-0",
        info: "border-l-primary-600 bg-primary-50 text-primary-700 *:data-[slot=alert-description]:text-neutral-1000 *:[svg]:text-primary-600",
        success:
          "border-l-[#00ad66] bg-[#eaf9f3] text-[#00ad66] *:data-[slot=alert-description]:text-neutral-1000 *:[svg]:text-neutral-0",
        default:
          "border-l-primary-600 bg-primary-50 text-primary-700 *:data-[slot=alert-description]:text-neutral-1000 *:[svg]:text-primary-600",
        destructive:
          "border-l-[#e50909] bg-[#fff0f0] text-[#e50909] *:data-[slot=alert-description]:text-neutral-1000 *:[svg]:text-neutral-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 row-start-1 font-sans text-s8 font-semibold leading-tight sm:text-s7 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 row-start-2 text-b9 leading-snug text-neutral-1000 sm:text-b8 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-icon"
      className={cn(
        "col-start-1 row-span-2 row-start-1 flex size-11 shrink-0 items-center justify-center rounded-full [&>svg]:size-10 [&>svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-4 right-3 text-current sm:top-5", className)}
      {...props}
    />
  );
}

function AlertClose({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label="Dismiss alert"
      data-slot="alert-close"
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-sm text-current transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40",
        className,
      )}
      {...props}
    >
      <XIcon className="size-5" />
    </button>
  );
}

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
  AlertClose,
  AlertIcon,
};
