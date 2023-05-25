import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();

  if (typeof window !== "undefined") {
    const redirect = window.sessionStorage.getItem("sign-in-redirect");
    void router.replace(redirect ?? "/");
  }

  return null;
}
