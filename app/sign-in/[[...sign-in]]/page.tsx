import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Brand } from "@/app/components/Brand";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-cream-paper px-14 py-70">
      <div className="mb-28">
        <Brand />
      </div>
      <ClerkLoading>
        <p className="text-body text-charcoal" role="status">
          Loading sign-in...
        </p>
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" />
      </ClerkLoaded>
    </div>
  );
}
