
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Loader, AlertTriangle, User, Users, ShoppingCart, Package, DollarSign, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';

const DetailCard = ({ title, data, renderItem, emptyText, icon: Icon }) => (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-blue-600" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {data && data.length > 0 ? (
                <ul className="space-y-2">
                    {data.map(renderItem)}
                </ul>
            ) : (
                <p className="text-slate-500 text-center py-4">{emptyText}</p>
            )}
        </CardContent>
    </Card>
);

export default function UsuarioDetalhes() {
    const urlParams = new URLSearchParams(window.location.search);
    const userEmail = urlParams.get('email');

    const { data: usuarioData, isLoading: isLoadingUser, error: errorUser } = useQuery({
        queryKey: ['usuarioDetalhes', userEmail],
        queryFn: () => base44.entities.User.filter({ email: userEmail }),
        enabled: !!userEmail,
    });

    const { data: dadosRelacionados, isLoading: isLoadingRelated } = useQuery({
        queryKey: ['dadosRelacionados', userEmail],
        queryFn: async () => {
            if (!userEmail) return null;
            const user = (await base44.entities.User.filter({ email: userEmail }))[0];
            if (!user) return { clientes: [], vendas: [], pagamentos: [] };
            
            const clientes = await base44.entities.Cliente.filter({ created_by: user.email });
            const vendas = await base44.entities.Venda.filter({ created_by: user.email });
            const pagamentos = await base44.entities.Pagamento.filter({ empresa_id: user.id });
            return { clientes, vendas, pagamentos };
        },
        enabled: !!userEmail,
    });

    const produtosVendidos = useMemo(() => {
        if (!dadosRelacionados?.vendas) return [];

        const produtosAgregados = {};

        dadosRelacionados.vendas.forEach(venda => {
            if (venda.itens && Array.isArray(venda.itens)) {
                venda.itens.forEach(item => {
                    if (!produtosAgregados[item.produto_id]) {
                        produtosAgregados[item.produto_id] = {
                            id: item.produto_id,
                            nome: item.produto_nome,
                            quantidade: 0,
                        };
                    }
                    produtosAgregados[item.produto_id].quantidade += item.quantidade;
                });
            }
        });

        return Object.values(produtosAgregados).sort((a, b) => b.quantidade - a.quantidade);
    }, [dadosRelacionados]);

    const usuario = usuarioData?.[0];

    if (!userEmail) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                <h2 className="text-xl font-semibold">Email do usuário não fornecido.</h2>
                <p className="text-slate-600">Por favor, acesse esta página a partir da tela de Administração.</p>
                <Link to={createPageUrl("Administracao")}>
                    <Button className="mt-4">Voltar para Administração</Button>
                </Link>
            </div>
        );
    }

    if (isLoadingUser || isLoadingRelated) {
        return (
            <div className="p-8 text-center flex items-center justify-center gap-3">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-slate-600 text-lg">Carregando detalhes do usuário...</p>
            </div>
        );
    }

    if (errorUser || !usuario) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-semibold">Erro ao carregar dados do usuário.</h2>
                <p className="text-slate-600">O usuário com o email "{userEmail}" não foi encontrado ou ocorreu um erro.</p>
                 <Link to={createPageUrl("Administracao")}>
                    <Button className="mt-4">Voltar para Administração</Button>
                </Link>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link to={createPageUrl("Administracao")}>
                        <Button variant="outline" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar para Administração
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">Detalhes de: {usuario.full_name}</h1>
                    <p className="text-slate-600">{usuario.email}</p>
                </div>

                <Card className="mb-6 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600" />Informações Gerais</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4">
                        <div><strong>ID:</strong> {usuario.id}</div>
                        <div><strong>Nome:</strong> {usuario.full_name}</div>
                        <div><strong>Status:</strong> <Badge variant={usuario.status === 'ativo' ? 'success' : 'destructive'}>{usuario.status}</Badge></div>
                        <div><strong>Data de Cadastro:</strong> {format(new Date(usuario.created_date), 'dd/MM/yyyy')}</div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                    <DetailCard
                        title="Clientes Cadastrados"
                        icon={Users}
                        data={dadosRelacionados?.clientes}
                        emptyText="Nenhum cliente cadastrado por este usuário."
                        renderItem={(cliente) => (
                            <li key={cliente.id} className="p-2 bg-slate-50 rounded-md">
                                {cliente.nome_completo} ({cliente.telefone})
                            </li>
                        )}
                    />
                    <DetailCard
                        title="Vendas Realizadas"
                        icon={ShoppingCart}
                        data={dadosRelacionados?.vendas}
                        emptyText="Nenhuma venda realizada por este usuário."
                        renderItem={(venda) => (
                             <li key={venda.id} className="p-2 bg-slate-50 rounded-md flex justify-between">
                                <span>Venda #{venda.numero_venda} para {venda.cliente_nome}</span>
                                <span className="font-bold">R$ {venda.valor_total?.toFixed(2)}</span>
                            </li>
                        )}
                    />
                    <DetailCard
                        title="Produtos Mais Vendidos"
                        icon={Package}
                        data={produtosVendidos}
                        emptyText="Nenhum produto foi vendido por este usuário."
                        renderItem={(produto) => (
                            <li key={produto.id} className="p-2 bg-slate-50 rounded-md flex justify-between">
                                <span>{produto.nome}</span>
                                <span className="font-bold">{produto.quantidade} unidades</span>
                            </li>
                        )}
                    />
                    <DetailCard
                        title="Pagamentos de Mensalidade"
                        icon={DollarSign}
                        data={dadosRelacionados?.pagamentos}
                        emptyText="Nenhum pagamento de mensalidade encontrado."
                        renderItem={(pagamento) => (
                            <li key={pagamento.id} className="p-2 bg-slate-50 rounded-md flex justify-between items-center">
                                <div>
                                    <p>Mês: {pagamento.mes_referencia}</p>
                                    <p className="text-sm text-slate-600">Valor: R$ {pagamento.valor?.toFixed(2)}</p>
                                </div>
                                <Badge variant={pagamento.status === 'aprovado' ? 'success' : 'secondary'}>{pagamento.status}</Badge>
                            </li>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
