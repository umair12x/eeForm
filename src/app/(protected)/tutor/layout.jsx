'use client';
import Navbar  from "../../../components/HandlerNavbar";


export default function RootLayout({ children }) {
 
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
