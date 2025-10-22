
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Loader, User, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ChatSuporte() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [conversa, setConversa] = useState(null);
  const [assunto, setAssunto] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");
  const chatEndRef = useRef(null);

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: conversaAberta, isLoading: isLoadingConversa } = useQuery({
    queryKey: ['conversaAberta', user?.id],
    queryFn: async () => {
      const conversas = await base44.entities.ChatConversa.filter({
        usuario_id: user.id,
        status: 'aberto'
      }, '-created_date', 1);
      return conversas[0] || null;
    },
    enabled: !!user,
    onSuccess: (data) => {
      if (data) {
        setConversa(data);
      }
    }
  });

  const { data: mensagens, isLoading: isLoadingMensagens } = useQuery({
    queryKey: ['mensagens', conversa?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ conversa_id: conversa.id }, 'created_date'),
    enabled: !!conversa,
    refetchInterval: 5000, // Check for new messages every 5 seconds
  });

  const criarConversaMutation = useMutation({
    mutationFn: async (data) => {
      const novaConversa = await base44.entities.ChatConversa.create(data.conversa);
      await base44.entities.ChatMessage.create({ ...data.mensagem, conversa_id: novaConversa.id });
      return novaConversa;
    },
    onSuccess: (data) => {
      setConversa(data);
      setAssunto("");
      setNovaMensagem("");
      queryClient.invalidateQueries({ queryKey: ['conversaAberta'] });
    },
  });

  const enviarMensagemMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ChatMessage.create(data.mensagem);
      await base44.entities.ChatConversa.update(conversa.id, data.updateConversa);
    },
    onSuccess: () => {
      setNovaMensagem("");
      queryClient.invalidateQueries({ queryKey: ['mensagens', conversa?.id] });
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handleIniciarChat = (e) => {
    e.preventDefault();
    if (!assunto.trim() || !novaMensagem.trim() || !user) return;

    const data = {
      conversa: {
        usuario_id: user.id,
        usuario_nome: user.full_name || user.email,
        assunto: assunto,
        last_message_preview: novaMensagem,
        last_message_date: new Date().toISOString(),
      },
      mensagem: {
        remetente_id: user.id,
        remetente_nome: user.full_name || user.email,
        conteudo: novaMensagem,
      }
    };
    criarConversaMutation.mutate(data);
  };

  const handleEnviarMensagem = (e) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !user || !conversa) return;

    const data = {
      mensagem: {
        conversa_id: conversa.id,
        remetente_id: user.id,
        remetente_nome: user.full_name || user.email,
        conteudo: novaMensagem,
      },
      updateConversa: {
        last_message_preview: novaMensagem,
        last_message_date: new Date().toISOString(),
        unread_admin: true,
        unread_user: false,
      }
    };
    enviarMensagemMutation.mutate(data);
  };

  if (isLoadingUser || isLoadingConversa) {
    return <div className="flex justify-center items-center h-screen"><Loader className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex flex-col">
      <Card className="w-full flex-1 flex flex-col shadow-2xl">
        <CardHeader>
          <CardTitle>
            {conversa ? `Suporte: ${conversa.assunto}` : "Iniciar Novo Chat de Suporte"}
          </CardTitle>
        </CardHeader>
        {!conversa ? (
          <CardContent>
            <form onSubmit={handleIniciarChat} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assunto">Qual o motivo do seu contato?</Label>
                <Input id="assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} required placeholder="Ex: Erro ao registrar venda" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primeira-mensagem">Descreva seu problema</Label>
                <Textarea id="primeira-mensagem" value={novaMensagem} onChange={(e) => setNovaMensagem(e.target.value)} required rows={6} placeholder="Forneça o máximo de detalhes possível..." />
              </div>
              <Button type="submit" disabled={criarConversaMutation.isPending} className="w-full bg-green-600 hover:bg-green-700">
                {criarConversaMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Iniciar Chat
              </Button>
            </form>
          </CardContent>
        ) : (
          <>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100">
              {isLoadingMensagens ? <Loader className="w-6 h-6 animate-spin mx-auto" /> :
                mensagens?.map(msg => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.remetente_id === user.id ? 'justify-end' : 'justify-start'}`}>
                    {msg.remetente_id !== user.id && <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0"><Shield size={16} /></div>}
                    <div className={`max-w-lg p-3 rounded-lg ${msg.remetente_id === user.id ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                      <p className="text-sm">{msg.conteudo}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">{format(new Date(msg.created_date), 'HH:mm')}</p>
                    </div>
                    {msg.remetente_id === user.id && <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0"><User size={16} /></div>}
                  </div>
                ))}
              <div ref={chatEndRef} />
            </CardContent>
            <div className="p-4 border-t">
              <form onSubmit={handleEnviarMensagem} className="flex gap-2">
                <Input value={novaMensagem} onChange={(e) => setNovaMensagem(e.target.value)} placeholder="Digite sua mensagem..." autoComplete="off" />
                <Button type="submit" disabled={enviarMensagemMutation.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
