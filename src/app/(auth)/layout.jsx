export const metadata = {
  title: "Authentication | UAF Digital Enrollment Portal",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}