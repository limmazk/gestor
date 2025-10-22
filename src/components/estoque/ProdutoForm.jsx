
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
import { Barcode } from "lucide-react";

export default function ProdutoForm({ produto, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(produto || {
    nome: '',
    codigo: '',
    descricao: '',
    categoria: 'outros',
    preco_venda: 0,
    preco_custo: 0,
    quantidade_estoque: 0,
    estoque_minimo: 5,
    unidade: 'un',
    status: 'ativo'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Produto *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="codigo" className="flex items-center gap-2">
            <Barcode className="w-4 h-4" />
            Código/SKU
          </Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            placeholder="Clique e escaneie o código"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria *</Label>
          <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roupas">Roupas</SelectItem>
              <SelectItem value="calcados">Calçados</SelectItem>
              <SelectItem value="acessorios">Acessórios</SelectItem>
              <SelectItem value="eletronicos">Eletrônicos</SelectItem>
              <SelectItem value="moveis">Móveis</SelectItem>
              <SelectItem value="alimentos">Alimentos</SelectItem>
              <SelectItem value="bebidas">Bebidas</SelectItem>
              <SelectItem value="servicos">Serviços</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unidade">Unidade de Medida</Label>
          <Select value={formData.unidade} onValueChange={(value) => setFormData({...formData, unidade: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="un">Unidade</SelectItem>
              <SelectItem value="kg">Quilograma</SelectItem>
              <SelectItem value="g">Grama</SelectItem>
              <SelectItem value="l">Litro</SelectItem>
              <SelectItem value="ml">Mililitro</SelectItem>
              <SelectItem value="m">Metro</SelectItem>
              <SelectItem value="cm">Centímetro</SelectItem>
              <SelectItem value="par">Par</SelectItem>
              <SelectItem value="cx">Caixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preco_venda">Preço de Venda (R$) *</Label>
          <Input
            id="preco_venda"
            type="number"
            step="0.01"
            min="0"
            value={formData.preco_venda}
            onChange={(e) => setFormData({...formData, preco_venda: parseFloat(e.target.value) || 0})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="preco_custo">Preço de Custo (R$)</Label>
          <Input
            id="preco_custo"
            type="number"
            step="0.01"
            min="0"
            value={formData.preco_custo}
            onChange={(e) => setFormData({...formData, preco_custo: parseFloat(e.target.value) || 0})}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantidade_estoque">Quantidade em Estoque *</Label>
          <Input
            id="quantidade_estoque"
            type="number"
            min="0"
            value={formData.quantidade_estoque}
            onChange={(e) => setFormData({...formData, quantidade_estoque: parseFloat(e.target.value) || 0})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
          <Input
            id="estoque_minimo"
            type="number"
            min="0"
            value={formData.estoque_minimo}
            onChange={(e) => setFormData({...formData, estoque_minimo: parseFloat(e.target.value) || 5})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Produto'}
        </Button>
      </div>
    </form>
  );
}
