"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "cn";
import { CheckIcon } from "lucide-react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/app/components/ui/field";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-neutral-400 bg-neutral-0 transition-colors outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-neutral-400 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-primary-500 focus-visible:ring-3 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary-500 data-checked:border-primary-500 data-checked:bg-primary-500 data-checked:text-neutral-0 group-has-[:focus-visible]/field-label:data-checked:border-primary-500",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

type CheckboxFieldProps = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  card?: boolean;
  onCheckedChange?: CheckboxPrimitive.Root.Props["onCheckedChange"];
};

function CheckboxField({
  id,
  label,
  description,
  checked,
  defaultChecked,
  disabled = false,
  card = false,
  onCheckedChange,
}: CheckboxFieldProps) {
  return (
    <Field
      orientation="horizontal"
      data-disabled={disabled || undefined}
      className={cn(
        "items-start gap-3",
        card &&
          "rounded-xl border border-neutral-300 bg-neutral-0 p-4 transition-colors has-data-checked:border-primary-500 has-data-checked:bg-primary-50",
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
      <FieldContent>
        {card ? (
          <FieldTitle>{label}</FieldTitle>
        ) : (
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
        )}
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}

export { Checkbox, CheckboxField };
export type { CheckboxFieldProps };
