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
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sessao {
  id: string;
  cliente_id: string;
  data_sessao: string;
  duracao_minutos: number;
  valor: number;
  status: string;
  pagamento_status: string;
  observacoes: string | null;
  clientes: { nome: string } | null;
}

const Sessoes = () => {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSessao, setEditingSessao] = useState<Sessao | null>(null);

  const [formData, setFormData] = useState({
    cliente_id: "",
    data_sessao: "",
    hora_sessao: "",
    duracao_minutos: "50",
    valor: "",
    status: "Agendada",
    pagamento_status: "Pendente",
    observacoes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [sessoesData, clientesData] = await Promise.all([
      supabase
        .from("sessoes")
        .select(`
          *,
          clientes (nome)
        `)
        .eq("user_id", user.id)
        .order("data_sessao", { ascending: false }),
      supabase
        .from("clientes")
        .select("*")
        .eq("user_id", user.id)
        .eq("ativo", true)
        .order("nome")
    ]);

    if (sessoesData.error) {
      toast.error("Erro ao carregar sessões");
    } else {
      setSessoes(sessoesData.data || []);
    }

    if (clientesData.error) {
      toast.error("Erro ao carregar clientes");
    } else {
      setClientes(clientesData.data || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sessaoData = {
      user_id: user.id,
      cliente_id: formData.cliente_id,
      data_sessao: `${formData.data_sessao}T${formData.hora_sessao}:00`,
      duracao_minutos: parseInt(formData.duracao_minutos),
      valor: parseFloat(formData.valor),
      status: formData.status,
      pagamento_status: formData.pagamento_status,
      observacoes: formData.observacoes || null,
    };

    if (editingSessao) {
      const { error } = await supabase
        .from("sessoes")
        .update(sessaoData)
        .eq("id", editingSessao.id);

      if (error) {
        toast.error("Erro ao atualizar sessão");
      } else {
        toast.success("Sessão atualizada com sucesso!");
      }
    } else {
      const { error } = await supabase
        .from("sessoes")
        .insert([sessaoData]);

      if (error) {
        toast.error("Erro ao criar sessão");
      } else {
        toast.success("Sessão agendada com sucesso!");
      }
    }

    setDialogOpen(false);
    resetForm();
    loadData();
  };

  const handleEdit = (sessao: Sessao) => {
    const dataHora = new Date(sessao.data_sessao);
    setEditingSessao(sessao);
    setFormData({
      cliente_id: sessao.cliente_id,
      data_sessao: format(dataHora, "yyyy-MM-dd"),
      hora_sessao: format(dataHora, "HH:mm"),
      duracao_minutos: sessao.duracao_minutos.toString(),
      valor: sessao.valor.toString(),
      status: sessao.status,
      pagamento_status: sessao.pagamento_status,
      observacoes: sessao.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta sessão?")) return;

    const { error } = await supabase
      .from("sessoes")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao remover sessão");
    } else {
      toast.success("Sessão removida com sucesso!");
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: "",
      data_sessao: "",
      hora_sessao: "",
      duracao_minutos: "50",
      valor: "",
      status: "Agendada",
      pagamento_status: "Pendente",
      observacoes: "",
    });
    setEditingSessao(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Agendada": "default",
      "Realizada": "secondary",
      "Cancelada": "destructive",
      "Faltou": "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPagamentoBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      "Pago": "default",
      "Pendente": "secondary",
      "Atrasado": "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
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
          <h2 className="text-3xl font-bold">Sessões</h2>
          <p className="text-muted-foreground">Gerencie seus agendamentos e sessões</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button disabled={clientes.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSessao ? "Editar Sessão" : "Nova Sessão"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="cliente_id">Cliente *</Label>
                  <Select
                    value={formData.cliente_id}
                    onValueChange={(value) => {
                      const cliente = clientes.find(c => c.id === value);
                      setFormData({
                        ...formData,
                        cliente_id: value,
                        valor: cliente?.valor_sessao.toString() || "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_sessao">Data *</Label>
                  <Input
                    id="data_sessao"
                    type="date"
                    value={formData.data_sessao}
                    onChange={(e) => setFormData({ ...formData, data_sessao: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora_sessao">Hora *</Label>
                  <Input
                    id="hora_sessao"
                    type="time"
                    value={formData.hora_sessao}
                    onChange={(e) => setFormData({ ...formData, hora_sessao: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracao_minutos">Duração (min) *</Label>
                  <Input
                    id="duracao_minutos"
                    type="number"
                    value={formData.duracao_minutos}
                    onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                    required
                  />
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
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agendada">Agendada</SelectItem>
                      <SelectItem value="Realizada">Realizada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                      <SelectItem value="Faltou">Faltou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pagamento_status">Pagamento *</Label>
                  <Select
                    value={formData.pagamento_status}
                    onValueChange={(value) => setFormData({ ...formData, pagamento_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSessao ? "Atualizar" : "Agendar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {clientes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Cadastre um cliente primeiro</h3>
            <p className="text-muted-foreground">Você precisa ter clientes cadastrados para agendar sessões</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessoes.map((sessao) => (
          <Card key={sessao.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {sessao.clientes?.nome}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(sessao.status)}
                    {getPagamentoBadge(sessao.pagamento_status)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(sessao)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(sessao.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {format(new Date(sessao.data_sessao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{sessao.duracao_minutos} minutos</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">Valor</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {sessao.valor.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessoes.length === 0 && clientes.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma sessão agendada</h3>
            <p className="text-muted-foreground mb-4">Comece agendando sua primeira sessão</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agendar Sessão
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sessoes;