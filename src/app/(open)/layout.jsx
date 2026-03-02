import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title : {
    default: "UAF Digital Enrollment Portal",
    template: "%s | UAF Digital Enrollment Portal"
  },
  description: "Welcome to the UAF Digital Enrollment Portal. Streamline your enrollment process with our user-friendly platform designed for students, tutors, and administrators.",
  }

export default function OpenLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      {children}
      <Footer />
    </div>
  );
}