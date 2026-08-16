import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import { Brand } from "@/app/components/Brand";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
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
