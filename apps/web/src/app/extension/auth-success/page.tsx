"use client";

import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function ExtensionAuthSuccessPage() {
  const [closeFailed, setCloseFailed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.close();
      // If window.close() was blocked, show fallback
      setCloseFailed(true);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <CheckCircle className="mx-auto size-12 text-green-600" />
        <h1 className="mt-4 text-xl font-semibold">You're logged in!</h1>
        {closeFailed ? (
          <p className="mt-2 text-sm text-muted-foreground">
            You can close this tab and return to the Porygon extension.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            This tab will close automatically...
          </p>
        )}
      </div>
    </div>
  );
}
