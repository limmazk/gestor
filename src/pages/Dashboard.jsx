
import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, ShoppingCart, Package, DollarSign, Loader, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import FraseMotivacional from '../components/dashboard/FraseMotivacional';
import StatsCard from '../components/dashboard/StatsCard';
import VendasComparativo from '../components/dashboard/VendasComparativo';
import ProdutosMaisVendidos from '../components/dashboard/ProdutosMaisVendidos';
import AnaliseCompleta from '../components/dashboard/AnaliseCompleta';
import { startOfDay, isBefore, parseISO } from 'date-fns';

export default function Dashboard() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // const { data: user } = useQuery({
  //   queryKey: ['user'],
  //   queryFn: () => base44.auth.me().catch(() => null),
  // });
  const user = null;

  // const { data: clientes = [], isLoading: isLoadingClientes } = useQuery({
  //   queryKey: ['allClientes'],
  //   queryFn: () => base44.entities.Cliente.list(),
  //   initialData: [],
  // });
  const clientes = [];
  const isLoadingClientes = false;
  
  // const { data: vendas = [], isLoading: isLoadingVendas } = useQuery({
  //   queryKey: ['todasAsVendas'],
  //   queryFn: () => base44.entities.Venda.list(),
  //   initialData: [],
  // });
  const vendas = [];
  const isLoadingVendas = false;

  // const { data: produtos = [], isLoading: isLoadingProdutos } = useQuery({
  //   queryKey: ['produtos'],
  //   queryFn: () => base44.entities.Produto.list(),
  //   initialData: [],
  // });
  const produtos = [];
  const isLoadingProdutos = false;

  // const { data: parcelas = [], isLoading: isLoadingParcelas } = useQuery({
  //   queryKey: ['todasAsParcelasParaStats'],
  //   queryFn: () => base44.entities.Parcela.list(),
  //   initialData: [],
  // });
  const parcelas = [];
  const isLoadingParcelas = false;

  // const resetMutation = useMutation({
  //   mutationFn: async () => {
  //       const [
  //           allClientes, 
  //           allProdutos, 
  //           allVendas, 
  //           allParcelas, 
  //           allNotas, 
  //           allRecibos
  //       ] = await Promise.all([
  //           base44.entities.Cliente.list(null, 1000),
  //           base44.entities.Produto.list(null, 1000),
  //           base44.entities.Venda.list(null, 1000),
  //           base44.entities.Parcela.list(null, 1000),
  //           base44.entities.NotaServico.list(null, 1000),
  //           base44.entities.Recibo.list(null, 1000)
  //       ]);

  //       const deletePromises = [
  //           ...allClientes.map(c => base44.entities.Cliente.delete(c.id)),
  //           ...allProdutos.map(p => base44.entities.Produto.delete(p.id)),
  //           ...allVendas.map(v => base44.entities.Venda.delete(v.id)),
  //           ...allParcelas.map(pa => base44.entities.Parcela.delete(pa.id)),
  //           ...allNotas.map(n => base44.entities.NotaServico.delete(n.id)),
  //           ...allRecibos.map(r => base44.entities.Recibo.delete(r.id)),
  //       ];

  //       await Promise.all(deletePromises);
  //   },
  //   onSuccess: () => {
  //       queryClient.invalidateQueries();
  //       toast({
  //           title: "Sistema Resetado!",
  //           description: "Todos os dados de demonstração foram apagados.",
  //           variant: "success",
  //       });
  //       setIsResetDialogOpen(false);
  //   },
  //   onError: (error) => {
  //       toast({
  //           title: "Erro ao Resetar",
  //           description: `Não foi possível apagar os dados: ${error.message}`,
  //           variant: "destructive",
  //       });
  //       setIsResetDialogOpen(false);
  //   }
  // });
  const resetMutation = { mutate: () => {}, isPending: false };


  const stats = useMemo(() => {
    const totalVendas = vendas.reduce((sum, v) => sum + (v.valor_total || 0), 0);
    
    const hoje = startOfDay(new Date());
    const cobrancasPendentes = parcelas
        .filter(p => p.status === 'pendente' && !isBefore(startOfDay(parseISO(p.data_vencimento)), hoje))
        .reduce((sum, p) => sum + (p.valor || 0), 0);

    return {
      totalVendas,
      cobrancasPendentes,
    };
  }, [vendas, parcelas]);

  const isLoading = isLoadingClientes || isLoadingVendas || isLoadingProdutos || isLoadingParcelas;

  if (isLoading) {
    return <div className="w-screen h-screen flex items-center justify-center"><Loader className="w-12 h-12 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto"> 
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel Principal</h1>
            <p className="text-slate-600 mt-1">Bem-vindo de volta, {user?.full_name || 'Usuário'}!</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.is_demo_account && (
                <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Resetar Demonstração
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                                 Você tem certeza absoluta?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação é irreversível e apagará <strong>TODOS</strong> os dados de clientes, produtos, vendas, cobranças e documentos. Use isso apenas para limpar o ambiente antes de uma nova demonstração.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => resetMutation.mutate()}
                                disabled={resetMutation.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {resetMutation.isPending ? <Loader className="animate-spin w-4 h-4 mr-2" /> : null}
                                Sim, Resetar Agora
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <FraseMotivacional />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to={createPageUrl("Clientes")}>
            <StatsCard
              title="Total de Clientes"
              value={clientes.length}
              icon={Users}
              color="blue"
            />
          </Link>
          <StatsCard
            title="Vendas Totais"
            value={`R$ ${stats.totalVendas.toFixed(2)}`}
            icon={ShoppingCart}
            color="green"
          />
          <StatsCard
            title="Produtos em Estoque"
            value={produtos.length}
            icon={Package}
            color="orange"
          />
          <StatsCard
            title="Cobranças Pendentes"
            value={`R$ ${stats.cobrancasPendentes.toFixed(2)}`}
            icon={DollarSign}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <VendasComparativo vendas={vendas} />
            <ProdutosMaisVendidos vendas={vendas} produtos={produtos} />
        </div>
        
        <AnaliseCompleta vendas={vendas} produtos={produtos} />
        
      </div>
    </div>
  );
}
