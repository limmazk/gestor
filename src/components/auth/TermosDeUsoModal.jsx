
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { FileText, Check, AlertTriangle, Shield, DollarSign, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const TermoItem = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-4">
    <Icon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
    <div>
      <h4 className="font-semibold text-slate-800">{title}</h4>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  </div>
);

export default function TermosDeUsoModal() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const acceptTermsMutation = useMutation({
        mutationFn: () => base44.auth.updateMe({ termos_aceitos: true }),
        onSuccess: () => {
            toast({
                title: "Termos aceitos!",
                description: "Obrigado! Você já pode usar o sistema.",
                variant: "success",
            });
            // Invalida a query do usuário para forçar o recarregamento do layout
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error) => {
            toast({
                title: "Erro ao aceitar os termos",
                description: `Ocorreu um problema: ${error.message}. Por favor, tente novamente.`,
                variant: "destructive",
            });
        }
    });

    const handleAccept = () => {
        acceptTermsMutation.mutate();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <FileText className="w-7 h-7 text-blue-600" />
                        Resumo dos Termos de Uso
                    </h2>
                    <p className="text-slate-600">Por favor, confirme que você está ciente dos pontos abaixo para continuar.</p>
                </div>
                
                <div className="p-6 space-y-5 text-slate-700">
                    <TermoItem 
                        icon={DollarSign}
                        title="Serviço Pago e Bloqueio por Atraso"
                        description="Este é um serviço por assinatura mensal. O não pagamento até o vencimento resultará no bloqueio automático e imediato do seu acesso ao sistema."
                    />
                    <TermoItem 
                        icon={Shield}
                        title="Privacidade dos Seus Dados"
                        description="Os dados que você insere (clientes, vendas, etc.) são usados apenas para o funcionamento do sistema e para lhe fornecer suporte. Nós não vendemos suas informações."
                    />
                    <TermoItem 
                        icon={Database}
                        title="Responsabilidade Pelos Dados"
                        description="Você é o único responsável pela veracidade e legalidade dos dados inseridos. É sua responsabilidade manter cópias de segurança (backups) de suas informações importantes."
                    />
                     <TermoItem 
                        icon={AlertTriangle}
                        title="Uso por Sua Conta e Risco"
                        description="O uso do sistema é de sua inteira responsabilidade. Não nos responsabilizamos por perdas ou danos, incluindo lucros cessantes ou perda de dados."
                    />
                </div>

                <div className="p-6 border-t bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 text-center sm:text-left">
                        Ao clicar em "Li e Aceito", você confirma que leu, entendeu e concorda com todos os termos.
                    </p>
                    <Button 
                        size="lg" 
                        onClick={handleAccept} 
                        disabled={acceptTermsMutation.isPending}
                        className={cn(
                            "bg-blue-600 hover:bg-blue-700 w-full sm:w-auto",
                            acceptTermsMutation.isPending && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {acceptTermsMutation.isPending ? "Aceitando..." : "Li e Aceito"}
                        <Check className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
