import { CheckCircleIcon } from "lucide-react";
import { Link } from "react-router";
import { Meta } from "~/components/meta";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

export default function ThankYou() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <Meta
        titleSuffix="Kaolin Signup"
        description="Sign up for early access to Kaolin, a platform to create AI agents in 60 seconds."
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center bg-green-500/20 rounded-full">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Thank You!</h1>
          </div>

          <div className="space-y-4">
            <p className="text-secondary-foreground text-lg leading-relaxed">
              You're all set! I've added you to the list and you'll be the first
              to know when{" "}
              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                Kaolin Chat
              </span>{" "}
              launches.
            </p>

            <div className="bg-muted/50 border border-muted rounded-lg p-4 space-y-3">
              <h3 className="text-secondary-foreground font-medium">
                What's next?
              </h3>
              <ul className="text-secondary-foreground text-sm space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400 mt-1">
                    •
                  </span>
                  <span>Check your email for a welcome message</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400 mt-1">
                    •
                  </span>
                  <span>I'll send updates as I build the platform</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-600 dark:text-cyan-400 mt-1">
                    •
                  </span>
                  <span>You'll get early access when it's ready</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <span className="text-secondary-foreground">—</span>
              <Avatar className="rounded-lg">
                <AvatarImage src="/profile-pic.jpg" />
                <AvatarFallback>DW</AvatarFallback>
              </Avatar>
              <span className="text-secondary-foreground">Dan</span>
            </div>
          </div>
          <Button size="lg" asChild className="w-full">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
