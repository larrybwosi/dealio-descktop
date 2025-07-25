import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryProvider } from '@/providers/query-provider';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import LoginPage from './pages/login';
import { SessionProvider } from './providers/session';

const App = () => (
  <QueryProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <SessionProvider redirectTo="/login">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryProvider>
);

export default App;
