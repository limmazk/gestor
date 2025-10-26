import React, { useState, useEffect } from 'react';
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
import { Plus, Trash2, Loader } from "lucide-react";
import { addDays, format } from "date-fns";

export default function VendaForm({ onSubmit, onCancel, isLoading, scannedProduct }) {
  const [clienteId, setClienteId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('a_vista');
  const [quantidadeParcelas, setQuantidadeParcelas] = useState(1);
  const [itens, setItens] = useState([]);
  const [observacoes, setObservacoes] = useState('');

  const user = null;
  const clientes = [];
  const isLoadingClientes = false;
  const produtos = [];
  const isLoadingProdutos = false;

  useEffect(() => {
    if (scannedProduct && produtos.length > 0) {
      const produtoCompleto = produtos.find(p => p.id === scannedProduct.id);
      if (produtoCompleto) {
        addItem(produtoCompleto);
      }
    }
  }, [scannedProduct, produtos]);

  const addItem = (produtoParaAdicionar) => {
    if (produtoParaAdicionar) {
      const itemExistenteIndex = itens.findIndex(item => item.produto_id === produtoParaAdicionar.id);

      if (itemExistenteIndex > -1) {
        const newItens = [...itens];
        if(newItens[itemExistenteIndex].quantidade < produtoParaAdicionar.quantidade_estoque) {
            newItens[itemExistenteIndex].quantidade++;
            newItens[itemExistenteIndex].subtotal = newItens[itemExistenteIndex].quantidade * newItens[itemExistenteIndex].preco_unitario;
            setItens(newItens);
        } else {
            alert(`Estoque máximo atingido para ${produtoParaAdicionar.nome}.`);
        }
      } else {
        const novoItem = {
          produto_id: produtoParaAdicionar.id,
          produto_nome: produtoParaAdicionar.nome,
          quantidade: 1,
          preco_unitario: produtoParaAdicionar.preco_venda,
          subtotal: produtoParaAdicionar.preco_venda,
          estoque_disponivel: produtoParaAdicionar.quantidade_estoque,
        };
        setItens([...itens, novoItem]);
      }
    } else {
      setItens([...itens, { produto_id: '', produto_nome: '', quantidade: 1, preco_unitario: 0, subtotal: 0, estoque_disponivel: 0 }]);
    }
  };

  const removeItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItens = [...itens];
    const currentItem = newItens[index];

    if (field === 'produto_id') {
      const produto = produtos.find(p => p.id === value);
      if (produto) {
        currentItem.produto_nome = produto.nome;
        currentItem.preco_unitario = produto.preco_venda;
        currentItem.estoque_disponivel = produto.quantidade_estoque;
        if (currentItem.quantidade > produto.quantidade_estoque) {
          currentItem.quantidade = produto.quantidade_estoque;
        }
      }
    } else if (field === 'quantidade') {
        const produto = produtos.find(p => p.id === currentItem.produto_id);
        if (produto && value > produto.quantidade_estoque) {
            alert(`Quantidade para ${produto.nome} excede o estoque disponível (${produto.quantidade_estoque}).`);
            value = produto.quantidade_estoque;
        }
        currentItem.quantidade = value;
    } else {
        currentItem[field] = value;
    }

    currentItem.subtotal = currentItem.quantidade * currentItem.preco_unitario;
    setItens(newItens);
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) {
      alert('Por favor, selecione um cliente');
      return;
    }

    if (itens.length === 0 || itens.some(item => !item.produto_id || item.quantidade <= 0)) {
      alert('Adicione pelo menos um item válido com quantidade maior que zero.');
      return;
    }

    const data = {
      venda: {
        cliente_id: cliente.id,
        cliente_nome: cliente.nome_completo,
        valor_total: valorTotal,
        forma_pagamento: formaPagamento,
        status: formaPagamento === 'a_vista' ? 'pago' : 'pendente',
        quantidade_parcelas: formaPagamento === 'crediario' ? quantidadeParcelas : null,
        observacoes: observacoes,
        itens: itens,
      },
      produtos: itens,
      parcelas: [],
    };

    if (formaPagamento === 'crediario') {
      const valorParcela = valorTotal / quantidadeParcelas;
      for (let i = 1; i <= quantidadeParcelas; i++) {
        data.parcelas.push({
          cliente_id: cliente.id,
          cliente_nome: cliente.nome_completo,
          cliente_telefone: cliente.telefone,
          numero_parcela: i,
          valor: valorParcela,
          data_vencimento: format(addDays(new Date(), 30 * i), 'yyyy-MM-dd'),
          status: 'pendente',
        });
      }
    }
    onSubmit(data);
  };

  if (isLoadingClientes || isLoadingProdutos) {
    return <div className="flex justify-center items-center p-8"><Loader className="animate-spin" /> Carregando dados...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="cliente">Cliente</Label>
          <Select onValueChange={setClienteId} value={clienteId}>
            <SelectTrigger id="cliente">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome_completo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
          <Select onValueChange={setFormaPagamento} value={formaPagamento}>
            <SelectTrigger id="formaPagamento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a_vista">À Vista</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
              <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
              <SelectItem value="crediario">Crediário (Carnê)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {formaPagamento === 'crediario' && (
        <div>
          <Label htmlFor="parcelas">Número de Parcelas</Label>
          <Input 
            id="parcelas"
            type="number"
            min="1"
            value={quantidadeParcelas}
            onChange={(e) => setQuantidadeParcelas(Number(e.target.value))}
          />
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Itens da Venda</h3>
          {itens.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Select value={item.produto_id} onValueChange={(value) => updateItem(index, 'produto_id', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                        {produtos.map(p => (
                            <SelectItem key={p.id} value={p.id} disabled={p.quantidade_estoque <= 0}>
                                {p.nome} ({p.quantidade_estoque} disp.)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min="1"
                max={item.estoque_disponivel || 1}
                value={item.quantidade}
                onChange={(e) => updateItem(index, 'quantidade', Number(e.target.value))}
                className="col-span-2"
              />
              <Input
                type="number"
                step="0.01"
                value={item.preco_unitario}
                onChange={(e) => updateItem(index, 'preco_unitario', Number(e.target.value))}
                className="col-span-2"
              />
              <div className="col-span-2 font-medium text-right">
                R$ {item.subtotal.toFixed(2)}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeItem(index)}
                className="col-span-1"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addItem(null)}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar Item
          </Button>
        </CardContent>
      </Card>
      
      <div className="text-right">
        <p className="text-lg font-semibold">Valor Total: <span className="text-blue-600">R$ {valorTotal.toFixed(2)}</span></p>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea 
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrar Venda'}
        </Button>
      </div>
    </form>
  );
}