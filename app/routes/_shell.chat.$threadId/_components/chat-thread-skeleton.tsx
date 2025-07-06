import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

function MessageSkeleton({
  variant,
  lines,
}: {
  variant: "user" | "assistant";
  lines: number;
}) {
  const isUser = variant === "user";

  // Generate more natural, varied line widths
  const getLineWidths = (numLines: number) => {
    const possibleWidths = [
      "w-3/4",
      "w-4/5",
      "w-2/3",
      "w-5/6",
      "w-1/2",
      "w-3/5",
    ];
    return Array.from({ length: numLines }, (_, i) => {
      if (i === numLines - 1 && numLines > 1) {
        // Last line is usually shorter
        return possibleWidths[Math.floor(Math.random() * 3) + 3]; // shorter widths
      }
      return possibleWidths[Math.floor(Math.random() * possibleWidths.length)];
    });
  };

  const lineWidths = getLineWidths(lines);

  if (isUser) {
    return (
      <div className="mb-4 w-full max-w-3xl mx-auto text-sm flex justify-end">
        <div className="space-y-2 rounded-md w-full flex flex-col items-end">
          {lineWidths.map((width, i) => (
            <Skeleton className={cn("h-4", width)} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 w-full max-w-3xl mx-auto text-sm flex flex-col space-y-2">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2 flex flex-col">
          {lineWidths.map((width, i) => (
            <Skeleton key={i} className={cn("h-4", width)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatThreadSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4 p-4 ax-w-3xl mx-auto w-full">
      <MessageSkeleton variant="user" lines={3} />
      <MessageSkeleton variant="assistant" lines={2} />
      <MessageSkeleton variant="user" lines={3} />
      <MessageSkeleton variant="assistant" lines={4} />
      <MessageSkeleton variant="user" lines={2} />
    </div>
  );
}
