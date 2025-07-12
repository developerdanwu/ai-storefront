import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { ZapIcon } from "lucide-react";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAppForm } from "~/components/ui/tanstack-form";

const FormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
});

export default function EmailSignup() {
  const navigate = useNavigate();

  const { mutate: emailSubscription, isPending } = useMutation({
    mutationFn: useConvexAction(api.marketing.actionNode.emailSubscription),
    onSuccess: () => {
      toast.success("You've subscribed to the waitlist!");
      // Reset form on success
      form.reset();
      // Redirect to thank you page
      navigate("/kaolin-chat/thank-you");
    },
    onError: () => {
      toast.error("Failed to subscribe to the waitlist");
    },
  });

  const form = useAppForm({
    validators: { onChange: FormSchema },
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    onSubmit: ({ value }) => {
      emailSubscription({
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
      });
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <ZapIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Kaolin <span className="font-normal">Chat</span>
            </h1>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 text-lg leading-relaxed">
              I'm thinking about building a platform to create AI agents in{" "}
              <span className="font-bold">60 seconds.</span> It'll be the
              easiest way to create experiences like{" "}
              <Link target="_blank" to="/" className="text-cyan-400">
                this
              </Link>{" "}
              out there. Want to be the first to know about it? Sign up below.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-400">—</span>
              <Avatar className="rounded-lg">
                <AvatarImage src="/profile-pic.jpg" />
                <AvatarFallback>DW</AvatarFallback>
              </Avatar>
              <span className="text-gray-400">Dan</span>
            </div>
          </div>

          {/* Form */}
          <form.AppForm>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <form.AppField
                name="firstName"
                children={(field) => (
                  <field.FormItem>
                    <field.FormLabel className="text-gray-300 text-sm font-medium">
                      First Name
                    </field.FormLabel>
                    <field.FormControl>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Preferred name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </field.FormControl>
                    <field.FormMessage />
                  </field.FormItem>
                )}
              />

              <form.AppField
                name="lastName"
                children={(field) => (
                  <field.FormItem>
                    <field.FormLabel className="text-gray-300 text-sm font-medium">
                      Last Name
                    </field.FormLabel>
                    <field.FormControl>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Your last name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </field.FormControl>
                    <field.FormMessage />
                  </field.FormItem>
                )}
              />

              <form.AppField
                name="email"
                children={(field) => (
                  <field.FormItem>
                    <field.FormLabel className="text-gray-300 text-sm font-medium">
                      Email*
                    </field.FormLabel>
                    <field.FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </field.FormControl>
                    <field.FormMessage />
                  </field.FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size={"lg"}
                disabled={isPending}
              >
                {isPending ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          </form.AppForm>
          <p className="text-gray-500 text-sm">
            🔒 I respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
