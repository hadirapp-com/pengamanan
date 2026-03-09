type Props = {
  children: React.ReactNode;
  type?: 'form' | 'table';
};

export default function UiContainer({ children, type = 'table' }: Props) {
  if (type === 'form') {
    return (
      <div className="h-full flex flex-col lg:flex-row space-y-5 p-4 md:p-6 lg:p-8 w-full lg:px-8 xl:px-12 2xl:px-16 justify-center lg:gap-4 xl:gap-6">
        <div className="lg:w-9/12">{children}</div>
        <div className="lg:w-3/12 hidden lg:block">
          {/* <VerticalAds /> */}
        </div>
        <div className="lg:w-3/12 lg:hidden">
          {/* <HorizontalAds /> */}
        </div>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col space-y-5 p-4 md:p-6 lg:p-8 w-full lg:px-8 xl:px-12 2xl:px-16 justify-start">
      {children}
    </div>
  );
}
