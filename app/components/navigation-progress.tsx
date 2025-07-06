import { useEffect, useState } from "react";
import { useNavigation } from "react-router";
import { Progress } from "~/components/ui/progress";

export function NavigationProgress() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  // Fake navigation progress
  useEffect(() => {
    if (navigation.state === "loading") {
      // Start progress animation
      setProgress(10);
      const timer = setTimeout(() => setProgress(70), 100);
      return () => clearTimeout(timer);
    } else if (navigation.state === "submitting") {
      // Form submission progress
      setProgress(50);
    } else if (navigation.state === "idle") {
      // Complete progress and hide
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 200);
      return () => clearTimeout(timer);
    }
  }, [navigation.state]);

  const isNavigating = navigation.state !== "idle";
  const showProgress = isNavigating || progress > 0;

  if (!showProgress) return null;

  return (
    <div className="absolute w-full z-50 top-0 left-0 flex justify-center items-center">
      <Progress
        value={progress}
        className="h-1 rounded-none transition-all duration-300 ease-out"
      />
    </div>
  );
}
