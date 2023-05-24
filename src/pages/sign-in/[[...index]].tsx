import { SignIn } from "@clerk/nextjs";
import { H1 } from "~/components/ui/typography";

export default function Page() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <H1 className="mb-8">Tycher 來考試</H1>
      <SignIn />
    </div>
  );
}
