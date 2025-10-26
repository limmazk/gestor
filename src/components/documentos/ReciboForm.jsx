import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function ReciboForm({ onSubmit, onCancel, isLoading }) {
  const [parcelaId, setParcelaId] = useState('');
  const [formData, setFormData] = useState({
    valor_pago: 0,
    data_pagamento: format(new Date(), 'yyyy-MM-dd'),
    forma_pagamento: 'Dinheiro',
    referente_a: '',
    observacoes: ''
  });

  const parcelas = [];

  const handleParcelaSelect = (id) => {
    setParcelaId(id);
    const parcela = parcelas.find(p => p.id === id);
    if (parcela) {
      setFormData({
        ...formData,
        valor_pago: parcela.valor,
        data_pagamento: parcela.data_pagamento || format(new Date(), 'yyyy-MM-dd'),
        referente_a: `Pagamento da parcela ${parcela.numero_parcela} da venda #${parcela.numero_venda}`
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const parcela = parcelas.find(p => p.id === parcelaId);
    if (!parcela) {
      alert('Por favor, selecione uma parcela paga');
      return;
    }

    onSubmit({
      numero_recibo: `REC${Date.now()}`,
      venda_id: parcela.venda_id,
      parcela_id: parcelaId,
      cliente_id: parcela.cliente_id,
      cliente_nome: parcela.cliente_nome,
      cliente_cpf_cnpj: '', // Would need to fetch from cliente
      data_pagamento: formData.data_pagamento,
      valor_pago: formData.valor_pago,
      forma_pagamento: formData.forma_pagamento,
      referente_a: formData.referente_a,
      observacoes: formData.observacoes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="parcela">Selecionar Parcela Paga *</Label>
        <Select value={parcelaId} onValueChange={handleParcelaSelect} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma parcela" />
          </SelectTrigger>
          <SelectContent>
            {parcelas.map(parcela => (
              <SelectItem key={parcela.id} value={parcela.id}>
                {parcela.cliente_nome} - Venda #{parcela.numero_venda} - Parcela {parcela.numero_parcela} - R$ {parcela.valor?.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valor_pago">Valor Pago (R$) *</Label>
          <Input
            id="valor_pago"
            type="number"
            step="0.01"
            value={formData.valor_pago}
            onChange={(e) => setFormData({...formData, valor_pago: parseFloat(e.target.value) || 0})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_pagamento">Data do Pagamento *</Label>
          <Input
            id="data_pagamento"
            type="date"
            value={formData.data_pagamento}
            onChange={(e) => setFormData({...formData, data_pagamento: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
        <Input
          id="forma_pagamento"
          value={formData.forma_pagamento}
          onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="referente_a">Referente a</Label>
        <Input
          id="referente_a"
          value={formData.referente_a}
          onChange={(e) => setFormData({...formData, referente_a: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Emitindo...' : 'Emitir Recibo'}
        </Button>
      </div>
    </form>
  );
}