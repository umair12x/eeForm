export const metadata = {
  title: "Login & Registration",
  description: "Authentication pages for UAF Digital Enrollment Portal - log in or create an account to manage your enrollment and fees.",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}