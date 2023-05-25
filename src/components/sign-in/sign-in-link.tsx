import Link from "next/link";
import { useRouter } from "next/router";

export default function SignInLink({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  return <Link href={`/sign-in?redirect=${router.asPath}`}>{children}</Link>;
}
