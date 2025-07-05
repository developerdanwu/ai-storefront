import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeIcon,
  Loader2,
  XIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { CustomErrorBoundary } from "~/components/custom-error-boundary";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

function ToolResultFallback({
  success,
  jsonResponse,
  measureRef,
  open,
  needsTruncation,
  previewHeight,
}: {
  measureRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  needsTruncation: boolean;
  previewHeight: number;
  success: boolean | "pending" | undefined;
  jsonResponse?: string;
}) {
  const content = (
    <ScrollArea>
      <div
        className={cn(
          "text-xs border-t p-2 whitespace-pre font-mono bg-muted/30",
          success === false && "text-red-600"
        )}
      >
        {jsonResponse}
      </div>
    </ScrollArea>
  );
  return (
    <>
      <div
        ref={measureRef}
        className="absolute w-0 opacity-0 pointer-events-none -z-10"
        aria-hidden="true"
      >
        <div>{content}</div>
      </div>
      {!open && needsTruncation && (
        <div
          className="relative overflow-hidden"
          style={{ maxHeight: previewHeight }}
        >
          <div>{content}</div>
          {/* Fade overlay at bottom */}
          <CollapsibleTrigger asChild>
            <button className="cursor-pointer hover:bg-emphasis/80 transition-colors bg-emphasis/30 h-5 flex items-center justify-center absolute bottom-0 left-0 right-0">
              <ChevronDownIcon className="size-4" />
            </button>
          </CollapsibleTrigger>
        </div>
      )}
      <CollapsibleContent className="relative">
        {content}
        {open ? (
          <CollapsibleTrigger asChild>
            <button className="cursor-pointer hover:bg-emphasis/80 transition-colors bg-emphasis/30 h-5 flex items-center justify-center w-full">
              <ChevronUpIcon className="size-4" />
            </button>
          </CollapsibleTrigger>
        ) : null}
      </CollapsibleContent>
    </>
  );
}

export function ToolResultWrapper({
  children,
  actions,
  jsonResponse,
  toolName,
  success,
  previewHeight = 200, // Default preview height in pixels
}: {
  toolName: React.ReactNode;
  success: boolean | "pending" | undefined;
  jsonResponse?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  previewHeight?: number;
}) {
  const [open, setOpen] = React.useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const _open = needsTruncation ? open : true;

  // Measure content height to determine if truncation is needed
  useEffect(() => {
    if (measureRef.current) {
      const height = measureRef.current.scrollHeight;
      setNeedsTruncation(height > previewHeight);
    }
  }, [children, previewHeight]);

  return (
    <div className="my-2 shadow-xs flex border flex-col rounded-sm">
      <div className="p-2 font-medium flex items-center justify-between text-xs border-b">
        <p>
          <span className="inline-block align-middle">
            {success === "pending" ? "Calling tool:" : "Called tool:"}{" "}
            <span className="font-normal text-emphasis/80">{toolName}</span>
          </span>{" "}
          {success === true ? (
            <CheckIcon className="ml-1.5 text-green-600 inline-block align-middle size-4" />
          ) : success === false ? (
            <XIcon className="ml-1.5 text-red-600 inline-block align-middle size-4" />
          ) : null}
          {success === "pending" ? (
            <Loader2 className="ml-1.5 animate-spin inline-block align-middle size-4" />
          ) : null}
        </p>
      </div>
      <Collapsible open={_open} onOpenChange={setOpen}>
        {/* Hidden element for measuring full content height */}
        <CustomErrorBoundary
          fallbackRender={() => (
            <ToolResultFallback
              success={success}
              jsonResponse={jsonResponse}
              measureRef={measureRef}
              open={open}
              needsTruncation={needsTruncation}
              previewHeight={previewHeight}
            />
          )}
        >
          <div
            ref={measureRef}
            className="absolute w-0 opacity-0 pointer-events-none -z-10"
            aria-hidden="true"
          >
            <div>{children}</div>
          </div>
          {/* Preview when closed */}
          {!open && needsTruncation && (
            <div
              className="relative overflow-hidden"
              style={{ maxHeight: previewHeight }}
            >
              <div>{children}</div>
              {/* Fade overlay at bottom */}
              <CollapsibleTrigger asChild>
                <button className="cursor-pointer hover:bg-background/80 transition-colors bg-background h-5 flex items-center justify-center absolute bottom-0 left-0 right-0">
                  <ChevronDownIcon className="size-4" />
                </button>
              </CollapsibleTrigger>
            </div>
          )}
          <CollapsibleContent className="relative">
            <div ref={contentRef}>{children}</div>
            {open ? (
              <CollapsibleTrigger asChild>
                <button className="cursor-pointer hover:bg-background/80 transition-colors bg-background h-5 flex items-center justify-center w-full">
                  <ChevronUpIcon className="size-4" />
                </button>
              </CollapsibleTrigger>
            ) : null}
          </CollapsibleContent>
        </CustomErrorBoundary>
      </Collapsible>
      <Collapsible>
        {actions || jsonResponse ? (
          <div className="p-2 border-t flex gap-2 justify-between">
            {jsonResponse ? (
              <CollapsibleTrigger asChild>
                <Button variant={"ghost"} size={"iconXs"} isIcon>
                  <CodeIcon />
                </Button>
              </CollapsibleTrigger>
            ) : null}
            <div className="flex gap-2">{actions}</div>
          </div>
        ) : null}
        {jsonResponse ? (
          <CollapsibleContent>
            <ScrollArea>
              <div className="text-xs border-t p-2 whitespace-pre font-mono bg-muted/30">
                {jsonResponse}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        ) : null}
      </Collapsible>
    </div>
  );
}
