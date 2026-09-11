"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Dropdown } from "@/app/components/ui/dropdown";
import { FileInput } from "@/app/components/ui/file-input";
import { FieldLabel, Input } from "@/app/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Separator } from "@/app/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/app/components/ui/sidebar";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Check, CheckCircle2, Info, Upload, User, X } from "lucide-react";

const sections = [
  ["button", "Button"],
  ["badge", "Badge / Chip"],
  ["input", "Input"],
  ["file-input", "File input"],
  ["dropdown", "Dropdown"],
  ["select", "Select"],
  ["checkbox", "Checkbox"],
  ["radio-group", "Radio group"],
  ["alert", "Alert"],
  ["accordion", "Accordion"],
  ["separator", "Separator"],
  ["skeleton", "Skeleton"],
  ["tooltip", "Tooltip"],
  ["sheet", "Sheet"],
  ["sidebar", "Sidebar"],
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
  { value: "one", label: "Choice 1" },
  { value: "two", label: "Choice 2" },
  { value: "three", label: "Choice 3" },
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
              </Button>
              <Button variant="primary-ghost">Primary ghost</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="secondary-ghost">Secondary ghost</Button>
              <Button variant="red">Red</Button>
              <Button variant="red-ghost">Red ghost</Button>
              <Button disabled>Disabled</Button>
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
                <Input
                  startIcon={<User />}
                  endIcon={<User />}
                  placeholder="Text"
                />
              </div>
              <Input
                defaultValue="Filled value"
                readOnly
                className="max-w-xs"
              />
              <Input disabled placeholder="Disabled" className="max-w-xs" />
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
              id="select"
              name="Select"
              description="The low-level select primitives for custom composition."
              code={`<Select defaultValue="all">
  <SelectTrigger><SelectValue placeholder="Pilih X" /></SelectTrigger>
  <SelectContent><SelectItem value="all">All regions</SelectItem></SelectContent>
</Select>`}
            >
              <Select defaultValue="all">
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Pilih X" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  <SelectItem value="west">West Java</SelectItem>
                  <SelectItem value="east">East Java</SelectItem>
                </SelectContent>
              </Select>
            </ComponentSection>

            <ComponentSection
              id="checkbox"
              name="Checkbox"
              description="Unchecked, checked, and disabled states."
              code={`<Checkbox />
<Checkbox defaultChecked />
<Checkbox disabled />`}
            >
              <Checkbox aria-label="Unchecked" />
              <Checkbox defaultChecked aria-label="Checked" />
              <Checkbox disabled aria-label="Disabled" />
              <span className="text-sm">Accept terms</span>
            </ComponentSection>

            <ComponentSection
              id="radio-group"
              name="Radio group"
              description="Mutually exclusive choices with a visible selected state."
              code={`<RadioGroup defaultValue="grid">
  <label><RadioGroupItem value="grid" /> Grid view</label>
  <label><RadioGroupItem value="map" /> Map view</label>
</RadioGroup>`}
            >
              <RadioGroup className="w-auto gap-3" defaultValue="grid">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="grid" /> Grid view
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="map" /> Map view
                </label>
              </RadioGroup>
            </ComponentSection>

            <ComponentSection
              id="alert"
              name="Alert"
              description="Error, warning, info, and success messaging variants."
              code={`<Alert variant="success"><CheckCircle2 /><AlertTitle>Success</AlertTitle><AlertDescription>Changes saved.</AlertDescription></Alert>
<Alert variant="error"><X /><AlertTitle>Error</AlertTitle><AlertDescription>Something went wrong.</AlertDescription></Alert>
<Alert variant="warning">...</Alert>
<Alert variant="info">...</Alert>`}
            >
              <Alert variant="error">
                <X />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <Info />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Please review this item.</AlertDescription>
              </Alert>
              <Alert variant="info">
                <Info />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  New information is available.
                </AlertDescription>
              </Alert>
              <Alert variant="success">
                <CheckCircle2 />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Changes saved.</AlertDescription>
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
                  <AccordionTrigger>Question?</AccordionTrigger>
                  <AccordionContent>Answer</AccordionContent>
                </AccordionItem>
              </Accordion>
            </ComponentSection>

            <ComponentSection
              id="separator"
              name="Separator"
              description="Horizontal and vertical content boundaries."
              code={`<Separator />
<Separator orientation="vertical" />`}
            >
              <div className="w-64">
                <span className="text-sm">Overview</span>
                <Separator className="my-4" />
                <span className="text-sm text-neutral-500">Details</span>
              </div>
              <div className="flex h-8 items-center gap-4">
                <span className="text-sm">Left</span>
                <Separator orientation="vertical" />
                <span className="text-sm">Right</span>
              </div>
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

            <ComponentSection
              id="sheet"
              name="Sheet"
              description="Side panel for secondary tasks and details."
              code={`<Sheet><SheetTrigger render={<Button>Open panel</Button>} /><SheetContent><SheetHeader><SheetTitle>Details</SheetTitle></SheetHeader></SheetContent></Sheet>`}
            >
              <Sheet>
                <SheetTrigger
                  render={<Button variant="secondary">Open panel</Button>}
                />
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Details</SheetTitle>
                    <SheetDescription>
                      Review selected tenant information.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </ComponentSection>

            <ComponentSection
              id="sidebar"
              name="Sidebar"
              description="Expanded and collapsed navigation rail states."
              code={`<SidebarProvider><Sidebar collapsible="icon"><SidebarContent>...</SidebarContent></Sidebar></SidebarProvider>`}
            >
              <div className="h-48 w-full max-w-lg overflow-hidden rounded-lg border border-neutral-200">
                <SidebarProvider className="min-h-0">
                  <Sidebar collapsible="none" className="w-48 border-r">
                    <SidebarContent>
                      <SidebarGroup>
                        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            <SidebarMenuItem>
                              <SidebarMenuButton isActive>
                                Overview
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                              <SidebarMenuButton>Settings</SidebarMenuButton>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    </SidebarContent>
                  </Sidebar>
                </SidebarProvider>
              </div>
            </ComponentSection>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
