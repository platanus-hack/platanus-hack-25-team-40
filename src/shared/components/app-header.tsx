import { useUser, signOut } from "@/shared/hooks/useAuth";
import { Button } from "@/shared/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export function AppHeader() {
  const router = useRouter();
  const user = useUser();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => router.navigate({ to: "/dashboard" })}>
            <img src="/src/assets/oregon.svg" alt="Oregon Health" className="h-14 w-14 text-primary" />
            <span className="text-xl font-bold">Oregon Health</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.navigate({ to: "/profile" })}
              title="View Profile"
            >
              <User className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.navigate({ to: "/settings" })}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
