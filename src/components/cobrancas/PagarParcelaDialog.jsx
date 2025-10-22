import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function PagarParcelaDialog({ parcela, onConfirm, onCancel, isLoading }) {
  const [dataPagamento, setDataPagamento] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      data_pagamento: dataPagamento,
      observacoes: observacoes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-slate-50 rounded-lg">
        <p className="text-sm text-slate-600">Cliente</p>
        <p className="font-semibold">{parcela.cliente_nome}</p>
        
        <p className="text-sm text-slate-600 mt-2">Valor da Parcela</p>
        <p className="text-2xl font-bold text-emerald-600">
          R$ {parcela.valor?.toFixed(2)}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="data_pagamento">Data do Pagamento *</Label>
        <Input
          id="data_pagamento"
          type="date"
          value={dataPagamento}
          onChange={(e) => setDataPagamento(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
          placeholder="Forma de pagamento, notas adicionais..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Confirmar Pagamento'}
        </Button>
      </div>
    </form>
  );
}