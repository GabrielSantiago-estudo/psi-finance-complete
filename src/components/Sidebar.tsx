import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Settings,
  Brain
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", path: "/clientes", icon: Users },
  { title: "Sessões", path: "/sessoes", icon: Calendar },
  { title: "Financeiro", path: "/financeiro", icon: DollarSign },
  { title: "Relatórios", path: "/relatorios", icon: BarChart3 },
  { title: "Configurações", path: "/configuracoes", icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">PsiFinance</h2>
            <p className="text-xs text-muted-foreground">Gestão Financeira</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;