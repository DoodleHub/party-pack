import { Header } from "@/components/Header";
import { SignupForm } from "@/components/auth/SignupForm";
import { ControllerIcon } from "@/components/ui/Icon";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-1 flex-col bg-surface font-sans">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-card p-8 shadow-sm ring-1 ring-card-foreground/5">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
              <ControllerIcon className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-card-foreground">
              Create Your Account
            </h1>
            <p className="text-sm text-card-muted">
              Join PartyPack to host rooms and play with friends.
            </p>
          </div>
          <SignupForm next={next} />
        </div>
      </main>
    </div>
  );
}
