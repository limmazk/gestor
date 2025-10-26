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
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export default function NotaForm({ onSubmit, onCancel, isLoading }) {
  const [vendaId, setVendaId] = useState('');
  const [itens, setItens] = useState([]);
  const [observacoes, setObservacoes] = useState('');

  const vendas = [];

  const handleVendaSelect = (id) => {
    setVendaId(id);
    const venda = vendas.find(v => v.id === id);
    if (venda && venda.itens) {
      setItens(venda.itens.map(item => ({
        descricao: item.produto_nome,
        quantidade: item.quantidade,
        valor_unitario: item.preco_unitario,
        valor_total: item.subtotal
      })));
    }
  };

  const addItem = () => {
    setItens([...itens, { descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 }]);
  };

  const removeItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItens = [...itens];
    newItens[index][field] = value;

    if (field === 'quantidade' || field === 'valor_unitario') {
      newItens[index].valor_total = newItens[index].quantidade * newItens[index].valor_unitario;
    }

    setItens(newItens);
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.valor_total, 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    const venda = vendas.find(v => v.id === vendaId);
    if (!venda) {
      alert('Por favor, selecione uma venda');
      return;
    }

    if (itens.length === 0) {
      alert('Adicione pelo menos um item à nota');
      return;
    }

    onSubmit({
      numero_nota: `NF${Date.now()}`,
      venda_id: vendaId,
      cliente_id: venda.cliente_id,
      cliente_nome: venda.cliente_nome,
      cliente_cpf_cnpj: '', // Would need to fetch from cliente
      cliente_endereco: '', // Would need to fetch from cliente
      data_emissao: new Date().toISOString().split('T')[0],
      itens: itens,
      valor_total: valorTotal,
      observacoes: observacoes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="venda">Selecionar Venda *</Label>
        <Select value={vendaId} onValueChange={handleVendaSelect} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma venda" />
          </SelectTrigger>
          <SelectContent>
            {vendas.map(venda => (
              <SelectItem key={venda.id} value={venda.id}>
                Venda #{venda.numero_venda} - {venda.cliente_nome} - R$ {venda.valor_total?.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-2 border-dashed">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Itens da Nota</h3>
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>

          <div className="space-y-3">
            {itens.map((item, index) => (
              <div key={index} className="grid md:grid-cols-5 gap-3 items-end p-3 bg-slate-50 rounded-lg">
                <div className="md:col-span-2">
                  <Label>Descrição</Label>
                  <Input
                    value={item.descricao}
                    onChange={(e) => updateItem(index, 'descricao', e.target.value)}
                    placeholder="Descrição do serviço"
                  />
                </div>

                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => updateItem(index, 'quantidade', parseFloat(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Label>Valor Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.valor_unitario}
                    onChange={(e) => updateItem(index, 'valor_unitario', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label>Total</Label>
                    <Input
                      type="text"
                      value={`R$ ${item.valor_total.toFixed(2)}`}
                      disabled
                      className="bg-white"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {itens.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                Selecione uma venda para carregar os itens ou adicione manualmente
              </p>
            )}
          </div>

          {itens.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Valor Total:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  R$ {valorTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || itens.length === 0}>
          {isLoading ? 'Emitindo...' : 'Emitir Nota'}
        </Button>
      </div>
    </form>
  );
}