"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import {
  Alert,
  AlertAction,
  AlertClose,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@/app/components/ui/alert";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Checkbox, CheckboxField } from "@/app/components/ui/checkbox";
import { Dropdown } from "@/app/components/ui/dropdown";
import { FileInput } from "@/app/components/ui/file-input";
import { FieldLabel, Input } from "@/app/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  Check,
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  Train,
  TriangleAlert,
  User,
  X,
} from "lucide-react";

const sections = [
  ["button", "Button"],
  ["badge", "Badge / Chip"],
  ["input", "Input"],
  ["file-input", "File input"],
  ["dropdown", "Dropdown"],
  ["checkbox", "Checkbox"],
  ["radio-group", "Radio group"],
  ["alert", "Alert"],
  ["accordion", "Accordion"],
  ["skeleton", "Skeleton"],
  ["tooltip", "Tooltip"],
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto border-t border-neutral-200 bg-neutral-50 p-4 text-xs leading-6 text-neutral-700">
      <code>{children}</code>
    </pre>
  );
}

function ComponentSection({
  id,
  name,
  description,
  code,
  children,
}: {
  id: string;
  name: string;
  description: string;
  code: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-8 border-b border-neutral-200 py-10 last:border-0"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
            {name}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        </div>
        <span className="font-mono text-[11px] text-neutral-400">ui/{id}</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="flex min-h-28 flex-wrap items-center gap-4 p-6">
          {children}
        </div>
        <CodeBlock>{code}</CodeBlock>
      </div>
    </section>
  );
}

const dropdownOptions = [
  { value: "Fizi", label: "Fizi" },
  { value: "Umar", label: "Umar" },
  { value: "Stasiun Dukuh Atas BNI", label: "Stasiun Dukuh Atas BNI" },
];

