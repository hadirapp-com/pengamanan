import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
// import { Icons } from '@/components/ui/icons';

type Props = {
  title: string;
  subtitle?: string;
  backAction?: () => void;
  rightAction?: () => void;
  rightText?: string;
  rightIcon?: string;
  rightActionLoading?: boolean;
};

export default function Formheader({
  title,
  subtitle,
  backAction,
  rightAction,
  // rightText = 'Simpan',
  // rightIcon = 'Save',
  rightActionLoading = false,
}: Props) {
  if (!title) return null;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // const Icon = rightIcon ? Icons[rightIcon] : Icons['Save'];
  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <div className="flex flex-col w-full items-start space-y-2">
          <div>
            <h2 className="lg:text-2xl text-xl font-semibold tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground text-sm lg:text-base">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex justify-between w-full items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={backAction}
              className="h-8 flex"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              kembali
            </Button>
            {rightAction && (
              <Button
                variant="outline"
                size="sm"
                onClick={rightAction}
                type="submit"
                disabled={rightActionLoading}
                className="float-right h-8 bg-primary text-white hover:bg-primary-hover hover:text-white"
              >
                {rightActionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Save
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
