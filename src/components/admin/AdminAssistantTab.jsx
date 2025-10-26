
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, BrainCircuit, Loader } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

export default function AdminAssistantTab() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { 
            sender: 'ai', 
            text: "Eu sou sua IA Arquiteta de Sistemas Sênior. Tenho acesso total ao código-fonte e à arquitetura do GestãoPro. Dê-me seu comando." // Texto atualizado para 'GestãoPro'
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const { toast } = useToast();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            const aiResponse = {
                sender: 'ai',
                text: "Funcionalidade de IA temporariamente desabilitada. Aguarde atualizações.",
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <Card className="shadow-lg h-[calc(100vh-280px)] flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <BrainCircuit className="w-8 h-8 text-blue-700"/>
                    <div>
                        <CardTitle className="text-xl text-slate-900">Console da IA Arquiteta Sênior</CardTitle>
                        <CardDescription className="text-slate-600">Peça o código, revise o rascunho e me de a ordem final no chat principal.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4 bg-slate-50">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-2 ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1"><Bot size={18} /></div>}
                                <div className={`max-w-2xl p-3 rounded-lg prose prose-sm prose-slate dark:prose-invert ${msg.sender === 'ai' ? 'bg-white shadow-sm' : 'bg-slate-700 text-white'}`}>
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                                {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-1"><User size={18} /></div>}
                            </div>
                        ))}
                        {isTyping && (
                             <div className="flex items-start gap-2 justify-start">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1"><Bot size={18} /></div>
                                <div className="max-w-lg p-3 rounded-lg bg-white shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Loader className="w-4 h-4 animate-spin text-blue-500"/>
                                        <p className="text-sm text-slate-600">Analisando... Gerando codigo...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ex: Crie a entidade 'Fornecedor' com nome, CNPJ e telefone..."
                            autoComplete="off"
                            disabled={isTyping}
                        />
                        <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
                            <Send className="w-4 h-4"/>
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
