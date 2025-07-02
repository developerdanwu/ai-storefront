import { z } from "zod";
import { MessageInput, type MessageInputProps } from "./message-input";
import { useAppForm } from "./tanstack-form";

interface MessageInputFieldProps
  extends Omit<MessageInputProps, "value" | "onChange" | "onSubmit"> {
  name: string;
  onSubmit: (value: TFormSchema) => void | Promise<void>;
  resetOnSubmit?: boolean;
  isGenerating?: boolean;
}

export const ZFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

export type TFormSchema = z.infer<typeof ZFormSchema>;

export function MessageInputField({
  name,
  onSubmit,
  resetOnSubmit = true,
  isGenerating,
  ...messageInputProps
}: MessageInputFieldProps) {
  const form = useAppForm({
    validators: { onChange: ZFormSchema },
    defaultValues: {
      message: "",
    },
    onSubmit: async ({ value }) => {
      if (resetOnSubmit) {
        form.reset();
      }
      await onSubmit(value);
    },
  });

  return (
    <form.AppForm>
      <form.AppField
        name="message"
        children={(field) => (
          <field.FormItem>
            <field.FormControl>
              <MessageInput
                isGenerating={isGenerating}
                value={field.state.value}
                onChange={field.handleChange}
                onSubmit={form.handleSubmit}
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
