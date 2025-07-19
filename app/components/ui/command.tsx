import { Command as CommandPrimitive } from "cmdk";
import isHotkey from "is-hotkey";
import { SearchIcon } from "lucide-react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

const SELECT_EVENT = "cmdk-item-select";

function Command({
  className,
  disablePointerSelection = true,
  value,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  return (
    <CommandPrimitive
      ref={ref}
      data-slot="command"
      disablePointerSelection={disablePointerSelection}
      onKeyDown={(e) => {
        if (isHotkey("Enter")(e)) {
          e.preventDefault();

          const event = new Event(SELECT_EVENT);
          ref.current
            ?.querySelector(`[cmdk-item=""][aria-selected="true"]`)
            ?.dispatchEvent(event);
        }
      }}
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    >
      {children}
    </CommandPrimitive>
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentProps<typeof CommandPrimitive.Input>
>(function CommandInput({ className, ...props }, ref) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        ref={ref}
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
});

CommandInput.displayName = "CommandInput";

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  onSelect,
  value,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || props.disabled || !value) return;
    const handleSelect = () => {
      onSelect?.(value);
    };
    element.addEventListener(SELECT_EVENT, handleSelect);

    return () => element.removeEventListener(SELECT_EVENT, handleSelect);
  }, [onSelect, props.disabled]);

  return (
    <CommandPrimitive.Item
      ref={ref}
      data-slot="command-item"
      value={value}
      onDoubleClick={(e) => {
        if (value) {
          onSelect?.(value);
        }
      }}
      className={cn(
        "hover:bg-accent/50 hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  );
}

export function CommandActionDialog({
  commands,
  mainInputRef,
}: {
  commands: (React.ComponentProps<typeof CommandPrimitive.Item> & {
    label: string;
    shortcut?: string;
  })[];
  mainInputRef: React.RefObject<HTMLInputElement>;
}) {
  const [open, setOpen] = React.useState<boolean>(false);
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHotkey("mod+k")(e)) {
        setOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setOpen]);

  return (
    <Popover open={!!open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" pressed={open}>
          Actions
          <kbd
            className={
              "shadow-xs ml-2 text-xs font-medium bg-background-subtle whitespace-nowrap border-secondary border text-background-emphasis font-sans h-min w-min px-1.5 py-0.5 rounded-lg"
            }
          >
            ⌘K
          </kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          console.log("FOCUSING", mainInputRef.current);
          mainInputRef.current?.focus();
        }}
        className="p-0 w-xs"
        align="end"
        side="top"
      >
        <Command
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
        >
          <CommandList className="p-2">
            {commands.map((command) => (
              <CommandItem {...command}>
                {command.label}
                {command.shortcut && (
                  <CommandShortcut>{command.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
            <CommandEmpty className="py-4">No results</CommandEmpty>
          </CommandList>
          <CommandInput
            placeholder="Search..."
            onKeyDown={(e) => {
              if (isHotkey("mod+k")(e)) {
                setOpen(false);
              }
            }}
          />
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
