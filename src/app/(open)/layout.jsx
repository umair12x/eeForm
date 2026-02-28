import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';

export default function OpenLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}