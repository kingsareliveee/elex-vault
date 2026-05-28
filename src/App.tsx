import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import React, { Suspense } from 'react';
import Index from "./pages/Index.tsx";
const CoursePage = React.lazy(() => import("./pages/CoursePage.tsx"));
const CoursesPage = React.lazy(() => import("./pages/CoursesPage.tsx"));
const SemesterPage = React.lazy(() => import("./pages/SemesterPage.tsx"));
const SubjectPage = React.lazy(() => import("./pages/SubjectPage.tsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.tsx"));
const ElexVaultPage = React.lazy(() => import("./pages/ElexVaultPage.tsx"));
import FloatingUploadButton from "@/components/FloatingUploadButton";

const queryClient = new QueryClient();

const LoaderFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoaderFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/course/:courseId/semester/:semId" element={<SemesterPage />} />
            <Route path="/subject/:subjectId" element={<SubjectPage />} />
            <Route path="/vault" element={<ElexVaultPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <FloatingUploadButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