export default function DesignSystemPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-600">
              Titik Temu
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Design system
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              A practical reference for every reusable interface component.
            </p>
          </div>
        </header>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[210px_minmax(0,1fr)] lg:px-10">
          <aside className="hidden lg:block">
            <nav className="sticky top-0 py-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Components
              </p>
              <div className="space-y-1 border-l border-neutral-200 pl-4">
                {sections.map(([id, name]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block py-1 text-sm text-neutral-500 hover:text-neutral-900"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </nav>
          </aside>
          <main className="min-w-0 pb-16">
            <ComponentSection
              id="button"
              name="Button"
              description="Primary, secondary, red, ghost, neutral, and icon sizes."
              code={`<Button variant="primary">Primary</Button>
<Button variant="primary-ghost">Primary ghost</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="secondary-ghost">Secondary ghost</Button>
<Button variant="red">Red</Button>
<Button variant="red-ghost">Red ghost</Button>
<Button disabled>Disabled</Button>`}
            >
              <Button variant="primary">
                <User />
                Primary
                <User />
              </Button>
              <Button variant="primary-ghost">
                <User />
                Primary ghost
                <User />
              </Button>
              <Button variant="secondary">
                <User />
                Secondary
                <User />
              </Button>
              <Button variant="secondary-ghost">
                <User />
                Secondary ghost
                <User />
              </Button>
              <Button variant="red">
                <User />
                Red
                <User />
              </Button>
              <Button variant="red-ghost">
                <User />
                Red ghost
                <User />
              </Button>
              <Button disabled>
                <User />
                Disabled
                <User />
              </Button>
            </ComponentSection>

            <ComponentSection
              id="badge"
              name="Badge / Chip"
              description="Primary and secondary chips with default, hover, and active states."
              code={`<Badge variant="primary">Primary</Badge>
<Badge variant="secondary">Secondary</Badge>`}
            >
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="primary">
                <Check />
                Selected
              </Badge>
            </ComponentSection>

            <ComponentSection
              id="input"
              name="Input"
              description="Default, hover, focused, filled, disabled, and icon-slot states."
              code={`<FieldLabel htmlFor="name" required>Name</FieldLabel>
<Input id="name" startIcon={<User />} placeholder="Text" />
<Input value="Filled value" readOnly />
<Input disabled placeholder="Disabled" />`}
            >
              <div className="w-full max-w-md">
                <FieldLabel required>Name</FieldLabel>
                <Input startIcon={<User />} placeholder="Text" />
              </div>
              <div className="w-full max-w-md">
                <FieldLabel required>Email</FieldLabel>
                <Input
                  startIcon={<User />}
                  endIcon={<User />}
                  placeholder="fizi@gmail.com"
                />
              </div>

              <div className="w-full max-w-md">
                <FieldLabel>Autofill</FieldLabel>
                <Input
                  defaultValue="Filled value"
                  startIcon={<User />}
                  endIcon={<User />}
                  readOnly
                />
              </div>

              <div>
                <FieldLabel>Autofill</FieldLabel>

                <Input
                  startIcon={<Train />}
                  disabled
                  placeholder="Stasiun MRT Blok M"
                  className="max-w-xs"
                />
              </div>
            </ComponentSection>

            <ComponentSection
              id="file-input"
              name="File input"
              description="Empty, selected, hover, focus, and disabled upload states."
              code={`<FileInput accept=".png,.jpg" />
<FileInput selectedLabel="NamaFile.png" />
<FileInput disabled />`}
            >
              <FileInput className="max-w-xs" />
              <FileInput
                className="max-w-xs"
                selectedLabel="NamaFile.png"
                value={new File([], "NamaFile.png")}
              />
              <FileInput className="max-w-xs" disabled />
            </ComponentSection>

            <ComponentSection
              id="dropdown"
              name="Dropdown"
              description="Responsive 354px dropdown using the refined Select primitives."
              code={`<Dropdown
  placeholder="Pilih X"
  options={[{ value: "one", label: "Choice 1" }]}
/>`}
            >
              <Dropdown options={dropdownOptions} />
              <Dropdown options={dropdownOptions} defaultValue="one" />
            </ComponentSection>

            <ComponentSection
              id="checkbox"
              name="Checkbox"
              description="Default, checked, descriptive, disabled, and bordered-card patterns."
              code={`<CheckboxField id="default" label="Accept terms and conditions" />
<CheckboxField id="checked" label="Accept terms and conditions" defaultChecked
  description="By clicking this checkbox, you agree to the terms." />
<CheckboxField id="disabled" label="Enable notifications" disabled />
<CheckboxField id="card" label="Enable notifications" card
  description="You can enable or disable notifications at any time." />`}
            >
              <CheckboxField id="default" label="Accept terms and conditions" />
              <CheckboxField
                id="checked"
                label="Accept terms and conditions"
                defaultChecked
                description="By clicking this checkbox, you agree to the terms."
              />
              <CheckboxField
                id="disabled"
                label="Enable notifications"
                disabled
              />
              <CheckboxField
                id="card"
                label="Enable notifications"
                card
                description="You can enable or disable notifications at any time."
              />
            </ComponentSection>

            <ComponentSection
              id="radio-group"
              name="Radio group"
              description="Mutually exclusive choices with a visible selected state."
              code={`<RadioGroup defaultValue="grid">
  <label><RadioGroupItem value="grid" /> Fizi</label>
  <label><RadioGroupItem value="map" /> Umar</label>
</RadioGroup>`}
            >
              <RadioGroup className="w-auto gap-3" defaultValue="grid">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="grid" /> Fizi
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="map" /> Umar
                </label>
              </RadioGroup>
            </ComponentSection>

            <ComponentSection
              id="alert"
              name="Alert"
              description="Error, warning, info, and success messaging variants."
              code={`<Alert variant="success">
  <AlertIcon className="bg-[#00ad66] text-neutral-0"><CircleCheck /></AlertIcon>
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Changes saved.</AlertDescription>
  <AlertAction><AlertClose /></AlertAction>
</Alert>`}
            >
              <Alert variant="error">
                <AlertIcon className="bg-red">
                  <CircleX />
                </AlertIcon>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong.</AlertDescription>
                <AlertAction>
                  <AlertClose />
                </AlertAction>
              </Alert>
              <Alert variant="warning">
                <AlertIcon className="text-yellow-600">
                  <TriangleAlert />
                </AlertIcon>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Please review this item.</AlertDescription>
                <AlertAction>
                  <AlertClose />
                </AlertAction>
              </Alert>
              <Alert variant="info">
                <AlertIcon className="text-primary-600">
                  <CircleAlert   />
                </AlertIcon>
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  New information is available.
                </AlertDescription>
                <AlertAction>
                  <AlertClose />
                </AlertAction>
              </Alert>
              <Alert variant="success">
                <AlertIcon className="text-green-600">
                  <CircleCheck />
                </AlertIcon>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Changes saved.</AlertDescription>
                <AlertAction>
                  <AlertClose />
                </AlertAction>
              </Alert>
            </ComponentSection>

            <ComponentSection
              id="accordion"
              name="Accordion"
              description="Closed and open disclosure states."
              code={`<Accordion><AccordionItem value="faq"><AccordionTrigger>Question?</AccordionTrigger><AccordionContent>Answer</AccordionContent></AccordionItem></Accordion>`}
            >
              <Accordion className="w-full max-w-lg" defaultValue={["faq"]}>
                <AccordionItem value="faq">
                  <AccordionTrigger>Does Umar === Fizi?</AccordionTrigger>
                  <AccordionContent>Yes!</AccordionContent>
                </AccordionItem>
              </Accordion>
            </ComponentSection>

            <ComponentSection
              id="skeleton"
              name="Skeleton"
              description="Loading placeholders for text and content blocks."
              code={`<Skeleton className="h-4 w-48" />
<Skeleton className="h-20 w-20 rounded-full" />`}
            >
              <div className="w-56 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="size-16 rounded-full" />
            </ComponentSection>

            <ComponentSection
              id="tooltip"
              name="Tooltip"
              description="Context for unfamiliar controls and icon-only actions."
              code={`<Tooltip><TooltipTrigger render={<Button size="icon" variant="outline" />}><Info /></TooltipTrigger><TooltipContent>More information</TooltipContent></Tooltip>`}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button size="icon" variant="primary">
                      <Info />
                    </Button>
                  }
                />
                <TooltipContent>More information</TooltipContent>
              </Tooltip>
            </ComponentSection>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
