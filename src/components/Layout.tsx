import React, { type ReactNode } from "react";
import Navbar from "./navbar";

export default function Layout({
  children,
  noLogo,
}: {
  children: ReactNode;
  noLogo?: boolean;
}) {
  return (
    <>
      <Navbar noLogo={noLogo} />
      {children}
    </>
  );
}
