import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Calendar, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    sessoesHoje: 0,
    receitaMes: 0,
    crescimento: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [clientes, sessoes, transacoes] = await Promise.all([
      supabase.from("clientes").select("*").eq("user_id", user.id).eq("ativo", true),
      supabase.from("sessoes").select("*").eq("user_id", user.id),
      supabase.from("transacoes").select("*").eq("user_id", user.id).eq("tipo", "Receita"),
    ]);

    const hoje = new Date().toISOString().split("T")[0];
    const sessoesHoje = sessoes.data?.filter(s => 
      s.data_sessao.startsWith(hoje)
    ).length || 0;

    const mesAtual = new Date().getMonth();
    const receitaMes = transacoes.data?.filter(t => 
      new Date(t.data_transacao).getMonth() === mesAtual
    ).reduce((sum, t) => sum + Number(t.valor), 0) || 0;

    setStats({
      totalClientes: clientes.data?.length || 0,
      sessoesHoje,
      receitaMes,
      crescimento: 12.5,
    });
    setLoading(false);
  };

  const revenueData = [
    { month: "Jan", receita: 4200, despesas: 2400 },
    { month: "Fev", receita: 5100, despesas: 2800 },
    { month: "Mar", receita: 4800, despesas: 2600 },
    { month: "Abr", receita: 6200, despesas: 3100 },
    { month: "Mai", receita: 5800, despesas: 2900 },
    { month: "Jun", receita: 7400, despesas: 3400 },
  ];

  const sessionsData = [
    { dia: "Seg", sessoes: 4 },
    { dia: "Ter", sessoes: 6 },
    { dia: "Qua", sessoes: 5 },
    { dia: "Qui", sessoes: 7 },
    { dia: "Sex", sessoes: 5 },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral das suas atividades</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.receitaMes.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+{stats.crescimento}% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">Clientes ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessoesHoje}</div>
            <p className="text-xs text-muted-foreground">Agendadas para hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.crescimento}%</div>
            <p className="text-xs text-muted-foreground">Comparado ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="despesas" stroke="hsl(var(--destructive))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessões por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessoes" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;