import { SignUp } from "@clerk/nextjs";
import { Brand } from "@/app/components/Brand";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-cream-paper px-14 py-70">
      <div className="mb-28">
        <Brand />
      </div>
      <SignUp appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
