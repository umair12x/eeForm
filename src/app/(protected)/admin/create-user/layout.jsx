import CreateUserPage from "./page";
export const metadata = {
  title: "Create New User | Admin Portal - UAF",
  description:
    "Create new user accounts with appropriate roles and permissions.",
};
export default function createUserLayout() {
  return (
      <CreateUserPage />
  );
}
