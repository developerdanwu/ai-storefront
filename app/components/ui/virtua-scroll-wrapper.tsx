import { useOverlayScrollbars } from "overlayscrollbars-react";
import React, { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

export function VirtuaScrollWrapper({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const rootRef = useRef<null | HTMLDivElement>(null);
  const [initialize, instance] = useOverlayScrollbars({
    defer: true,
  });

  useEffect(() => {
    const { current: root } = rootRef;

    if (root) {
      initialize({
        target: root,
        elements: {
          viewport: root.firstElementChild as HTMLElement,
        },
      });
    }

    return () => {
      instance()?.destroy();
    };
  }, [initialize]);

  return (
    <div
      className={cn("h-full hello-class", className)}
      data-overlayscrollbars-initialize={""}
      ref={rootRef}
      {...props}
    >
      {children}
    </div>
  );
}
