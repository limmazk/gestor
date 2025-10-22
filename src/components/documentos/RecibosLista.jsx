import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Adicionado
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Receipt, Plus, Search, Eye, Calendar } from "lucide-react"; // Adicionado Search
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import ReciboForm from "./ReciboForm";
import ReciboDetalhes from "./ReciboDetalhes";

export default function RecibosLista() {
  const [showForm, setShowForm] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Adicionado estado de busca
  
  const queryClient = useQueryClient();

  const { data: recibos = [], isLoading } = useQuery({
    queryKey: ['recibos'],
    queryFn: () => base44.entities.Recibo.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Recibo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recibos'] });
      setShowForm(false);
    },
  });

  const handleSubmit = (data) => {
    createMutation.mutate(data);
  };

  // Lógica de filtro adicionada
  const filteredRecibos = recibos.filter(recibo =>
    recibo.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recibo.numero_recibo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Recibos de Pagamento</h2>
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <Plus className="w-4 h-4" />
          Gerar Novo Recibo
        </Button>
      </div>

      {/* Card de busca adicionado */}
      <Card className="mb-6 shadow-lg">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Buscar por cliente ou número do recibo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-500">Carregando recibos...</p>
            </CardContent>
          </Card>
        ) : filteredRecibos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">
                {searchTerm ? 'Nenhum recibo encontrado' : 'Nenhum recibo gerado ainda'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)}>
                  Gerar Primeiro Recibo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRecibos.map((recibo) => (
            <Card key={recibo.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Recibo #{recibo.numero_recibo}
                        </h3>
                        <p className="text-slate-600">Cliente: {recibo.cliente_nome}</p>
                      </div>
                      <Badge variant="success">Emitido</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        <span>
                          {format(new Date(recibo.data_pagamento), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Valor:</span>{' '}
                        <span className="font-bold text-emerald-600">
                          R$ {recibo.valor_pago?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecibo(recibo)}
                      className="flex-1 md:flex-none"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Recibo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerar Novo Recibo</DialogTitle>
          </DialogHeader>
          <ReciboForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedRecibo} onOpenChange={() => setSelectedRecibo(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Recibo</DialogTitle>
          </DialogHeader>
          {selectedRecibo && <ReciboDetalhes recibo={selectedRecibo} />}
        </DialogContent>
      </Dialog>
    </>
  );
}