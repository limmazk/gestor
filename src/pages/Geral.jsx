import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, UserCheck, Search, Barcode, Trash2, Loader, DollarSign, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from '@/components/ui/separator';
import AttractScreen from '../components/pdv/AttractScreen';

export default function Geral() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const productInputRef = useRef(null);

    const [clientQuery, setClientQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [cart, setCart] = useState([]);
    const [productSearch, setProductSearch] = useState('');

    const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });
    const { data: products = [] } = useQuery({ queryKey: ['produtosParaVenda'], queryFn: () => base44.entities.Produto.list() });
    const { data: clients = [] } = useQuery({
        queryKey: ['clientesParaVenda', clientQuery],
        queryFn: () => clientQuery ? base44.entities.Cliente.filter({ name: { contains: clientQuery } }) : base44.entities.Cliente.list(null, 10),
        enabled: !selectedClient
    });

    useEffect(() => {
        // Foca no input de produto apenas quando a tela de venda ativa estiver visível
        if (cart.length > 0 || selectedClient) {
            productInputRef.current?.focus();
        }
    }, [cart, selectedClient]);

    const addSaleMutation = useMutation({
        mutationFn: (newSale) => base44.entities.Venda.create(newSale),
        onSuccess: async (data) => {
            const stockUpdatePromises = data.itens.map(item => {
                const product = products.find(p => p.id === item.produto_id);
                if (product && typeof product.quantidade_estoque === 'number') {
                    return base44.entities.Produto.update(product.id, { quantidade_estoque: product.quantidade_estoque - item.quantidade });
                }
                return Promise.resolve();
            });
            await Promise.all(stockUpdatePromises);

            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            queryClient.invalidateQueries({ queryKey: ['vendas', 'todasAsVendas', 'dashboard', 'parcelas'] });
            
            toast({ title: "Venda Finalizada!", description: "Venda registrada e estoque atualizado.", variant: "success" });
            handleCancelSale();
        },
        onError: (error) => toast({ title: "Erro ao finalizar venda", description: error.message, variant: "destructive" })
    });

    const addToCart = (product, qty = 1) => {
        if (!product || (product.quantidade_estoque || 0) <= 0) {
            toast({ title: "Produto esgotado!", variant: 'warning' });
            return;
        }
        setCart(prev => {
            const found = prev.find(i => i.produto_id === product.id);
            if (found) {
                return prev.map(i => i.produto_id === product.id ? { ...i, quantidade: i.quantidade + qty, subtotal: (i.quantidade + qty) * i.valor_unitario } : i);
            }
            return [...prev, {
                produto_id: product.id,
                produto_nome: product.nome_produto,
                valor_unitario: product.preco_venda,
                quantidade: qty,
                subtotal: product.preco_venda * qty
            }];
        });
    };

    const handleProductSearch = (e) => {
        e.preventDefault();
        if (!productSearch) return;

        let p = products.find(prod => prod.codigo_barras && prod.codigo_barras.toString() === productSearch);
        if (!p) {
             p = products.find(prod => prod.nome_produto.toLowerCase().includes(productSearch.toLowerCase()));
        }

        if (!p) {
            toast({ title: "Produto não encontrado", variant: "warning" });
            return;
        }
        addToCart(p, 1);
        setProductSearch('');
        productInputRef.current?.focus();
    };

    const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.produto_id !== productId));

    const handleCancelSale = () => {
        setCart([]);
        setSelectedClient(null);
        setClientQuery('');
        setProductSearch('');
    };

    const handleFinishSale = () => {
        if (!selectedClient) {
            toast({ title: "Selecione um cliente para a venda.", variant: "warning" });
            return;
        }
        if (cart.length === 0) {
            toast({ title: "A cesta está vazia.", variant: "warning" });
            return;
        }
        addSaleMutation.mutate({
            cliente_id: selectedClient.id,
            cliente_nome: selectedClient.name,
            itens: cart,
            valor_total: cartTotal
        });
    };

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);

    // Condição para mostrar a tela de espera
    const showIdleScreen = cart.length === 0 && !selectedClient;

    return (
        <div className="h-full bg-slate-100 flex flex-col">
            {showIdleScreen ? (
                <AttractScreen logoUrl={user?.logo_url} companyName={user?.full_name} />
            ) : (
                <>
                    <header className="bg-white p-4 border-b flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-800">PDV Geral</h1>
                        {user?.logo_url && <img src={user.logo_url} alt="Logo" className="h-10 object-contain" />}
                    </header>
                    
                    <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
                        {/* Coluna Esquerda e Central (Itens e Busca) */}
                        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
                            <form onSubmit={handleProductSearch} className="flex gap-2 mb-4">
                                <Input
                                    ref={productInputRef}
                                    placeholder="Ler código de barras ou buscar por nome..."
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                    className="text-lg p-6"
                                />
                                <Button type="submit" size="lg"><Search className="w-6 h-6"/></Button>
                            </form>

                            <Card className="flex-1 flex flex-col overflow-hidden">
                                <CardHeader>
                                    <CardTitle>Cesta de Compras ({cart.length})</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 overflow-y-auto">
                                    <ScrollArea className="h-full">
                                        <ul className="p-6 space-y-3">
                                            {cart.map(item => (
                                                <li key={item.produto_id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{item.produto_nome}</p>
                                                        <p className="text-sm text-slate-500">{item.quantidade} x R$ {Number(item.valor_unitario || 0).toFixed(2)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <p className="font-bold text-md">R$ {item.subtotal.toFixed(2)}</p>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => removeFromCart(item.produto_id)}>
                                                            <Trash2 className="w-4 h-4"/>
                                                        </Button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        {cart.length === 0 && <p className="text-center text-slate-500 py-16">Aguardando produtos...</p>}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Coluna Direita (Resumo e Ações) */}
                        <div className="flex flex-col gap-4">
                            <Card>
                                <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
                                <CardContent>
                                    {selectedClient ? (
                                        <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-800 rounded-lg">
                                            <div className="flex items-center gap-3 font-semibold">
                                                <UserCheck /><span>{selectedClient.name}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}><X className="w-4 h-4"/></Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Input placeholder="Buscar cliente por nome..." value={clientQuery} onChange={e => setClientQuery(e.target.value)} />
                                            <ScrollArea className="h-32 mt-2">
                                                <ul className="space-y-1">
                                                    {clients.map(c => (
                                                        <li key={c.id}>
                                                            <Button variant="outline" className="w-full justify-start" onClick={() => setSelectedClient(c)}>{c.name}</Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </ScrollArea>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="flex-1 bg-slate-800 text-white flex flex-col">
                                <CardHeader><CardTitle>Resumo da Venda</CardTitle></CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-baseline mb-4">
                                            <span className="text-xl text-slate-300">Subtotal</span>
                                            <span className="text-2xl font-semibold">R$ {cartTotal.toFixed(2)}</span>
                                        </div>
                                        <Separator className="bg-slate-600"/>
                                        <div className="flex justify-between items-baseline mt-4 text-green-400">
                                            <span className="text-3xl font-bold">TOTAL</span>
                                            <span className="text-4xl font-extrabold">R$ {cartTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 space-y-3">
                                        <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-7" onClick={handleFinishSale} disabled={cart.length === 0 || !selectedClient || addSaleMutation.isPending}>
                                            {addSaleMutation.isPending ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <DollarSign className="w-5 h-5 mr-2" />}
                                            Finalizar Venda
                                        </Button>
                                        <Button size="lg" variant="destructive" className="w-full text-lg py-7" onClick={handleCancelSale}>
                                            <X className="w-5 h-5 mr-2" />
                                            Cancelar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </>
            )}
        </div>
    );
}