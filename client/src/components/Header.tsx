import { Globe, Calendar } from "lucide-react";

const Header = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="container-wide py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Ukraine Digest</h1>
              <p className="text-sm text-muted-foreground">Global Coverage • Daily Snapshot</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{today}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
