import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, UserCheck, Search, Barcode, Trash2, Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Vendas() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [clientQuery, setClientQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [cart, setCart] = useState([]);
  const [barcodeSearch, setBarcodeSearch] = useState('');

  // const { data: clients = [] } = useQuery({
  //   queryKey: ['clientesParaVenda', clientQuery],
  //   queryFn: () => {
  //     if (!clientQuery) return base44.entities.Cliente.list(null, 20);
  //     return base44.entities.Cliente.filter({ name: { contains: clientQuery } });
  //   }
  // });
  const clients = [];

  // const { data: products = [] } = useQuery({
  //   queryKey: ['produtosParaVenda'],
  //   queryFn: () => base44.entities.Produto.list()
  // });
  const products = [];

  // const addSaleMutation = useMutation({
  //   mutationFn: (newSale) => base44.entities.Venda.create(newSale),
  //   onSuccess: async (data) => {
  //     const stockUpdatePromises = data.itens.map(item => {
  //       const product = products.find(p => p.id === item.produto_id);
  //       if (product && typeof product.quantidade_estoque === 'number') {
  //         return base44.entities.Produto.update(product.id, {
  //           quantidade_estoque: product.quantidade_estoque - item.quantidade
  //         });
  //       }
  //       return Promise.resolve();
  //     });

  //     await Promise.all(stockUpdatePromises);

  //     queryClient.invalidateQueries({ queryKey: ['produtos'] });
  //     queryClient.invalidateQueries({ queryKey: ['vendas'] });
  //     queryClient.invalidateQueries({ queryKey: ['todasAsVendas'] });
  //     queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  //     queryClient.invalidateQueries({ queryKey: ['parcelas'] });
      
  //     toast({
  //       title: "Venda Registrada!",
  //       description: "A venda foi salva e o estoque atualizado.",
  //       variant: "success"
  //     });

  //     setCart([]);
  //     setSelectedClient(null);
  //     setClientQuery('');
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Erro ao registrar venda",
  //       description: error.message,
  //       variant: "destructive"
  //     });
  //   }
  // });
  const addSaleMutation = { mutate: () => {}, isPending: false };

  function addToCart(product, qty = 1) {
    if (!product) return;
    setCart(prev => {
      const found = prev.find(i => i.produto_id === product.id);
      if (found) {
        return prev.map(i => i.produto_id === product.id ? { ...i, quantidade: i.quantidade + qty } : i);
      }
      return [...prev, {
        produto_id: product.id,
        produto_nome: product.nome_produto,
        valor_unitario: product.preco_venda,
        quantidade: qty,
        subtotal: product.preco_venda * qty
      }];
    });
  }

  function handleBarcodeSearch(e) {
    e.preventDefault();
    if (!barcodeSearch) return;
    const p = products.find(p => p.codigo_barras && p.codigo_barras.toString() === barcodeSearch.toString());
    if (!p) {
        toast({ title: "Produto não encontrado", variant: "warning" });
        return;
    }
    addToCart(p, 1);
    setBarcodeSearch('');
  }
  
  function removeFromCart(productId) {
      setCart(prev => prev.filter(item => item.produto_id !== productId));
  }

  function handleFinishSale() {
    if (!selectedClient) {
      toast({ title: "Selecione um cliente para a venda.", variant: "warning" });
      return;
    }
    if (cart.length === 0) {
      toast({ title: "O carrinho está vazio.", variant: "warning" });
      return;
    }

    const valor_total = cart.reduce((s, it) => s + it.subtotal, 0);
    
    addSaleMutation.mutate({ 
      cliente_id: selectedClient.id, 
      cliente_nome: selectedClient.name,
      itens: cart, 
      valor_total 
    });
  }
  
  const cartTotal = useMemo(() => cart.reduce((s, it) => s + (it.valor_unitario || 0) * it.quantidade, 0), [cart]);

  return (
    <div className="p-4 md:p-8 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          Nova Venda
        </h1>

        <Card>
            <CardHeader><CardTitle>1. Selecione o Cliente</CardTitle></CardHeader>
            <CardContent>
                 {selectedClient ? (
                    <div className="flex items-center justify-between p-4 bg-blue-50 text-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 font-semibold">
                            <UserCheck />
                            <span>{selectedClient.name}</span>
                        </div>
                        <Button variant="ghost" onClick={() => setSelectedClient(null)}>Trocar</Button>
                    </div>
                ) : (
                    <div>
                        <Input placeholder="Buscar cliente por nome..." value={clientQuery} onChange={e => setClientQuery(e.target.value)} />
                        <ul className="mt-2 max-h-40 overflow-y-auto space-y-1">
                            {clients.map(c => (
                                <li key={c.id}>
                                    <Button variant="outline" className="w-full justify-start" onClick={() => setSelectedClient(c)}>{c.name}</Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>2. Adicione Produtos</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleBarcodeSearch} className="flex gap-2 mb-4">
                    <Input placeholder="Escanear ou digitar código de barras..." value={barcodeSearch} onChange={e => setBarcodeSearch(e.target.value)} />
                    <Button type="submit"><Barcode className="w-5 h-5"/></Button>
                </form>
                <p className="text-center text-sm text-slate-500 my-2">OU</p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {products.map(p => (
                        <Button key={p.id} variant="secondary" className="w-full justify-between" onClick={() => addToCart(p, 1)} disabled={(p.quantidade_estoque || 0) <= 0}>
                           <span>{p.nome_produto}</span> <Badge>Qtd: {p.quantidade_estoque || 0}</Badge>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>

      </div>
      <div className="md:col-span-1 space-y-6">
        <Card className="sticky top-8">
            <CardHeader><CardTitle>Carrinho</CardTitle></CardHeader>
            <CardContent>
                {cart.length > 0 ? (
                    <ul className="space-y-3 mb-4">
                        {cart.map((item) => (
                            <li key={item.produto_id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{item.produto_nome}</p>
                                    <p className="text-sm text-slate-600">{item.quantidade} x R$ {Number(item.valor_unitario || 0).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold">R$ {((item.quantidade * (item.valor_unitario || 0))).toFixed(2)}</p>
                                    <Button variant="destructive" size="icon" onClick={() => removeFromCart(item.produto_id)}>
                                        <Trash2 className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 py-8">O carrinho está vazio.</p>
                )}
                <div className="border-t pt-4 flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full mt-6" onClick={handleFinishSale} disabled={cart.length === 0 || !selectedClient || addSaleMutation.isPending}>
                   {addSaleMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Finalizar Venda
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}