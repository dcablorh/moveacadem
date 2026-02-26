import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SuiProviderWrapper } from "@/providers/SuiProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CoursesPage from "./pages/Courses";
import CourseDetailPage from "./pages/CourseDetail";
import CreatePage from "./pages/CreatePage";
import LessonViewPage from "./pages/LessonView";
import CertificatesPage from "./pages/CertificatesPage";
import ProfilePage from "./pages/ProfilePage";

const App = () => (
  <SuiProviderWrapper>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:courseId" element={<CourseDetailPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/lesson/:courseId/:lessonId" element={<LessonViewPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </SuiProviderWrapper>
);

export default App;
