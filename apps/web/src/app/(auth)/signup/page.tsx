import type { Metadata } from "next";

import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up - Porygon",
};

export default function SignupPage() {
  return <SignupForm />;
}
