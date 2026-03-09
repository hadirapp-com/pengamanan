import { Skeleton } from '@/components/ui/skeleton';
import UiContainer from '@/components/ui/layout/ui-container';

export default function TableSkeleton() {
  return (
    <UiContainer>
      <div className="flex gap-2 w-full justify-between">
        <div className="gap-3 flex flex-col">
          <Skeleton className="lg:w-[150px] w-[80px] h-[20px]" />
          <Skeleton className="lg:w-[300px] w-[150px] h-[15px]" />
        </div>
        <div className="flex items-center">
          <Skeleton className="w-[60px] h-[20px]" />
        </div>
      </div>
      <div className="flex flex-col pt-10 gap-5">
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
        <Skeleton className="w-full h-[20px]" />
      </div>
      <div className="gap-3 flex pt-6 justify-between">
        <Skeleton className="lg:w-[150px] w-[120px] h-[20px]" />
        <Skeleton className="lg:w-[150px] w-[120px] h-[20px]" />
      </div>
    </UiContainer>
  );
}
