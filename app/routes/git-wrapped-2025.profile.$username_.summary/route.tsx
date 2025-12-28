import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import {
  RENDER_WIDTH,
  useGenerateSummaryImage,
} from "./use-generate-summary-image";

const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-neutral-950 p-4">
    {children}
  </div>
);

export default function GitWrappedSummaryRoute() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGenerateSummaryImage({
    username: username ?? "",
  });

  // Loading state
  if (isLoading) {
    return (
      <Container>
        <div className="flex flex-col items-center gap-4 text-white">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p className="text-lg">
            {isLoading
              ? `Loading ${username}'s GitHub stats...`
              : "Generating image..."}
          </p>
        </div>
      </Container>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container>
        <div className="flex flex-col items-center gap-4 text-white">
          <p className="text-xl font-bold">Oops! Something went wrong</p>
          <p className="text-white/70">
            {error?.message || "Failed to load data"}
          </p>
          <button
            type="button"
            onClick={() => navigate("/git-wrapped-2025")}
            className="mt-4 rounded-lg bg-white/10 px-6 py-2 text-white transition-colors hover:bg-white/20"
          >
            Try another username
          </button>
        </div>
      </Container>
    );
  }

  // Success state - show the generated image
  return (
    <Container>
      <div className="flex flex-col items-center gap-6">
        {/* Title */}
        <h1 className="text-center text-2xl font-bold text-white">
          {username}'s Git Wrapped 2025
        </h1>

        {/* Instruction text */}
        <p className="text-center text-sm text-white/60">
          Right-click (or long-press on mobile) to save the image
        </p>

        {/* Generated image */}
        {data && (
          <img
            src={data?.imageUrl}
            alt={`${username}'s Git Wrapped 2025 Summary`}
            className="max-w-full rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10"
            style={{
              width: RENDER_WIDTH,
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />
        )}

        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate(`/git-wrapped-2025/profile/${username}`)}
          className="mt-2 rounded-lg bg-white/10 px-6 py-2 text-white transition-colors hover:bg-white/20"
        >
          View interactive statistics
        </button>
      </div>
    </Container>
  );
}
