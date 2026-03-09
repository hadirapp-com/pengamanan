import { Skeleton } from '@/components/ui/skeleton';
import UiContainer from '@/components/ui/layout/ui-container';

export default function FormSkeleton() {
  return (
    <UiContainer>
      <div className="flex gap-2 w-full justify-between">
        <div className="gap-3 flex flex-col">
          <Skeleton className="lg:w-[150px] w-[80px] h-[20px]" />
          <Skeleton className="lg:w-[150px] w-[80px] h-[15px]" />
        </div>
      </div>
      <div className="flex flex-col pt-10 gap-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="lg:w-[150px] w-[80px] h-[10px]" />
          <Skeleton className="w-full h-[30px]" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="lg:w-[150px] w-[80px] h-[10px]" />
          <Skeleton className="w-full h-[30px]" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="lg:w-[150px] w-[80px] h-[10px]" />
          <Skeleton className="w-full h-[30px]" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="lg:w-[150px] w-[80px] h-[10px]" />
          <Skeleton className="w-full h-[30px]" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="lg:w-[150px] w-[80px] h-[10px]" />
          <Skeleton className="w-full h-[30px]" />
        </div>
        <div className="gap-3 flex pt-6 justify-end">
          <Skeleton className="lg:w-[150px] w-[80px] h-[20px]" />
        </div>
      </div>
    </UiContainer>
  );
}
