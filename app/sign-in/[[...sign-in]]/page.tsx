import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Brand } from "@/app/components/Brand";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="newsprint-texture flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-8">
        <Brand />
      </div>
      <ClerkLoading>
        <p
          className="font-[family-name:var(--font-mono)] text-caption uppercase tracking-[0.08em] text-ink-muted"
          role="status"
        >
          Loading sign-in...
        </p>
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" />
      </ClerkLoaded>
    </div>
  );
}
