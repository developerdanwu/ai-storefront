import { WorkOsWidgets } from "@workos-inc/widgets";

export function WorkOsProvider({ children }: { children: React.ReactNode }) {
  return (
    <WorkOsWidgets
      theme={{
        appearance: "inherit",
        accentColor: "green",
        radius: "medium",
        fontFamily: "Inter",
      }}
    >
      {children}
    </WorkOsWidgets>
  );
}
