import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// ... (outros imports) ...
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// ... (função mapConfigsToObject)

export default function Mensalidade() {
  const [uploading, setUploading] = useState(false);
  const [postUploadStatus, setPostUploadStatus] = useState(null);
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();

  // ... (queries de user, pagamentos, configs) ...
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: pagamentos = [], isLoading: isLoadingPagamentos } = useQuery({
    queryKey: ['pagamentos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.Pagamento.filter({ empresa_id: user.id }, '-created_date');
    },
    enabled: !!user?.id,
    initialData: [],
  });
  
  const mapConfigsToObject = (configs) => {
    if (!configs) return {};
    return configs.reduce((acc, config) => {
        acc[config.chave] = config.valor;
        return acc;
    }, {});
  };

  const { data: configsArray, isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['configuracoesPublicas'],
    queryFn: () => base44.entities.ConfiguracaoPublica.list(),
  });
  const configs = mapConfigsToObject(configsArray || []);


  const chavePix = configs.CHAVE_PIX || "";
  const bancoPix = configs.NOME_BANCO_PIX || "";
  const titularPix = configs.NOME_TITULAR_PIX || "";

  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();
  const mesAtualRef = `${mes}/${ano}`;
  
  const pagamentoMesAtual = !postUploadStatus && pagamentos.find(p =>
    p.mes_referencia === mesAtualRef &&
    (p.status === 'aprovado' || p.status === 'aguardando_verificacao')
  );

  const estaEmDia = !!pagamentoMesAtual || user?.status === 'ativo';

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    },
  });

  const criarPagamentoMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Pagamento.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      // Invalida a query de notificações para o admin ver o novo comprovante
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      setPostUploadStatus('aguardando');
    },
  });

// ... (resto do componente, handleFileSelectAndUpload, JSX, etc.)
// ... Nenhuma outra alteração é necessária aqui, a lógica de mutação já invalida as queries certas.
}