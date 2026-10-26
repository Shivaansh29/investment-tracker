import { ChartPie } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** Centered card that frames the login and sign-up forms. */
export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-3 text-center">
        <span className="from-hero-from to-hero-to mx-auto flex size-11 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md">
          <ChartPie className="size-5.5" aria-hidden />
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">{children}</CardContent>
      </Card>

      <p className="text-muted-foreground text-center text-sm">{footer}</p>
    </div>
  );
}
