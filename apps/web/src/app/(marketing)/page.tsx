import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Porygon</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Create interactive product demos in minutes
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Build beautiful, interactive demos that convert.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </CardContent>
      </Card>
    </div>
  );
}
