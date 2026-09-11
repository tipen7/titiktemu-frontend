import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cn } from "cn";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col gap-6 sm:gap-8", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "group/accordion-item w-full overflow-hidden rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex min-h-16 w-full flex-1 items-center justify-between rounded-2xl bg-primary-500 px-5 py-4 text-left font-sans text-b9 text-neutral-0 transition-colors hover:bg-primary-600 focus-visible:border-primary-700 focus-visible:ring-3 focus-visible:ring-primary-300/50 active:bg-primary-700 aria-expanded:rounded-b-none aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:min-h-18 sm:px-6 sm:py-5 sm:text-b8 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-neutral-0 sm:**:data-[slot=accordion-trigger-icon]:size-6",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-b9 text-primary-600 data-open:animate-accordion-down data-closed:animate-accordion-up sm:text-b8"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) border-2 border-t-0 border-primary-500 bg-neutral-0 px-5 py-4 text-primary-500 data-ending-style:h-0 data-starting-style:h-0 sm:px-6 sm:py-5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
