"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="frame flex min-h-[60vh] flex-col items-start justify-center gap-6 py-24">
      <h1 className="display-lg text-white">Something went wrong on this page.</h1>
      <p className="text-muted">Reload to try again. If you were checking out, no payment has been taken unless you received a confirmation.</p>
      <Button onClick={reset}>Reload page</Button>
    </div>
  );
}
