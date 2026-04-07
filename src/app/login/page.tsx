import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { LoginBrandPanel } from "./_components/LoginBrandPanel";
import { LoginForm } from "./_components/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession();
  if (session) redirect("/dashboard");
  return (
    <main className="min-h-screen bg-background flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:block lg:w-1/2 p-6">
        <LoginBrandPanel />
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <LoginForm />
      </div>
    </main>
  );
}
