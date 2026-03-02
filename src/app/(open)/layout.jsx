import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: "Home | UAF Digital Enrollment Portal",
};

export default function OpenLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      {children}
      <Footer />
    </div>
  );
}