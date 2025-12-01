import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transacao {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  data_transacao: string;
}

const categorias = {
  Receita: ["Sessão", "Consultoria", "Workshop", "Outros"],
  Despesa: ["Aluguel", "Materiais", "Marketing", "Transporte", "Outros"],
};

const Financeiro = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [stats, setStats] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
  });

  const [formData, setFormData] = useState({
    tipo: "Receita",
    categoria: "",
    descricao: "",
    valor: "",
    data_transacao: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    loadTransacoes();
  }, []);

  const loadTransacoes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("transacoes")
      .select("*")
      .eq("user_id", user.id)
      .order("data_transacao", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar transações");
    } else {
      setTransacoes(data || []);
      
      const receitas = data?.filter(t => t.tipo === "Receita").reduce((sum, t) => sum + Number(t.valor), 0) || 0;
      const despesas = data?.filter(t => t.tipo === "Despesa").reduce((sum, t) => sum + Number(t.valor), 0) || 0;
      
      setStats({
        receitas,
        despesas,
        saldo: receitas - despesas,
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const transacaoData = {
      user_id: user.id,
      tipo: formData.tipo,
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data_transacao: formData.data_transacao,
    };

    if (editingTransacao) {
      const { error } = await supabase
        .from("transacoes")
        .update(transacaoData)
        .eq("id", editingTransacao.id);

      if (error) {
        toast.error("Erro ao atualizar transação");
      } else {
        toast.success("Transação atualizada com sucesso!");
      }
    } else {
      const { error } = await supabase
        .from("transacoes")
        .insert([transacaoData]);

      if (error) {
        toast.error("Erro ao criar transação");
      } else {
        toast.success("Transação registrada com sucesso!");
      }
    }

    setDialogOpen(false);
    resetForm();
    loadTransacoes();
  };

  const handleEdit = (transacao: Transacao) => {
    setEditingTransacao(transacao);
    setFormData({
      tipo: transacao.tipo,
      categoria: transacao.categoria,
      descricao: transacao.descricao,
      valor: transacao.valor.toString(),
      data_transacao: transacao.data_transacao,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta transação?")) return;

    const { error } = await supabase
      .from("transacoes")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao remover transação");
    } else {
      toast.success("Transação removida com sucesso!");
      loadTransacoes();
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: "Receita",
      categoria: "",
      descricao: "",
      valor: "",
      data_transacao: format(new Date(), "yyyy-MM-dd"),
    });
    setEditingTransacao(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Financeiro</h2>
          <p className="text-muted-foreground">Controle suas receitas e despesas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTransacao ? "Editar Transação" : "Nova Transação"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value, categoria: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Receita">Receita</SelectItem>
                      <SelectItem value="Despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias[formData.tipo as keyof typeof categorias].map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_transacao">Data *</Label>
                  <Input
                    id="data_transacao"
                    type="date"
                    value={formData.data_transacao}
                    onChange={(e) => setFormData({ ...formData, data_transacao: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={2}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTransacao ? "Atualizar" : "Registrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ {stats.receitas.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ {stats.despesas.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {stats.saldo.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transacoes.map((transacao) => (
              <div 
                key={transacao.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${transacao.tipo === "Receita" ? "bg-success/10" : "bg-destructive/10"}`}>
                    {transacao.tipo === "Receita" ? (
                      <TrendingUp className={`w-5 h-5 text-success`} />
                    ) : (
                      <TrendingDown className={`w-5 h-5 text-destructive`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{transacao.descricao}</p>
                    <div className="flex gap-2 items-center mt-1">
                      <Badge variant="outline" className="text-xs">{transacao.categoria}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(transacao.data_transacao), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold ${transacao.tipo === "Receita" ? "text-success" : "text-destructive"}`}>
                    {transacao.tipo === "Receita" ? "+" : "-"} R$ {transacao.valor.toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(transacao)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(transacao.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {transacoes.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma transação registrada</h3>
                <p className="text-muted-foreground mb-4">Comece registrando suas receitas e despesas</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Transação
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;