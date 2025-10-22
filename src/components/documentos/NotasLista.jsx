import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileCheck, Plus, Search, Eye, Calendar, User, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import NotaForm from "./NotaForm";
import NotaDetalhes from "./NotaDetalhes";

export default function NotasLista() {
  const [showForm, setShowForm] = useState(false);
  const [selectedNota, setSelectedNota] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const queryClient = useQueryClient();

  const { data: notas = [], isLoading } = useQuery({
    queryKey: ['notas'],
    queryFn: () => base44.entities.NotaServico.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NotaServico.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
      setShowForm(false);
    },
  });

  const handleSubmit = (data) => {
    createMutation.mutate(data);
  };

  const filteredNotas = notas.filter(nota =>
    nota.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.numero_nota?.toString().toLowerCase().includes(searchTerm.toLowerCase()) // CORREÇÃO: Garante que a busca funcione mesmo se o número for salvo como número.
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Notas de Serviço e Fiscais</h2>
        <a 
          href="https://www.nfse.gov.br/EmissorNacional"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white">
            <ExternalLink className="w-4 h-4" />
            Emitir NFS-e no SEFAZ
          </Button>
        </a>
      </div>

      <Card className="mb-6 shadow-lg">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Buscar por cliente ou número da nota..."
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
              <p className="text-slate-500">Carregando notas...</p>
            </CardContent>
          </Card>
        ) : filteredNotas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">
                {searchTerm ? 'Nenhuma nota encontrada' : 'Nenhuma nota de serviço emitida ainda'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
                >
                  Emitir Primeira Nota
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredNotas.map((nota) => (
            <Card key={nota.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Nota #{nota.numero_nota}
                        </h3>
                        <p className="text-slate-600">Cliente: {nota.cliente_nome}</p>
                      </div>
                      <Badge variant="success">Emitida</Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        <span>
                          {format(new Date(nota.data_emissao), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Valor:</span>{' '}
                        <span className="font-bold text-emerald-600">
                          R$ {nota.valor_total?.toFixed(2)}
                        </span>
                      </div>
                      {nota.cliente_cpf_cnpj && (
                        <div>
                          <span className="text-slate-600">CPF/CNPJ:</span>{' '}
                          <span className="font-medium">{nota.cliente_cpf_cnpj}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedNota(nota)}
                      className="flex-1 md:flex-none"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Nota
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Emitir Nota de Serviço</DialogTitle>
          </DialogHeader>
          <NotaForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedNota} onOpenChange={() => setSelectedNota(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nota de Serviço</DialogTitle>
          </DialogHeader>
          {selectedNota && <NotaDetalhes nota={selectedNota} />}
        </DialogContent>
      </Dialog>
    </>
  );
}