import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";

import Loader from "@/components/ui/loader";
import { Toaster } from "@/components/ui/sonner";

import { BaseRouter } from "@/router";

const queryClient = new QueryClient();
// import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const App = (): React.ReactElement => {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loader />}>
        <BrowserRouter>
          <BaseRouter />
        </BrowserRouter>
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster position="top-center" richColors />
      {/* <ConfirmDialog /> */}
    </QueryClientProvider>
  );
};

export default App;
