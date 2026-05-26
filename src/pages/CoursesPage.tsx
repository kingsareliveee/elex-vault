import Navbar from "@/components/Navbar";
import CourseCards from "@/components/CourseCards";
import Footer from "@/components/Footer";

const CoursesPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-20">
      <CourseCards />
    </div>
    <Footer />
  </div>
);

export default CoursesPage;
