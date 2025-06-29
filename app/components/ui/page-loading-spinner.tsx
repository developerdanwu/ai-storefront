import { LoadingSpinner } from "./loading-spinner";

export function PageLoadingSpinner() {
  return (
    <div className={"flex justify-center items-center h-screen"}>
      <LoadingSpinner size={36} />
    </div>
  );
}
