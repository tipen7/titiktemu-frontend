"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "group/badge inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border bg-transparent px-3 font-sans text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        primary:
          "border-primary-500 text-primary-600 hover:bg-primary-100 active:border-primary-500 active:bg-primary-500 active:text-neutral-0 aria-pressed:border-primary-500 aria-pressed:bg-primary-500 aria-pressed:text-neutral-0",
        secondary:
          "border-secondary-600 text-secondary-700 hover:bg-secondary-100 active:border-secondary-500 active:bg-secondary-500 active:text-neutral-0 aria-pressed:border-secondary-500 aria-pressed:bg-secondary-500 aria-pressed:text-neutral-0",
        default:
          "border-primary-500 text-primary-600 hover:bg-primary-100 active:border-primary-500 active:bg-primary-500 active:text-neutral-0 aria-pressed:border-primary-500 aria-pressed:bg-primary-500 aria-pressed:text-neutral-0",
      },
      size: {
        sm: "h-6 px-2.5 text-[11px]",
        default: "h-7 px-3 text-xs",
        lg: "h-8 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  size = "default",
  selected,
  defaultSelected = false,
  selectable = true,
  onSelectedChange,
  onClick,
  render,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    selected?: boolean;
    defaultSelected?: boolean;
    selectable?: boolean;
    onSelectedChange?: (selected: boolean) => void;
  }) {
  const [uncontrolledSelected, setUncontrolledSelected] =
    React.useState(defaultSelected);
  const isSelected = selected ?? uncontrolledSelected;

  function handleClick(event: React.MouseEvent<HTMLSpanElement>) {
    if (selectable) {
      const nextSelected = !isSelected;
      if (selected === undefined) {
        setUncontrolledSelected(nextSelected);
      }
      onSelectedChange?.(nextSelected);
    }
    onClick?.(event);
  }

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
        "aria-pressed": selectable ? isSelected : undefined,
        onClick: selectable || onClick ? handleClick : undefined,
        onKeyDown: selectable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleClick(
                  event as unknown as React.MouseEvent<HTMLSpanElement>,
                );
              }
            }
          : undefined,
        role: selectable ? "button" : undefined,
        tabIndex: selectable ? 0 : undefined,
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  });
}

export { Badge, badgeVariants };
