import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Box, 
  Calculator, 
  ClipboardList, 
  Cog, 
  Database, 
  FileText, 
  Home, 
  LayoutDashboard, 
  Menu, 
  Package, 
  Scissors, 
  Wallet,
  Calendar,
  Users,
  Search,
  Plus
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { dbService } from "./lib/db";
import { StockPage } from "./pages/StockPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { QuotationsPage } from "./pages/QuotationsPage";
import { FinancePage } from "./pages/FinancePage";
import { CutSheetPage } from "./pages/CutSheetPage";
import { ConfigPage } from "./pages/ConfigPage";

// --- MOCK PAGES (To be implemented) ---
const Dashboard = ({ setPage }: { setPage: (p: string) => void }) => {
  const [stats, setStats] = useState({
    estoque: 0,
    produtos: 0,
    orcamentos: 0,
    pendentes: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const estoque = await dbService.count('produtos');
      const produtos = await dbService.count('produtos_compostos');
      const orcamentos = await dbService.count('orcamentos');
      setStats({ estoque, produtos, orcamentos, pendentes: 0 });
    };
    loadStats();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* Identity Header */}
      <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-6">
        <div className="flex flex-col">
          <span className="bento-label mb-1">Squad Management System</span>
          <h1 className="text-3xl font-light tracking-tight">SQUAD <span className="font-bold">SYSTEMS</span></h1>
        </div>
        <div className="text-right">
          <span className="bento-label block">Asset Version</span>
          <span className="font-mono text-sm opacity-60">SQUAD-2026-V.02</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Primary Mark Card Style */}
        <Card className="md:col-span-12 lg:col-span-5 flex flex-col justify-center items-center relative p-8 min-h-[300px] overflow-hidden group">
          <span className="absolute top-4 left-4 bento-label !opacity-30">01 / Primary Status</span>
          <div className="w-40 h-40 border-[10px] border-white/80 flex items-center justify-center relative translate-y-2 transition-transform duration-500 group-hover:scale-105">
            <div className="w-full h-[1px] bg-white/40 rotate-45 absolute"></div>
            <div className="w-full h-[1px] bg-white/40 -rotate-45 absolute"></div>
            <div className="w-10 h-10 bg-white text-black z-10 flex items-center justify-center font-serif font-bold text-2xl">S</div>
          </div>
          <div className="mt-8 text-center">
            <div className="text-2xl font-bold tracking-tighter uppercase mb-1 font-serif">Squad Professional</div>
            <div className="bento-label !opacity-60 tracking-[0.4em]">Integrated Solution</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </Card>

        {/* Info Grid */}
        <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 flex flex-col justify-between hover:bg-bento-card-light transition-all">
             <span className="bento-label mb-4">02 / Inventory Control</span>
             <div className="flex justify-between items-end mt-auto">
               <div>
                 <div className="text-4xl font-light font-mono italic">{stats.estoque}</div>
                 <div className="text-[9px] opacity-40 uppercase mt-1">Materiais em estoque</div>
               </div>
               <Package className="h-8 w-8 opacity-20" />
             </div>
          </Card>
          
          <Card className="p-6 flex flex-col justify-between hover:bg-bento-card-light transition-all">
             <span className="bento-label mb-4">03 / Production Pipeline</span>
             <div className="flex justify-between items-end mt-auto">
               <div>
                 <div className="text-4xl font-light font-mono italic">{stats.produtos}</div>
                 <div className="text-[9px] opacity-40 uppercase mt-1">Projetos ativos</div>
               </div>
               <Box className="h-8 w-8 opacity-20" />
             </div>
          </Card>

          <Card className="md:col-span-2 p-6 flex flex-col hover:bg-bento-card-light transition-all bg-white text-black">
             <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-8 border-b border-black/10 pb-2">04 / Financial Position</span>
             <div className="flex justify-between items-center">
               <div className="space-y-1">
                 <div className="text-3xl font-serif font-bold tracking-tighter">R$ 12.450,00</div>
                 <div className="text-[10px] uppercase tracking-widest opacity-60">Estimated Revenue · Q2 2026</div>
               </div>
               <div className="h-12 w-12 border-2 border-black flex items-center justify-center font-bold text-lg">FC</div>
             </div>
          </Card>
        </div>

        {/* Action Belt */}
        <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Button variant="outline" className="h-32 flex flex-col gap-3 rounded-sm border-white/10 hover:border-white/30 bg-transparent uppercase tracking-wider text-[10px]" onClick={() => setPage('orcamentos')}>
            <Plus className="h-5 w-5" />
            New Quote
          </Button>
          <Button variant="outline" className="h-32 flex flex-col gap-3 rounded-sm border-white/10 hover:border-white/30 bg-transparent uppercase tracking-wider text-[10px]" onClick={() => setPage('estoque')}>
            <Search className="h-5 w-5" />
            Stock Search
          </Button>
          <Button variant="outline" className="h-32 flex flex-col gap-3 rounded-sm border-white/10 hover:border-white/30 bg-transparent uppercase tracking-wider text-[10px]" onClick={() => setPage('corte')}>
            <Scissors className="h-5 w-5" />
            Cut Sheets
          </Button>
          <Button variant="outline" className="h-32 flex flex-col gap-3 rounded-sm border-white/10 hover:border-white/30 bg-transparent uppercase tracking-wider text-[10px]" onClick={() => setPage('financeiro')}>
            <Wallet className="h-5 w-5" />
            Cash Flow
          </Button>
          <Card className="h-32 p-4 flex flex-col justify-between bento-accent-emerald border-none hidden lg:flex">
             <span className="text-[9px] font-bold uppercase tracking-widest">System Cloud Sync</span>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
               <span className="text-[10px] uppercase tracking-widest font-bold">Active</span>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Navigation = ({ current, setPage }: { current: string, setPage: (p: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'estoque', label: 'Estoque', icon: Database },
    { id: 'projetos', label: 'Projetos', icon: Box },
    { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'financeiro', label: 'Financeiro', icon: Wallet },
    { id: 'corte', label: 'Planilha de Corte', icon: Scissors },
    { id: 'config', label: 'Configurações', icon: Cog },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-6 mb-4">
        <div className="flex flex-col gap-4">
          <div className="w-10 h-10 border-2 border-white flex items-center justify-center relative bg-white text-black">
             <div className="w-full h-[0.5px] bg-black rotate-45 absolute" />
             <div className="w-full h-[0.5px] bg-black -rotate-45 absolute" />
             <span className="font-serif font-bold text-xl z-10">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-[0.4em] font-bold opacity-40">System Access</span>
            <div className="font-serif font-bold text-2xl tracking-tighter">SQUAD</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarMenu className="gap-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                onClick={() => setPage(item.id)} 
                isActive={current === item.id}
                className={cn(
                  "hover:bg-white/10 rounded-none transition-all duration-300",
                  current === item.id ? "bg-white text-black hover:bg-white border-l-4 border-bento-copper" : "border-l-4 border-transparent"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="uppercase tracking-widest text-[10px] font-bold">{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t border-white/10 bg-black/40">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-left">
            Gestão de Esquadrias
          </span>
          <span className="font-mono text-[9px] opacity-30">LIC: 2026-X88-FF</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

const MainContent = () => {
  const { isLicensed, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">Carregando Sistema...</p>
      </div>
    );
  }

  if (!isLicensed) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ativação Necessária</CardTitle>
            <CardDescription>O sistema SQUAD requer uma licença válida para operar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded font-mono text-center text-sm uppercase">
               {localStorage.getItem('_of_machine_id') || 'ERRO-ID'}
            </div>
            <p className="text-[11px] text-muted-foreground text-center">Copie o ID acima e envie para o suporte para obter sua chave.</p>
            <textarea 
              className="w-full h-24 p-3 rounded border text-sm focus:outline-primary"
              placeholder="Cole sua chave aqui..."
            />
            <Button className="w-full">Ativar Licença</Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">Desenvolvido por Emerson 🏗️</p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard setPage={setCurrentPage} />;
      case 'estoque': return <StockPage />;
      case 'projetos': return <ProjectsPage />;
      case 'orcamentos': return <QuotationsPage />;
      case 'financeiro': return <FinancePage />;
      case 'corte': return <CutSheetPage />;
      case 'config': return <ConfigPage />;
      default: return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-full gap-4">
           <LayoutDashboard className="h-12 w-12 text-muted-foreground opacity-20" />
           <p className="text-muted-foreground italic">Página "{currentPage}" em desenvolvimento para a nova versão.</p>
           <Button variant="outline" onClick={() => setCurrentPage('dashboard')}>Voltar ao Início</Button>
        </div>
      );
    }
  }

  return (
    <SidebarProvider>
      <Navigation current={currentPage} setPage={setCurrentPage} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/80 backdrop-blur z-10 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="text-sm font-medium flex items-center gap-2">
              <span className="text-muted-foreground capitalize">{currentPage}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Badge variant="outline" className="hidden sm:inline-flex gap-1 items-center bg-green-50 text-green-700 border-green-100">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               Online
             </Badge>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}

// Helper types normally in separate files
const CardFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pt-0 flex items-center ${className}`}>{children}</div>
);
