import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import CoursePage from "./pages/CoursePage.tsx";
import CoursesPage from "./pages/CoursesPage.tsx";
import SemesterPage from "./pages/SemesterPage.tsx";
import SubjectPage from "./pages/SubjectPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import ElexVaultPage from "./pages/ElexVaultPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route path="/course/:courseId/semester/:semId" element={<SemesterPage />} />
          <Route path="/subject/:subjectId" element={<SubjectPage />} />
                    <Route path="/vault" element={<ElexVaultPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
