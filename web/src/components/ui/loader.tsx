import { cn } from "@/lib/utils";

export default function Loader({ text = "Mohon Tunggu" }: { text?: string }) {
  return (
    <div className=" font-bold w-screen h-screen flex flex-col justify-center items-center">
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
