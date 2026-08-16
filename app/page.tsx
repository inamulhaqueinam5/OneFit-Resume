import { auth } from "@clerk/nextjs/server";
import { LandingHero } from "@/app/components/LandingHero";

export default async function Home() {
  const { userId } = await auth();

  return <LandingHero signedIn={Boolean(userId)} />;
}
