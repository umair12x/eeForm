import Footer from "@/components/layout/Footer";
import NavBar from "@/components/layout/NavBar";

export const metadata = {
  title: "Dashboard | UAF Digital Enrollment Portal",
};

export default function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <NavBar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
