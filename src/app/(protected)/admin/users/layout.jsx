import UsersManagementPage from "./page"
export const metadata = {
  title: "Users Management | Admin Portal - UAF",
  description: "Manage user accounts and permissions within the UAF Digital Enrollment Portal.",
};

export default function UsersManagementLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <UsersManagementPage />
    </div>
  )
}
