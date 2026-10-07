import { redirect } from "next/navigation";

// A proper landing page comes in Milestone 5; until then, go straight to the dashboard.
export default function Home() {
  redirect("/dashboard");
}
