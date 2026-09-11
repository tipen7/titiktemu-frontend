import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "group/badge inline-flex h-10 w-fit min-w-36 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border-2 bg-transparent px-6 font-sans text-base font-normal whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 sm:h-12 sm:px-8 sm:text-xl [&>svg]:pointer-events-none [&>svg]:size-5!",
  {
    variants: {
      variant: {
        primary:
          "border-primary-500 text-primary-600 hover:bg-primary-100 active:border-primary-500 active:bg-primary-500 active:text-neutral-0",
        secondary:
          "border-secondary-600 text-secondary-700 hover:bg-secondary-100 active:border-secondary-500 active:bg-secondary-500 active:text-neutral-0",
        default:
          "border-primary-500 text-primary-600 hover:bg-primary-100 active:border-primary-500 active:bg-primary-500 active:text-neutral-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
