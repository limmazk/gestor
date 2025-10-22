
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

const DetailItem = ({ label, value, className = "" }) => (
  <div>
    <p className="text-sm text-slate-600">{label}</p>
    {typeof value === 'string' ? (
      <p className={`font-semibold ${className}`}>{value}</p>
    ) : (
      <div className={`font-semibold ${className}`}>{value}</div>
    )}
  </div>
);

const MovimentacaoEstoque = ({ produtoId }) => {
    const { data: movimentacoes, isLoading } = useQuery({
        queryKey: ['movimentacaoEstoque', produtoId],
        queryFn: () => base44.entities.MovimentacaoEstoque.filter({ produto_id: produtoId }, '-created_date'),
        enabled: !!produtoId,
    });

    if (isLoading) return <p className="text-center py-4">Carregando histórico...</p>;

    return (
        <div className="mt-4 space-y-3">
            {movimentacoes?.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhuma movimentação registrada para este produto.</p>
            ) : (
                movimentacoes?.map(mov => (
                    <div key={mov.id} className={`p-3 rounded-lg flex justify-between items-center ${mov.tipo === 'entrada' ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div>
                            <p className="font-semibold capitalize">{mov.tipo}</p>
                            <p className="text-sm text-slate-600">{mov.observacao || 'Sem observação'}</p>
                            <p className="text-xs text-slate-500">
                                {format(new Date(mov.created_date), "dd/MM/yyyy HH:mm")} por {mov.responsavel || 'Desconhecido'}
                            </p>
                        </div>
                        <div className={`font-bold text-lg ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                            {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};


export default function ProdutoDetalhes({ produto }) {
  if (!produto) return null;

  const baixoEstoque = produto.quantidade_estoque <= (produto.estoque_minimo || 5);

  return (
    <Tabs defaultValue="detalhes" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="detalhes">Detalhes do Produto</TabsTrigger>
        <TabsTrigger value="historico">Histórico de Movimentação</TabsTrigger>
      </TabsList>
      <TabsContent value="detalhes">
        <div className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <DetailItem label="Nome do Produto" value={produto.nome} />
                {produto.codigo && <DetailItem label="Código/SKU" value={produto.codigo} />}
                <DetailItem label="Categoria" value={<Badge variant="secondary">{produto.categoria}</Badge>} />
                <DetailItem label="Status" value={<Badge variant={produto.status === 'ativo' ? 'secondary' : 'destructive'}>{produto.status}</Badge>} />
              </div>
              {produto.descricao && (
                <div className="pt-4 mt-4 border-t">
                  <DetailItem label="Descrição" value={produto.descricao} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Preço de Venda</p>
                    <p className="text-xl font-bold text-emerald-600">
                      R$ {produto.preco_venda?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {produto.preco_custo > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Margem de Lucro</p>
                      <p className="text-xl font-bold text-blue-600">
                        {produto.preco_custo > 0 
                          ? ((produto.preco_venda - produto.preco_custo) / produto.preco_custo * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className={baixoEstoque ? 'border-2 border-orange-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${baixoEstoque ? 'bg-orange-100' : 'bg-purple-100'}`}>
                    {baixoEstoque ? (
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    ) : (
                      <Package className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Estoque Atual</p>
                    <p className={`text-xl font-bold ${baixoEstoque ? 'text-orange-600' : 'text-purple-600'}`}>
                      {produto.quantidade_estoque} {produto.unidade}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {produto.preco_custo > 0 && (
                  <DetailItem label="Preço de Custo" value={`R$ ${produto.preco_custo.toFixed(2)}`} />
                )}
                <DetailItem label="Unidade de Medida" value={produto.unidade} />
                <DetailItem label="Estoque Mínimo" value={`${produto.estoque_minimo || 5} ${produto.unidade}`} />
                {baixoEstoque && (
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <AlertTriangle className="w-5 h-5" />
                      <p className="font-semibold">
                        Atenção: Estoque abaixo do mínimo recomendado!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </TabsContent>
      <TabsContent value="historico">
        <MovimentacaoEstoque produtoId={produto.id} />
      </TabsContent>
    </Tabs>
  );
}
