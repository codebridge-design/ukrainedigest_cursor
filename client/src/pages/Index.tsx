import Header from "@/components/Header";
import GlobalSnapshot from "@/components/GlobalSnapshot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <GlobalSnapshot />
      </main>
      <footer className="border-t border-border py-8 mt-12">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Ukraine Digest — Understanding how the world covers Ukraine
            </p>
            <p className="text-sm text-muted-foreground">
              Daily snapshot • {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
