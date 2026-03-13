import { Button } from "@porygon/ui/components/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Porygon</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Create interactive product demos in minutes
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
