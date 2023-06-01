import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { H1 } from "~/components/ui/typography";
import Image from "next/image";

export default function Page() {
  const router = useRouter();

  const redirect = Array.isArray(router.query.redirect)
    ? router.query.redirect[0]
    : router.query.redirect;

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <Image src="/tycher.svg" width={48} height={48} alt="Logo" />
      <H1 className="mb-8 mt-2">Tycher 來考試</H1>
      <div className="min-h-[222px]">
        <SignIn
          signUpUrl="/sign-up"
          redirectUrl={redirect}
          appearance={{
            elements: {
              footer: "hidden -mt-8",
            },
          }}
        />
      </div>
    </div>
  );
}
