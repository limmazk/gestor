import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, User, Shield, Loader, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatAdmin() {
    const location = useLocation();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const queryParams = new URLSearchParams(location.search);
    const conversaId = queryParams.get('conversaId');

    // const { data: adminUser } = useQuery({
    //     queryKey: ['user'],
    //     queryFn: () => base44.auth.me(),
    //     staleTime: Infinity,
    // });
    const adminUser = null;
    
    // const { data: conversa, isLoading: isLoadingConversa } = useQuery({
    //     queryKey: ['chatConversa', conversaId],
    //     queryFn: () => base44.entities.ChatConversa.get(conversaId),
    //     enabled: !!conversaId,
    // });
    const conversa = null;
    const isLoadingConversa = false;

    // const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    //     queryKey: ['chatMessages', conversaId],
    //     queryFn: () => base44.entities.ChatMessage.filter({ conversa_id: conversaId }, 'created_date'),
    //     enabled: !!conversaId,
    //     refetchInterval: 5000, 
    // });
    const messages = [];
    const isLoadingMessages = false;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // useEffect(() => {
    //     if (conversa && conversa.unread_admin) {
    //         base44.entities.ChatConversa.update(conversaId, { unread_admin: false }).then(() => {
    //             queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
    //             queryClient.invalidateQueries({ queryKey: ['openChatsAdmin'] });
    //         });
    //     }
    // }, [conversa, conversaId, queryClient]);

    // const sendMessageMutation = useMutation({
    //     mutationFn: async (messageContent) => {
    //         await base44.entities.ChatMessage.create({
    //             conversa_id: conversaId,
    //             remetente_id: 'admin',
    //             remetente_nome: adminUser?.full_name || 'Admin',
    //             conteudo: messageContent,
    //         });

    //         await base44.entities.ChatConversa.update(conversaId, {
    //             last_message_preview: messageContent,
    //             last_message_date: new Date().toISOString(),
    //             unread_user: true,
    //             unread_admin: false, 
    //         });
    //     },
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['chatMessages', conversaId] });
    //         queryClient.invalidateQueries({ queryKey: ['openChatsAdmin'] });
    //         setNewMessage('');
    //     },
    // });
    const sendMessageMutation = { mutate: () => {}, isPending: false };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessageMutation.mutate(newMessage.trim());
        }
    };

    if (isLoadingConversa || isLoadingMessages) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader className="h-8 w-8 animate-spin" /></div>;
    }

    if (!conversa) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center text-center p-4">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold">Conversa não encontrada</h2>
                <p className="text-slate-600 mb-6">A conversa que você está tentando acessar não existe ou foi removida.</p>
                <Link to={createPageUrl('Administracao?tab=chat')}>
                    <Button><ArrowLeft className="mr-2 h-4 w-4" />Voltar para Administração</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-100">
            <header className="flex items-center gap-4 p-4 border-b bg-white shadow-sm">
                <Link to={createPageUrl('Administracao?tab=chat')}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-slate-900">{conversa.assunto}</h1>
                    <p className="text-sm text-slate-600">Conversa com {conversa.usuario_nome}</p>
                </div>
            </header>
            
            <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn('flex items-end gap-3', msg.remetente_id === 'admin' ? 'justify-end' : 'justify-start')}>
                            {msg.remetente_id !== 'admin' && (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 flex-shrink-0">
                                    <User className="h-5 w-5" />
                                </div>
                            )}
                            <div className={cn("max-w-md rounded-xl px-4 py-3 shadow-md", msg.remetente_id === 'admin' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none')}>
                                <p className="text-sm">{msg.conteudo}</p>
                                <p className="mt-2 text-xs opacity-70 text-right">
                                    {format(new Date(msg.created_date), 'HH:mm')}
                                </p>
                            </div>
                            {msg.remetente_id === 'admin' && (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white flex-shrink-0">
                                    <Shield className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <footer className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua resposta..."
                        className="flex-1 resize-none"
                        rows={1}
                        disabled={sendMessageMutation.isPending}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <Button type="submit" size="icon" disabled={sendMessageMutation.isPending || !newMessage.trim()}>
                        {sendMessageMutation.isPending ? <Loader className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </footer>
        </div>
    );
}