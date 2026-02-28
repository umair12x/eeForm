import { Inter } from "next/font/google";
import "@/app/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {

  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="University of Agriculture Faisalabad - Digital Enrollment Portal for UG and PG programs"
        />
        <meta
          name="keywords"
          content="university enrollment, fee verification, UG form, GS-10 form, digital admission"
        />
        <meta name="author" content="University of Agriculture, Faisalabad" />
        <title>
          UAF Digital Enrollment Portal | Online Fee Verification & Course
          Registration
        </title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
