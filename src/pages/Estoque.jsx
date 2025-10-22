
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Plus, Edit, Loader, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ImportarDadosDialog from '../components/shared/ImportarDadosDialog';

const produtoSchema = {
    type: "object",
    properties: {
        produtos: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    nome_produto: { type: "string" },
                    sku: { type: "string" },
                    codigo_barras: { type: "string" },
                    preco_venda: { type: "number" },
                    quantidade_estoque: { type: "number" }
                },
                required: ["nome_produto", "preco_venda"]
            }
        }
    }
};

const produtoInstructions = {
    description: "Crie um arquivo CSV com os dados dos seus produtos. A primeira linha deve ser o cabeçalho. As colunas podem estar em qualquer ordem.",
    csvHeaders: "nome_produto,sku,codigo_barras,preco_venda,quantidade_estoque"
};

export default function Estoque() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({ nome_produto: '', sku: '', codigo_barras: '', preco_venda: '', quantidade_estoque: '' });
  const [query, setQuery] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list('-created_date'),
    initialData: []
  });

  const createProductMutation = useMutation({
    mutationFn: (newProduct) => base44.entities.Produto.create(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtosParaVenda'] });
      toast({
        title: "Sucesso!",
        description: `Produto "${form.nome_produto}" adicionado.`,
        variant: "success",
      });
      setForm({ nome_produto: '', sku: '', codigo_barras: '', preco_venda: '', quantidade_estoque: '' });
    },
    onError: (error) => toast({ title: "Erro", description: error.message, variant: "destructive" })
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Produto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtosParaVenda'] });
    },
    onError: (error) => toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" })
  });
  
  function handleAdd(e) {
    e.preventDefault();
    if (!form.nome_produto || !form.preco_venda) {
        toast({ title: "Campos obrigatórios", description: "Nome e Preço de Venda são obrigatórios.", variant: "warning" });
        return;
    }
    
    const productData = { 
        ...form, 
        preco_venda: form.preco_venda ? Number(form.preco_venda) : 0,
        quantidade_estoque: form.quantidade_estoque ? Number(form.quantidade_estoque) : 0,
    };
    createProductMutation.mutate(productData);
  }

  function handleIncrementStock(product) {
      const currentStock = Number(product.quantidade_estoque || 0);
      updateProductMutation.mutate({ id: product.id, data: { quantidade_estoque: currentStock + 1 } });
  }

  const results = products.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (p.nome_produto && p.nome_produto.toLowerCase().includes(q)) ||
           (p.sku && p.sku.toLowerCase().includes(q)) ||
           (p.codigo_barras && p.codigo_barras.toString().includes(q));
  });

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Estoque ({products.length})
          </h1>
          <Button onClick={() => setIsImportOpen(true)} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Importar Produtos
          </Button>
        </div>

      <Card className="mb-8">
        <CardHeader><CardTitle>Adicionar Novo Produto</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <Label htmlFor="prodNomeProduto">Nome do Produto *</Label>
              <Input id="prodNomeProduto" placeholder="Ex: Camiseta Branca" value={form.nome_produto} onChange={e => setForm({ ...form, nome_produto: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="prodSku">SKU</Label>
              <Input id="prodSku" placeholder="SKU-123" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
            </div>
             <div className="space-y-1">
              <Label htmlFor="prodCodigoBarras">Cód. Barras</Label>
              <Input id="prodCodigoBarras" placeholder="789..." value={form.codigo_barras} onChange={e => setForm({ ...form, codigo_barras: e.target.value })} />
            </div>
             <div className="space-y-1">
              <Label htmlFor="prodPrecoVenda">Preço de Venda (R$) *</Label>
              <Input id="prodPrecoVenda" type="number" placeholder="29.90" value={form.preco_venda} onChange={e => setForm({ ...form, preco_venda: e.target.value })} />
            </div>
             <div className="space-y-1">
              <Label htmlFor="prodQtd">Quantidade em Estoque</Label>
              <Input id="prodQtd" type="number" placeholder="100" value={form.quantidade_estoque} onChange={e => setForm({ ...form, quantidade_estoque: e.target.value })} />
            </div>
            <Button type="submit" disabled={createProductMutation.isPending}>
                {createProductMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} 
                Adicionar Produto
            </Button>
          </form>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
           <Input placeholder="Buscar por nome, SKU ou cód. de barras..." value={query} onChange={e => setQuery(e.target.value)} className="mt-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-4"><Loader className="w-6 h-6 animate-spin mx-auto"/></div>
          ) : (
            <ul className="space-y-3">
              {results.map(p => (
                <li key={p.id} className="p-3 bg-slate-50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="font-bold">{p.nome_produto}</p>
                    <p className="text-sm text-slate-600">SKU: {p.sku || 'N/A'} | Cód. Barras: {p.codigo_barras || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-center">
                     <p className="font-semibold">Qtd: <span className="text-blue-600">{p.quantidade_estoque || 0}</span></p>
                     <p className="font-semibold">Preço: <span className="text-emerald-600">R$ {Number(p.preco_venda || 0).toFixed(2)}</span></p>
                     <Button variant="outline" size="sm" onClick={() => handleIncrementStock(p)}>+1</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>

    <ImportarDadosDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        entityName="Produto"
        jsonSchema={produtoSchema}
        instructions={produtoInstructions}
        onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            queryClient.invalidateQueries({ queryKey: ['produtosParaVenda'] });
            toast({
                title: "Sucesso!",
                description: "Produtos importados com sucesso.",
                variant: "success",
            });
        }}
        onError={(error) => {
            toast({
                title: "Erro na importação",
                description: error.message || "Ocorreu um erro ao importar os produtos.",
                variant: "destructive",
            });
        }}
    />

  </div>
  );
}
