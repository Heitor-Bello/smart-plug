import { LoginBrandPanel } from "@/app/login/_components/LoginBrandPanel";
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-background flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:block lg:w-1/2 p-6">
        <LoginBrandPanel />
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
