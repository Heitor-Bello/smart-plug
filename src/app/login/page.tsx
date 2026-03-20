import { LoginBrandPanel } from "./_components/LoginBrandPanel";
import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
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
