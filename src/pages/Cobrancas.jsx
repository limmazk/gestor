
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader
} from "lucide-react";
import { format, isBefore, isToday, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import CobrancaCard from "../components/cobrancas/CobrancaCard";
import PagarParcelaDialog from "../components/cobrancas/PagarParcelaDialog";

const PAGE_SIZE = 10;

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Cobrancas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [showPagarDialog, setShowPagarDialog] = useState(false);
  const [selectedParcela, setSelectedParcela] = useState(null);
  const [page, setPage] = useState(1);
  
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['parcelas', page, debouncedSearchTerm, filterStatus, user?.id],
    queryFn: async () => {
      const offset = (page - 1) * PAGE_SIZE;
      const today = startOfDay(new Date());
      const todayString = format(today, 'yyyy-MM-dd');

      if (!user?.email) return { parcelas: [], total: 0 };

      const baseFilter = { created_by: user.email };
      let filter = { $and: [baseFilter] };

      if (debouncedSearchTerm) {
        filter.$and.push({
          $or: [
            { cliente_nome: { contains: debouncedSearchTerm } },
            { numero_venda: { contains: debouncedSearchTerm } }
          ]
        });
      }

      if (filterStatus === 'pendente') {
        filter.$and.push({ status: 'pendente', data_vencimento: { $gt: todayString } });
      } else if (filterStatus === 'atrasado') {
        filter.$and.push({ status: 'pendente', data_vencimento: { $lt: todayString } });
      } else if (filterStatus === 'hoje') {
        filter.$and.push({ status: 'pendente', data_vencimento: todayString });
      } else if (filterStatus === 'pagas') {
        filter.$and.push({ status: 'pago' });
      }

      const parcelas = await base44.entities.Parcela.filter(filter, 'data_vencimento', PAGE_SIZE, offset);
      const total = await base44.entities.Parcela.count(filter);

      return { parcelas, total };
    },
    enabled: !!user,
    placeholderData: (previousData) => previousData,
    keepPreviousData: true,
  });

  const parcelasPaginadas = data?.parcelas || [];
  const totalParcelas = data?.total || 0;
  const totalPages = Math.ceil(totalParcelas / PAGE_SIZE);

  const updateParcelaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Parcela.update(id, data),
    onSuccess: () => {
      // OPERAÇÃO COESÃO: SINCRONIZAÇÃO TOTAL
      // Um pagamento afeta Cobranças, Vendas (status) e o Dashboard.
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
      queryClient.invalidateQueries({ queryKey: ['todasAsParcelasParaStats'] }); // For dashboard stats
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      queryClient.invalidateQueries({ queryKey: ['todasAsVendas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['allClientes'] });
      
      setShowPagarDialog(false);
      setSelectedParcela(null);
    },
  });

  const handlePagarParcela = (parcela) => {
    setSelectedParcela(parcela);
    setShowPagarDialog(true);
  };

  const handleConfirmPagamento = async (pagamentoInfo) => {
    if (selectedParcela) {
      await updateParcelaMutation.mutateAsync({
        id: selectedParcela.id,
        data: {
          status: 'pago',
          data_pagamento: pagamentoInfo.data_pagamento,
          observacoes: pagamentoInfo.observacoes || selectedParcela.observacoes,
        },
      });
    }
  };

  const { data: allParcelasParaStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['todasAsParcelasParaStats', user?.id],
    queryFn: () => {
      if (!user?.email) return [];
      return base44.entities.Parcela.filter({ created_by: user.email, status: 'pendente' }, null, 10000); // Fetch all pending parcels
    },
    initialData: [],
    enabled: !!user,
  });

  const stats = useMemo(() => {
    const hoje = startOfDay(new Date());
    const todayString = format(hoje, 'yyyy-MM-dd');

    const atrasadas = allParcelasParaStats.filter(p => p.data_vencimento < todayString);
    const vencemHoje = allParcelasParaStats.filter(p => p.data_vencimento === todayString);
    
    return {
      atrasadas: {
        count: atrasadas.length,
        total: atrasadas.reduce((sum, p) => sum + (p.valor || 0), 0)
      },
      hoje: {
        count: vencemHoje.length,
        total: vencemHoje.reduce((sum, p) => sum + (p.valor || 0), 0)
      },
      pendentes: {
        count: allParcelasParaStats.length,
        total: allParcelasParaStats.reduce((sum, p) => sum + (p.valor || 0), 0)
      }
    };
  }, [allParcelasParaStats]);

  const displayedParcelas = useMemo(() => {
    const hoje = startOfDay(new Date());
    return parcelasPaginadas.map(p => {
      const parcelaCopy = { ...p };
      if (parcelaCopy.status === 'pendente') {
        const dataVenc = startOfDay(parseISO(parcelaCopy.data_vencimento));
        if (isBefore(dataVenc, hoje)) {
          parcelaCopy.statusDerived = 'atrasado';
          parcelaCopy.dias_atraso = Math.ceil((hoje.getTime() - dataVenc.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          parcelaCopy.statusDerived = 'pendente';
        }
      } else {
         parcelaCopy.statusDerived = 'pago';
      }
      return parcelaCopy;
    }).sort((a, b) => {
      const order = { 'atrasado': 1, 'pendente': 2, 'pago': 3 };
      if ((order[a.statusDerived] || 4) !== (order[b.statusDerived] || 4)) {
        return (order[a.statusDerived] || 4) - (order[b.statusDerived] || 4);
      }
      return new Date(a.data_vencimento) - new Date(b.data_vencimento);
    });
  }, [parcelasPaginadas]);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto"> 
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-blue-600" />
            Cobranças
          </h1>
          <p className="text-slate-600 mt-1">Gerencie parcelas e recebimentos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-red-500 shadow-lg">
            <CardContent className="pt-6">
              {isLoadingStats ? <Loader className="animate-spin"/> : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Atrasadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.atrasadas.count}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    R$ {stats.atrasadas.total.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg">
            <CardContent className="pt-6">
             {isLoadingStats ? <Loader className="animate-spin"/> : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Vencem Hoje</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.hoje.count}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    R$ {stats.hoje.total.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardContent className="pt-6">
              {isLoadingStats ? <Loader className="animate-spin"/> : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Pendente</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.pendentes.count}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    R$ {stats.pendentes.total.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por cliente ou número da venda..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Reset page on search
                  }}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={(value) => {
                setFilterStatus(value);
                setPage(1); // Reset page on filter change
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Pendentes</SelectItem>
                  <SelectItem value="atrasado">Atrasadas</SelectItem>
                  <SelectItem value="hoje">Vencem Hoje</SelectItem>
                  <SelectItem value="pendente">A Vencer</SelectItem>
                  <SelectItem value="pagas">Pagas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {isLoading && !data ? (
            <Card>
              <CardContent className="p-8 text-center flex justify-center items-center">
                <Loader className="w-6 h-6 mr-2 animate-spin" />
                <p className="text-slate-500">Carregando cobranças...</p>
              </CardContent>
            </Card>
          ) : displayedParcelas.length > 0 ? (
            displayedParcelas.map((parcela) => (
              <CobrancaCard
                key={parcela.id}
                parcela={parcela}
                onPagar={handlePagarParcela}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {debouncedSearchTerm || filterStatus !== 'todos' ? 'Nenhuma cobrança encontrada para os filtros selecionados.' : 'Nenhuma cobrança registrada.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {totalPages > 1 && (
            <div className="mt-8 text-center flex justify-center items-center gap-4">
              <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Anterior
              </Button>
              <span className="text-sm font-medium">Página {page} de {totalPages}</span>
              <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Próximo
              </Button>
            </div>
        )}

        <Dialog open={showPagarDialog} onOpenChange={setShowPagarDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
            </DialogHeader>
            {selectedParcela && (
              <PagarParcelaDialog
                parcela={selectedParcela}
                onConfirm={handleConfirmPagamento}
                onCancel={() => setShowPagarDialog(false)}
                isLoading={updateParcelaMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
