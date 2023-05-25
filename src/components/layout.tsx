import React, { type ReactNode } from "react";
import Navbar from "./navbar";
import Footer from "./footer";

export default function Layout({
  children,
  noLogo,
}: {
  children: ReactNode;
  noLogo?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar noLogo={noLogo} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
