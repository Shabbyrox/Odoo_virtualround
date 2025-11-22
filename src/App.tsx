import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import MoveHistory from "./pages/MoveHistory";
import Settings from "./pages/Settings";
import Receipts from "./pages/Receipts";
import Deliveries from "./pages/Deliveries";
import Adjustments from "./pages/Adjustments";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
        },
      }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
            <Route path="/categories" element={<AppLayout><Categories /></AppLayout>} />
            <Route path="/receipts" element={<AppLayout><Receipts /></AppLayout>} />
            <Route path="/deliveries" element={<AppLayout><Deliveries /></AppLayout>} />
            <Route path="/adjustments" element={<AppLayout><Adjustments /></AppLayout>} />
            <Route path="/move-history" element={<AppLayout><MoveHistory /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            <Route path="/warehouses" element={<AppLayout><Settings /></AppLayout>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
