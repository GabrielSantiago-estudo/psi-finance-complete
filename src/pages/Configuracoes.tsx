import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Lock, Bell, Shield } from "lucide-react";

interface Profile {
  nome: string;
  email: string;
  telefone: string | null;
  crp: string | null;
  especializacao: string | null;
  dark_mode: boolean;
  notificacoes_email: boolean;
}

const Configuracoes = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    nome: "",
    email: "",
    telefone: "",
    crp: "",
    especializacao: "",
    dark_mode: false,
    notificacoes_email: true,
  });

  const [senhaData, setSenhaData] = useState({
    novaSenha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      toast.error("Erro ao carregar perfil");
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        nome: profile.nome,
        telefone: profile.telefone,
        crp: profile.crp,
        especializacao: profile.especializacao,
        dark_mode: profile.dark_mode,
        notificacoes_email: profile.notificacoes_email,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      toast.error("As senhas não coincidem!");
      return;
    }

    if (senhaData.novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: senhaData.novaSenha,
    });

    if (error) {
      toast.error("Erro ao alterar senha");
    } else {
      toast.success("Senha alterada com sucesso!");
      setSenhaData({ novaSenha: "", confirmarSenha: "" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">Gerencie suas preferências e informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <CardTitle>Perfil</CardTitle>
          </div>
          <CardDescription>Atualize suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={profile.nome}
                  onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={profile.telefone || ""}
                  onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crp">CRP</Label>
                <Input
                  id="crp"
                  value={profile.crp || ""}
                  onChange={(e) => setProfile({ ...profile, crp: e.target.value })}
                  placeholder="00/00000"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="especializacao">Especialização</Label>
                <Input
                  id="especializacao"
                  value={profile.especializacao || ""}
                  onChange={(e) => setProfile({ ...profile, especializacao: e.target.value })}
                  placeholder="Ex: Psicologia Clínica, Terapia Cognitivo-Comportamental"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <CardTitle>Segurança</CardTitle>
          </div>
          <CardDescription>Altere sua senha</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <Input
                  id="novaSenha"
                  type="password"
                  value={senhaData.novaSenha}
                  onChange={(e) => setSenhaData({ ...senhaData, novaSenha: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  value={senhaData.confirmarSenha}
                  onChange={(e) => setSenhaData({ ...senhaData, confirmarSenha: e.target.value })}
                  placeholder="Digite novamente"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Notificações</CardTitle>
          </div>
          <CardDescription>Configure suas preferências de notificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações por Email</p>
              <p className="text-sm text-muted-foreground">Receba lembretes de sessões e atualizações</p>
            </div>
            <Switch
              checked={profile.notificacoes_email}
              onCheckedChange={(checked) => {
                setProfile({ ...profile, notificacoes_email: checked });
                handleSaveProfile(new Event('submit') as any);
              }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modo Escuro</p>
              <p className="text-sm text-muted-foreground">Ative o tema escuro</p>
            </div>
            <Switch
              checked={profile.dark_mode}
              onCheckedChange={(checked) => {
                setProfile({ ...profile, dark_mode: checked });
                handleSaveProfile(new Event('submit') as any);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          </div>
          <CardDescription>Ações irreversíveis da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => toast.error("Funcionalidade em desenvolvimento")}>
            Excluir Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;