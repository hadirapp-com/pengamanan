import { cn } from "@/lib/utils";

export function Loader({ text = "Mohon Tunggu", className }: { text?: string; className?: string }) {
  return (
    <div className={cn("font-bold w-screen h-screen flex flex-col justify-center items-center", className)}>
      {/* <HadirappLogo className="animate-pulse h-20 w-20 mb-2.5" /> */}
      <p
        className={cn("lg:text-xl text-lg", {
          "font-medium": text === "Hadirapp" ? false : true,
        })}
      >
        {text}
      </p>
    </div>
  );
}
