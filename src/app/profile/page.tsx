import { ButtonSignOut } from "./_components/button-signout";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

export default async function Profile() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto min-h-screen flex items-center justify-center flex-col">
      <h1 className="text-2xl font-bold mb-2">Página de perfil</h1>
      <h3>Usuario logado: {session?.user?.name}</h3>
      <ButtonSignOut />
    </div>
  );
}
