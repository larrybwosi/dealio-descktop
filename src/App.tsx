import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryProvider } from "@/providers/query-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/login";
import { SessionProvider } from "./providers/session";
import { OrgProvider } from "./providers/org-context";
import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Toaster } from "sonner";

export type ToastType =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "default"
  | "action"
  | "promise";

interface ToastConfig {
  type: ToastType;
  icon: React.ReactNode;
  className: string;
}

const App = () => {
  const toastConfigs = useMemo(
    () => ({
      success: {
        type: "success",
        icon: <CheckCircle2 className="h-5 w-5 stroke-green-500" />,
        className: "bg-green-500/20 text-green-500 border-green-500/30",
      },
      error: {
        type: "error",
        icon: <XCircle className="h-5 w-5 stroke-red-500" />,
        className: "bg-rose-200 text-red-500 border-red-500/30",
      },
      info: {
        type: "info",
        icon: <Info className="h-5 w-5 stroke-blue-500" />,
        className: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      },
      warning: {
        type: "warning",
        icon: <AlertTriangle className="h-5 w-5 stroke-yellow-500" />,
        className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      },
      default: {
        type: "default",
        icon: null,
        className: "bg-gray-500/20 text-gray-500 border-gray-500/30",
      },
      action: {
        type: "action",
        icon: null,
        className: "bg-gray-500/20 text-gray-500 border-gray-500/30",
      },
      promise: {
        type: "promise",
        icon: null,
        className: "bg-gray-500/20 text-gray-500 border-gray-500/30",
      },
    }),
    []
  );

  return (
    <QueryProvider>
      <TooltipProvider>
        <Toaster
          richColors
          position="top-right"
          visibleToasts={3}
          toastOptions={{
            classNames: {
              toast: "flex items-center gap-2 p-4 rounded-md shadow-lg",
              success: toastConfigs.success.className,
              error: toastConfigs.error.className,
              info: toastConfigs.info.className,
              warning: toastConfigs.warning.className,
              default: toastConfigs.default.className,
            },
          }}
        />
        <BrowserRouter>
          <SessionProvider redirectTo="/login">
            {/* <OrgProvider> */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* </OrgProvider> */}
          </SessionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryProvider>
  );
};

export default App;
