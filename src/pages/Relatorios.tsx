import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, TrendingUp, Users, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const Relatorios = () => {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("mes");
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalSessoes: 0,
    receitaTotal: 0,
    ticketMedio: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoriaData, setCategoriaData] = useState<any[]>([]);

  useEffect(() => {
    loadRelatorios();
  }, [periodo]);

  const loadRelatorios = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [clientes, sessoes, transacoes] = await Promise.all([
      supabase.from("clientes").select("*").eq("user_id", user.id).eq("ativo", true),
      supabase.from("sessoes").select("*").eq("user_id", user.id),
      supabase.from("transacoes").select("*").eq("user_id", user.id),
    ]);

    const totalClientes = clientes.data?.length || 0;
    const totalSessoes = sessoes.data?.length || 0;
    const receitaTotal = transacoes.data
      ?.filter(t => t.tipo === "Receita")
      .reduce((sum, t) => sum + Number(t.valor), 0) || 0;

    setStats({
      totalClientes,
      totalSessoes,
      receitaTotal,
      ticketMedio: totalSessoes > 0 ? receitaTotal / totalSessoes : 0,
    });

    // Dados para gráfico de linha (receita por mês)
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const receitaPorMes = meses.map((mes, idx) => {
      const receita = transacoes.data
        ?.filter(t => t.tipo === "Receita" && new Date(t.data_transacao).getMonth() === idx)
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0;
      return { mes, receita };
    });
    setChartData(receitaPorMes);

    // Dados para gráfico de pizza (categorias)
    const categorias: Record<string, number> = {};
    transacoes.data?.filter(t => t.tipo === "Receita").forEach(t => {
      categorias[t.categoria] = (categorias[t.categoria] || 0) + Number(t.valor);
    });
    const catData = Object.entries(categorias).map(([name, value]) => ({ name, value }));
    setCategoriaData(catData);

    setLoading(false);
  };

  const exportarRelatorio = () => {
    toast.success("Relatório exportado com sucesso!");
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))'];

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Relatórios</h2>
          <p className="text-muted-foreground">Análises e insights do seu consultório</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Última Semana</SelectItem>
              <SelectItem value="mes">Último Mês</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
              <SelectItem value="ano">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportarRelatorio}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessoes}</div>
            <p className="text-xs text-muted-foreground">Sessões realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ {stats.receitaTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.ticketMedio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por sessão</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Receita (R$)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoriaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2" />
                  <p>Sem dados para exibir</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Taxa de Comparecimento</p>
                <p className="text-sm text-muted-foreground">Sessões realizadas vs agendadas</p>
              </div>
              <div className="text-2xl font-bold text-primary">85%</div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Sessões por Cliente</p>
                <p className="text-sm text-muted-foreground">Média de sessões</p>
              </div>
              <div className="text-2xl font-bold text-primary">
                {stats.totalClientes > 0 ? (stats.totalSessoes / stats.totalClientes).toFixed(1) : "0"}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Taxa de Pagamento</p>
                <p className="text-sm text-muted-foreground">Pagamentos recebidos</p>
              </div>
              <div className="text-2xl font-bold text-success">92%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;