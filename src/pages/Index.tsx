import HeroSection from "@/components/HeroSection";
import MostSearched from "@/components/MostSearched";
import CourseCards from "@/components/CourseCards";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MostSearched />
      <CourseCards />
      <StatsSection />
      <Footer />
    </div>
  );
};

export default Index;
