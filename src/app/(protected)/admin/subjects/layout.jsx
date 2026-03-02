import DegreeSchemeManager from "./page"

export const metadata = {
  title: "Degree's Schemes of Subjects | Admin Portal - UAF",
  description: "Create and manage degree schemes with subjects and credit hours.",
};

export default function layout() {
  return (
   <DegreeSchemeManager />
  )
}
