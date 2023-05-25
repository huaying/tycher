import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { H1 } from "~/components/ui/typography";

export default function Page() {
  const router = useRouter();

  const redirect = Array.isArray(router.query.redirect)
    ? router.query.redirect[0]
    : router.query.redirect;

  if (redirect && typeof window !== "undefined") {
    window.sessionStorage.setItem("sign-in-redirect", redirect);
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <H1 className="mb-8">Tycher 來考試</H1>
      <SignIn
        signUpUrl="/sign-up"
        redirectUrl="/sign-in/redirect"
        appearance={{
          elements: {
            footer: "hidden -mt-8",
          },
        }}
      />
    </div>
  );
}
