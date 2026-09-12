import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding font-sans text-base font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:border-transparent aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 text-neutral-0 hover:bg-primary-600 active:bg-primary-700",
        "primary-ghost":
          "border-primary-500 bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100",
        neutral:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary-500 text-neutral-0 hover:bg-secondary-600 active:bg-secondary-700",
        "secondary-ghost":
          "border-secondary-500 bg-transparent text-secondary-500 hover:bg-secondary-50 active:bg-secondary-100",
        red: "bg-destructive text-neutral-0 hover:bg-red-700 active:bg-red-800",
        "red-ghost":
          "border-destructive bg-transparent text-destructive hover:bg-red-50 active:bg-red-100",
        outline:
          "border-neutral-500 bg-neutral-0 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100",
        ghost:
          "bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200",
        default:
          "bg-primary-500 text-neutral-0 hover:bg-primary-600 active:bg-primary-700",
      },
      size: {
        default:
          "h-14 gap-3 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-14 gap-3 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-14",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
