import { cn } from "~/lib/utils";

export function MessageWrapper({
  direction,
  children,
}: {
  direction: "incoming" | "outgoing";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex px-5 py-2", {
        "justify-end": direction === "outgoing",
        "justify-start": direction === "incoming",
      })}
    >
      <div
        className={cn("max-w-[70%] rounded-lg p-3", {
          "bg-primary text-primary-foreground": direction === "outgoing",
          "bg-muted": direction === "incoming",
        })}
      >
        {children}
      </div>
    </div>
  );
}
