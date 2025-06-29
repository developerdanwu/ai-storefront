import * as React from "react";
import { z } from "zod";
import { MessageInput, type MessageInputProps } from "./message-input";
import { useAppForm } from "./tanstack-form";

interface MessageInputFieldProps
  extends Omit<MessageInputProps, "value" | "onChange" | "onSubmit"> {
  name: string;
  onSubmit: (value: string) => void | Promise<void>;
  schema?: z.ZodSchema;
  resetOnSubmit?: boolean;
  externalValue?: string;
  onExternalValueChange?: () => void;
}

export function MessageInputField({
  name,
  onSubmit,
  schema = z.string().min(1, "Message cannot be empty"),
  resetOnSubmit = true,
  externalValue,
  onExternalValueChange,
  ...messageInputProps
}: MessageInputFieldProps) {
  const form = useAppForm({
    validators: { onChange: z.object({ [name]: schema }) },
    defaultValues: {
      [name]: "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value[name]);
      if (resetOnSubmit) {
        form.reset();
      }
    },
  });

  // Handle external value changes (like suggestion clicks)
  React.useEffect(() => {
    if (externalValue !== undefined) {
      form.setFieldValue(name, externalValue);
      onExternalValueChange?.();
    }
  }, [externalValue, form, name, onExternalValueChange]);

  const handleSubmit = React.useCallback(() => {
    form.handleSubmit();
  }, [form]);

  return (
    <form.AppForm>
      <form.AppField
        name={name}
        children={(field) => (
          <field.FormItem>
            <field.FormControl>
              <MessageInput
                value={field.state.value}
                onChange={field.handleChange}
                onSubmit={handleSubmit}
                onBlur={field.handleBlur}
                isSubmitting={form.state.isSubmitting}
                {...messageInputProps}
              />
            </field.FormControl>
          </field.FormItem>
        )}
      />
    </form.AppForm>
  );
}
