import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircleIcon } from "lucide-react";
import * as React from "react";
import { cn } from "~/lib/utils";
import { Alert, AlertTitle } from "./alert";
import { AnimatingEllipsis } from "./animating-ellipsis";
import { Button } from "./button";
import { Textarea } from "./textarea";

const messageInputVariants = cva(
  "flex flex-col items-end border rounded-md bg-transparent shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 transition-[color,box-shadow]",
  {
    variants: {
      variant: {
        default: "border-input",
        ghost: "border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface MessageInputProps
  extends Omit<React.ComponentProps<"textarea">, "onChange">,
    VariantProps<typeof messageInputVariants> {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  buttonText?: string;
  showIcon?: boolean;
  rows?: number;
  isGenerating?: boolean;
  onContactMe?: () => void;
}

const MessageInput = React.forwardRef<HTMLTextAreaElement, MessageInputProps>(
  (
    {
      className,
      variant,
      value,
      onChange,
      onSubmit,
      onKeyDown,
      disabled = false,
      isSubmitting = false,
      buttonText = "Send",
      rows = 1,
      placeholder = "Type your message...",
      isGenerating,
      onContactMe,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit?.();
      }
      onKeyDown?.(e);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSubmit?.();
    };

    return (
      <div className={className}>
        <Alert variant={"destructive"} size={"sm"} className="w-full mb-3">
          <AlertCircleIcon />
          <AlertTitle>
            Please do not enter secrets in this chat If you wish to discuss
            something sensitive,{" "}
            <span className="underline cursor-pointer" onClick={onContactMe}>
              contact me
            </span>
          </AlertTitle>
        </Alert>
        <div className={cn(messageInputVariants({ variant }), className)}>
          {isGenerating ? (
            <div
              className={
                "text-sm gap-2 px-3 flex items-center justify-between bg-muted w-full h-8 rounded-t-md"
              }
            >
              <p className={cn("text-primary text-xs font-semibold")}>
                Generating
                <AnimatingEllipsis />
              </p>
            </div>
          ) : null}
          <Textarea
            ref={ref}
            variant="ghost"
            placeholder={placeholder}
            className="resize-none flex-1 border-none shadow-none focus-visible:ring-0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={rows}
            disabled={disabled}
            {...props}
          />
          <Button
            type="submit"
            size="sm"
            loading={isSubmitting}
            className="m-3"
            disabled={!value.trim() || isSubmitting || disabled}
            onClick={handleSubmit}
          >
            Send
          </Button>
        </div>
      </div>
    );
  }
);

MessageInput.displayName = "MessageInput";

export { MessageInput };
