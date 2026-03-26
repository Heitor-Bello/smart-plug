export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex gap-2">
          <span>registro:</span>
          <a href="/register" className="text-primary hover:underline">
            registar-se
          </a>
        </div>

        <div className="flex gap-2">
          <span>login:</span>
          <a href="/login" className="text-primary hover:underline">
            entrar
          </a>
        </div>

        <div className="flex gap-2">
          <span>perfil:</span>
          <a href="/profile" className="text-primary hover:underline">
            ver perfil
          </a>
        </div>

        <div className="flex gap-2">
          <span>dispositivos:</span>
          <a href="/dashboard/devices" className="text-primary hover:underline">
            ver dispositivos
          </a>
        </div>
      </main>
    </div>
  );
}
