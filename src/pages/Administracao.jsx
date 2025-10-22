
import React, { useState, useMemo, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Shield,
  Users,
  DollarSign,
  Eye,
  Check,
  X,
  MessageSquare,
  Headphones,
  Settings,
  Search,
  Clock,
  Download,
  Calendar,
  Activity,
  AlertTriangle,
  Mail,
  User,
  ExternalLink,
  Bot,
  Loader,
  Save,
  Send
} from "lucide-react";
import { format, startOfMonth, formatDistanceToNow } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AdminAssistantTab from "@/components/admin/AdminAssistantTab";
import AdminDashboardTab from "@/components/admin/AdminDashboardTab";
import InadimplentesTab from "@/components/admin/InadimplentesTab";
import { cn } from "@/lib/utils"; // Assuming cn utility is available here

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Administracao() {
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { toast } = useToast();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("resumo");
  const [buscaEmpresa, setBuscaEmpresa] = useState("");
  const [selectedPagamento, setSelectedPagamento] = useState(null);
  const [isComprovanteOpen, setIsComprovanteOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [ticketResponse, setTicketResponse] = useState("");
  const [systemConfigs, setSystemConfigs] = useState({});
  const debouncedBusca = useDebounce(buscaEmpresa, 300);

  const isAdmin = user?.role === 'admin';

  // Efeito para ler a URL e mudar a aba
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Queries para dados das abas
  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['allUsersAdmin', debouncedBusca],
    queryFn: () => debouncedBusca ? base44.entities.User.filter({ full_name: { contains: debouncedBusca }}) : base44.entities.User.list(),
    enabled: isAdmin,
  });

  const { data: pagamentosPendentes = [], isLoading: isLoadingPagamentos } = useQuery({
    queryKey: ['pagamentosPendentesAdmin'],
    queryFn: () => base44.entities.Pagamento.filter({ status: 'aguardando_verificacao' }, '-created_date'),
    enabled: isAdmin,
  });

  const { data: openTickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ['openTicketsAdmin'],
    queryFn: () => base44.entities.SuporteTicket.filter({ status: 'aberto' }, '-created_date'),
    enabled: isAdmin,
  });

  const { data: openChats = [], isLoading: isLoadingChats } = useQuery({
    queryKey: ['openChatsAdmin'],
    queryFn: () => base44.entities.ChatConversa.filter({ status: 'aberto' }, '-last_message_date'),
    enabled: isAdmin,
  });

  const { data: initialSystemConfigs = [], isLoading: isLoadingSystemConfigs } = useQuery({
    queryKey: ['allSystemConfigs'],
    queryFn: () => base44.entities.Configuracao.list(),
    enabled: isAdmin,
  });
  
  const { data: initialPublicConfigs = [] } = useQuery({
    queryKey: ['configuracoesPublicas'],
    queryFn: () => base44.entities.ConfiguracaoPublica.list(),
    enabled: isAdmin,
  });

  useEffect(() => {
    const configsMap = {};
    [...initialSystemConfigs, ...initialPublicConfigs].forEach(c => {
        configsMap[c.chave] = {
            id: c.id,
            valor: c.valor,
            descricao: c.descricao,
            isPublic: !!initialPublicConfigs.find(pc => pc.id === c.id),
        };
    });
    setSystemConfigs(configsMap);
}, [initialSystemConfigs, initialPublicConfigs, isLoadingSystemConfigs]);


  // Contadores para badges
  const pagamentosAguardandoCount = pagamentosPendentes.length;
  const openTicketsCount = openTickets.length;
  const unreadChatsCount = openChats.filter(c => c.unread_admin).length;

  // Mutações
  const updatePagamentoMutation = useMutation({
    mutationFn: ({ id, status, observacoes }) => base44.entities.Pagamento.update(id, { status, observacoes, verificado_por: user.email, data_verificacao: new Date().toISOString() }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pagamentosPendentesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      // Atualiza o status do usuário se o pagamento for aprovado
      if(data.status === 'aprovado') {
          base44.entities.User.update(data.empresa_id, { status: 'ativo' });
          queryClient.invalidateQueries({ queryKey: ['allUsersAdmin'] });
      }
      setIsComprovanteOpen(false);
      toast({ title: `Pagamento ${data.status}`, description: `O pagamento de ${data.empresa_nome} foi atualizado.` });
    },
  });

  const resolveTicketMutation = useMutation({
    mutationFn: ({ id, resposta }) => base44.entities.SuporteTicket.update(id, { status: 'resolvido', resposta, resolvido_por: user.email, data_resolucao: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openTicketsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      setIsTicketOpen(false);
      setTicketResponse("");
      toast({ title: "Ticket Resolvido!", variant: "success" });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ id, valor, isPublic }) => {
      const entity = isPublic ? base44.entities.ConfiguracaoPublica : base44.entities.Configuracao;
      return entity.update(id, { valor });
    },
    onSuccess: () => {
        toast({ title: "Configuração Salva!", variant: "success" });
        queryClient.invalidateQueries({ queryKey: ['allSystemConfigs'] });
        queryClient.invalidateQueries({ queryKey: ['configuracoesPublicas'] });
    },
    onError: (err) => {
        toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['allUsersAdmin'] });
        toast({ 
            title: "Usuário Atualizado!", 
            description: `A conta de ${data.full_name} agora é ${variables.data.is_demo_account ? 'uma conta de demonstração.' : 'uma conta padrão.'}`,
            variant: "success" 
        });
    },
    onError: (err) => {
        toast({ title: "Erro ao atualizar usuário", description: err.message, variant: "destructive" });
    }
  });


  // Handlers
  const handleUpdatePagamento = (status) => {
    if (!selectedPagamento) return;
    updatePagamentoMutation.mutate({ id: selectedPagamento.id, status, observacoes: `Pagamento ${status} pelo admin.` });
  };
  
  const handleResolveTicket = () => {
    if (!selectedTicket || !ticketResponse) return;
    resolveTicketMutation.mutate({ id: selectedTicket.id, resposta: ticketResponse });
  };
  
  const handleConfigChange = (chave, valor) => {
    setSystemConfigs(prev => ({ ...prev, [chave]: { ...prev[chave], valor } }));
  };

  const handleSaveConfig = (chave) => {
      const config = systemConfigs[chave];
      if (config) {
          updateConfigMutation.mutate({ id: config.id, valor: config.valor, isPublic: config.isPublic });
      }
  };

  const handleToggleDemoAccount = (targetUser) => {
    updateUserMutation.mutate({
      userId: targetUser.id,
      data: { is_demo_account: !targetUser.is_demo_account },
    });
  };

  if (isLoadingUser) return <div className="flex justify-center items-center h-screen"><Loader className="w-8 h-8 animate-spin" /></div>;
  if (!isAdmin) return <div className="p-8 text-center text-red-500">Acesso negado. Esta área é restrita para administradores.</div>;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
      <div className="mx-auto">
        <div className="mb-8 p-6 bg-slate-700/50 rounded-xl shadow-lg border border-slate-600">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Shield className="w-8 h-8 text-cyan-400" /> Administração</h1>
          <p className="text-slate-400 mt-1">Painel de controle com acesso total aos recursos e dados do sistema.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 mb-6 h-auto p-1 bg-slate-700 rounded-lg border border-slate-600">
            {['resumo', 'users', 'inadimplentes', 'verificacao', 'tickets', 'chat', 'configs', 'ia_console'].map(tab => (
              <TabsTrigger 
                key={tab} 
                value={tab} 
                className="capitalize py-2 text-slate-300 data-[state=active]:bg-slate-900/80 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md relative"
              >
                {tab.replace('_', ' ')}
                {tab === 'verificacao' && pagamentosAguardandoCount > 0 && <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                {tab === 'tickets' && openTicketsCount > 0 && <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                {tab === 'chat' && unreadChatsCount > 0 && <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Aba Resumo */}
          <TabsContent value="resumo"><AdminDashboardTab /></TabsContent>
          
          {/* Aba Clientes */}
          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle>Todos os Clientes ({allUsers.length})</CardTitle>
                    <Input placeholder="Buscar empresa por nome..." value={buscaEmpresa} onChange={(e) => setBuscaEmpresa(e.target.value)} className="mt-4 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoadingUsers ? <Loader className="animate-spin" /> : allUsers.map(u => (
                            <Card key={u.id} className="bg-slate-700/50 border-slate-600 flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-start text-lg">
                                        <span className="truncate pr-2">{u.full_name || 'Nome não definido'}</span>
                                        <Badge variant={u.status === 'ativo' ? 'success' : 'destructive'}>{u.status}</Badge>
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 truncate">{u.email}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-end">
                                    <p className="text-sm mb-4">Membro desde: {format(new Date(u.created_date), 'dd/MM/yyyy')}</p>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Link to={createPageUrl(`UsuarioDetalhes?id=${u.id}`)} className="flex-1">
                                            <Button variant="outline" className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900">Ver Detalhes</Button>
                                        </Link>
                                        <Button
                                            onClick={() => handleToggleDemoAccount(u)}
                                            variant={u.is_demo_account ? "default" : "secondary"}
                                            className={cn("flex-1", u.is_demo_account && "bg-amber-500 hover:bg-amber-600 text-white")}
                                            disabled={updateUserMutation.isPending && updateUserMutation.variables?.userId === u.id}
                                        >
                                            {u.is_demo_account ? "Remover Demo" : "Tornar Demo"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Inadimplentes */}
          <TabsContent value="inadimplentes"><InadimplentesTab /></TabsContent>

          {/* Aba Verificação de Pagamentos */}
          <TabsContent value="verificacao">
             <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-cyan-400"/>
                  <div>
                    <CardTitle>Verificação de Pagamentos ({pagamentosAguardandoCount})</CardTitle>
                    <CardDescription>Clientes que enviaram comprovante e aguardam liberação de acesso.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPagamentos ? <Loader className="animate-spin"/> : pagamentosPendentes.map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600 gap-4">
                    <div>
                      <p className="font-bold text-lg">{p.empresa_nome}</p>
                      <p className="text-slate-400">Enviado {formatDistanceToNow(new Date(p.updated_date), { addSuffix: true, locale: ptBR })}</p>
                      <p className="font-semibold text-cyan-400 text-xl mt-1">R$ {p.valor.toFixed(2)} <span className="text-slate-400 font-normal text-base">ref. {p.mes_referencia}</span></p>
                    </div>
                    <div className="flex gap-2 self-end sm:self-center">
                      <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900" onClick={() => {setSelectedPagamento(p); setIsComprovanteOpen(true);}}>
                        <Eye className="w-4 h-4 mr-2" />Ver Comprovante
                      </Button>
                    </div>
                  </div>
                ))}
                {pagamentosAguardandoCount === 0 && !isLoadingPagamentos && <p className="text-center text-slate-400 py-8">Nenhum pagamento pendente de verificação.</p>}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Aba Tickets */}
          <TabsContent value="tickets">
              <Card className="bg-slate-800 border-slate-700">
                  <CardHeader><CardTitle>Tickets de Suporte Abertos ({openTicketsCount})</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      {isLoadingTickets ? <Loader className="animate-spin"/> : openTickets.map(t => (
                          <div key={t.id} className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                              <div>
                                  <p className="font-bold text-lg">{t.assunto}</p>
                                  <p className="text-slate-400">De: {t.cliente_nome} ({t.cliente_email})</p>
                                  <p className="text-sm mt-2 italic">"{t.mensagem}"</p>
                              </div>
                              <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900" onClick={() => { setSelectedTicket(t); setIsTicketOpen(true); }}>
                                  <Eye className="w-4 h-4 mr-2" />Ver e Responder
                              </Button>
                          </div>
                      ))}
                      {openTicketsCount === 0 && !isLoadingTickets && <p className="text-center text-slate-400 py-8">Nenhum ticket de suporte aberto.</p>}
                  </CardContent>
              </Card>
          </TabsContent>

          {/* Aba Chat */}
          <TabsContent value="chat">
              <Card className="bg-slate-800 border-slate-700">
                  <CardHeader><CardTitle>Chats Ativos ({openChats.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                     {isLoadingChats ? <Loader className="animate-spin" /> : openChats.map(c => (
                         <Link to={createPageUrl(`ChatAdmin?conversaId=${c.id}`)} key={c.id}>
                            <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors">
                                <div>
                                    <p className="font-bold text-lg">{c.assunto}</p>
                                    <p className="text-slate-400">De: {c.usuario_nome}</p>
                                    <p className="text-sm mt-2 italic">Última msg: "{c.last_message_preview}"</p>
                                </div>
                                {c.unread_admin && <Badge variant="destructive" className="animate-pulse">Não lido</Badge>}
                                <ExternalLink className="w-5 h-5 text-cyan-400" />
                            </div>
                        </Link>
                     ))}
                     {openChats.length === 0 && !isLoadingChats && <p className="text-center text-slate-400 py-8">Nenhum chat ativo no momento.</p>}
                  </CardContent>
              </Card>
          </TabsContent>

          {/* Aba Configs */}
          <TabsContent value="configs">
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader><CardTitle>Configurações do Sistema</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    {Object.entries(systemConfigs).map(([chave, config]) => (
                        <div key={chave} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                            <Label htmlFor={chave} className="text-lg font-semibold text-cyan-400">{chave}</Label>
                            <p className="text-sm text-slate-400 mb-2">{config.descricao}</p>
                            <div className="flex gap-2">
                                <Input id={chave} value={config.valor} onChange={(e) => handleConfigChange(chave, e.target.value)} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"/>
                                <Button onClick={() => handleSaveConfig(chave)} disabled={updateConfigMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2"/> Salvar
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
          </TabsContent>

          {/* Aba IA Console */}
          <TabsContent value="ia_console"><AdminAssistantTab /></TabsContent>

        </Tabs>
      </div>

      {/* Dialog para ver comprovante */}
      <Dialog open={isComprovanteOpen} onOpenChange={setIsComprovanteOpen}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Verificar Comprovante de {selectedPagamento?.empresa_nome}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Verifique a imagem e aprove ou recuse o pagamento de R$ {selectedPagamento?.valor.toFixed(2)} referente a {selectedPagamento?.mes_referencia}.
            </DialogDescription>
          </DialogHeader>
          {selectedPagamento?.comprovante_url ? (
            <img src={selectedPagamento.comprovante_url} alt="Comprovante" className="rounded-lg max-h-[60vh] object-contain mx-auto" />
          ) : <p className="text-center text-red-500">Nenhum comprovante enviado.</p>}
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="destructive" onClick={() => handleUpdatePagamento('recusado')} disabled={updatePagamentoMutation.isPending}><X className="w-4 h-4 mr-2"/>Recusar</Button>
            <Button variant="success" onClick={() => handleUpdatePagamento('aprovado')} disabled={updatePagamentoMutation.isPending}><Check className="w-4 h-4 mr-2"/>Aprovar</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para responder ticket */}
      <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
          <DialogContent className="max-w-lg bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                  <DialogTitle>Responder Ticket: {selectedTicket?.assunto}</DialogTitle>
                  <DialogDescription className="text-slate-400">De: {selectedTicket?.cliente_nome}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                  <p className="bg-slate-700 p-3 rounded-md"><strong>Mensagem do Cliente:</strong><br/>{selectedTicket?.mensagem}</p>
                  <Textarea placeholder="Escreva sua resposta aqui..." value={ticketResponse} onChange={e => setTicketResponse(e.target.value)} rows={5} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"/>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                  <Button variant="ghost" onClick={() => setIsTicketOpen(false)}>Cancelar</Button>
                  <Button onClick={handleResolveTicket} disabled={resolveTicketMutation.isPending}><Send className="w-4 h-4 mr-2"/>Resolver e Enviar Resposta</Button>
              </div>
          </DialogContent>
      </Dialog>

    </div>
  );
}
