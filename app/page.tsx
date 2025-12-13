import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center gap-4">
      <Button>Start Adventure</Button>
      <Button variant="secondary">Load Game</Button>
    </div>
  );
}
