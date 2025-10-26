
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  QrCode,
  Bot,
  Settings,
  Zap,
  CheckCircle,
  XCircle,
  Send,
  BookOpen,
  AlertCircle,
  Smartphone,
  RefreshCw,
  PowerOff,
  Link as LinkIcon,
  Construction,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WhatsAppIA() {
  const { toast } = useToast();
  const [statusConexao, setStatusConexao] = useState('disconnected'); // disconnected, connecting, connected
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  const configs = {};
  const isLoadingConfigs = false;

  const apiUrl = configs.WHATSAPP_API_URL;
  const apiKey = configs.WHATSAPP_API_KEY;

  const isConfigurado = apiUrl && apiKey;

  // Função para conectar e gerar QR Code
  const handleConectar = async () => {
    setStatusConexao('connecting');
    setLoading(true);
    setQrCode('');

    // Aqui seria a chamada real para a API do WhatsApp
    // Ex: const response = await fetch(`${apiUrl}/sessions/start`, { ... });
    // Por agora, vamos simular a geração de um QR de exemplo
    await new Promise(resolve => setTimeout(resolve, 2000));
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EXEMPLO_CONEXAO_GESTAOPRO_${Date.now()}`);
    setLoading(false);
    
    // Num cenário real, você teria um websocket ou long-polling
    // para verificar o status e mudar para 'connected' quando o QR fosse lido
  };
  
  // Função para simular que o QR foi lido
  const handleSimularLeituraQR = () => {
    setStatusConexao('connected');
    setQrCode('');
    toast({
      title: "Conexão Estabelecida (Simulado)",
      description: "O sistema agora está simulando uma conexão real.",
      variant: "success",
    });
  };

  const handleDesconectar = () => {
     setStatusConexao('disconnected');
     setQrCode('');
     toast({ title: "Desconectado" });
  };


  if (isLoadingConfigs) {
      return <div>Carregando configurações...</div>
  }
  
  if (!isConfigurado) {
    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center justify-center">
            <Card className="max-w-2xl text-center shadow-2xl">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-slate-800">WhatsApp IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 px-3 py-1 text-sm border border-yellow-300">
                      <Construction className="w-4 h-4 mr-2" />
                      Ainda em Desenvolvimento
                    </Badge>
                    <p className="text-slate-600">
                        Esta funcionalidade está em fase final de implementação. Em breve, você poderá conectar seu WhatsApp diretamente por aqui para automatizar o atendimento, cobranças e muito mais.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-green-600" />
            WhatsApp IA
          </h1>
          <p className="text-slate-600 mt-1">Assistente inteligente integrado com seu sistema</p>
        </div>
        <Badge variant={statusConexao === 'connected' ? "success" : "secondary"} className="text-lg px-4 py-2">
          {statusConexao === 'connected' ? <><CheckCircle className="w-4 h-4 mr-2" /> Conectado</> : <><XCircle className="w-4 h-4 mr-2" /> Desconectado</>}
        </Badge>
      </div>

      {statusConexao === 'disconnected' && (
        <Card className="mb-6 shadow-lg border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Pronto para Conectar!
            </h3>
            <p className="text-slate-700 mb-4">
              As credenciais da API estão configuradas. Clique abaixo para iniciar a conexão.
            </p>
            <Button onClick={handleConectar} className="bg-green-600 hover:bg-green-700 text-lg px-6 py-6">
              <Zap className="w-5 h-5 mr-2" />
              Conectar ao WhatsApp
            </Button>
          </CardContent>
        </Card>
      )}

      {statusConexao === 'connecting' && (
        <Card className="mb-6 shadow-2xl border-2 border-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-3 text-green-900">
              <QrCode className="w-6 h-6" />
              Leia o QR Code com seu WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center">
            {loading ? (
              <div className="w-80 h-80 flex flex-col items-center justify-center">
                <RefreshCw className="w-16 h-16 text-green-600 animate-spin mb-4" />
                <p className="text-lg font-semibold text-slate-700">Gerando QR Code...</p>
              </div>
            ) : (
              <div className="mb-6 p-6 bg-white border-4 border-green-500 rounded-2xl shadow-lg">
                <img src={qrCode} alt="QR Code WhatsApp" className="w-80 h-80"/>
              </div>
            )}
            <Alert className="bg-yellow-50 border-yellow-300 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                <strong className="block mb-2">Aguardando leitura...</strong>
                Abra o WhatsApp no seu celular, vá em "Aparelhos conectados" e aponte a câmera para o QR Code.
              </AlertDescription>
            </Alert>
            {/* Este botão é para simular a leitura do QR, pois a verificação real depende do backend */}
            <Button onClick={handleSimularLeituraQR} variant="outline">Simular Leitura do QR Code</Button>
          </CardContent>
        </Card>
      )}
      
      {statusConexao === 'connected' && (
        <Card className="mb-6 shadow-lg bg-green-50 border-green-300">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
              <div>
                <h3 className="text-xl font-bold text-green-900">Conectado com Sucesso!</h3>
                <p className="text-slate-700">O assistente de IA está ativo e pronto para receber mensagens.</p>
              </div>
            </div>
            <Button onClick={handleDesconectar} variant="destructive">
              <XCircle className="w-4 h-4 mr-2" />
              Desconectar Sessão
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* O restante da UI com as abas só é visível se a API estiver configurada */}
      <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="dashboard"><MessageSquare className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
              <TabsTrigger value="configuracao"><Settings className="w-4 h-4 mr-2" />Configuração</TabsTrigger>
              <TabsTrigger value="treinamento"><Bot className="w-4 h-4 mr-2" />Treinar IA</TabsTrigger>
              <TabsTrigger value="automacoes"><Zap className="w-4 h-4 mr-2" />Automações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
              <Card><CardHeader><CardTitle>Dashboard</CardTitle></CardHeader><CardContent><p className="text-center p-8">Os dados de uso apareceriam aqui quando a conexão real estivesse ativa.</p></CardContent></Card>
          </TabsContent>
          <TabsContent value="configuracao">
               <Card><CardHeader><CardTitle>Configuração do Assistente</CardTitle></CardHeader><CardContent><p className="text-center p-8">As configurações do bot (nome, mensagem de boas-vindas, etc.) apareceriam aqui.</p></CardContent></Card>
          </TabsContent>
           <TabsContent value="treinamento">
               <Card><CardHeader><CardTitle>Treinar IA</CardTitle></CardHeader><CardContent><p className="text-center p-8">A interface para adicionar novo conhecimento à IA apareceria aqui.</p></CardContent></Card>
          </TabsContent>
           <TabsContent value="automacoes">
               <Card><CardHeader><CardTitle>Automações</CardTitle></CardHeader><CardContent><p className="text-center p-8">As opções para configurar automações (cobranças, recibos, etc.) apareceriam aqui.</p></CardContent></Card>
          </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
