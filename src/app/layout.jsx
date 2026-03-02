import { Inter } from "next/font/google";
import "@/app/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://eeform.uaf.edu.pk"),
  title: "UAF Digital Enrollment Portal | Online Fee Verification & Course Registration",
  description: "University of Agriculture Faisalabad - Digital Enrollment Portal for UG and PG programs with fee verification, form submission, and course registration.",
  keywords: [
    "university enrollment",
    "fee verification",
    "UG form",
    "GS-10 form",
    "digital admission",
    "University of Agriculture Faisalabad",
    "UAF",
    "course registration",
  ],
  authors: [
    {
      name: "University of Agriculture, Faisalabad",
      url: "https://www.uaf.edu.pk",
    },
  ],
  openGraph: {
    title: "UAF Digital Enrollment Portal",
    description: "Online enrollment and fee verification system for University of Agriculture Faisalabad",
    url: "https://eeform.uaf.edu.pk",
    siteName: "UAF Digital Enrollment Portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UAF Digital Enrollment Portal",
    description: "Online enrollment and fee verification system for UAF",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
