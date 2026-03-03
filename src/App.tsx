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
import CertificateDetailPage from "./pages/CertificateDetailPage";
import ProfilePage from "./pages/ProfilePage";
import MyLearningPage from "./pages/MyLearningPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PublishSuccessPage from "./pages/PublishSuccessPage";

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
          <Route path="/certificate/:certId" element={<CertificateDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-learning" element={<MyLearningPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/publish-success/:courseId" element={<PublishSuccessPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </SuiProviderWrapper>
);

export default App;
