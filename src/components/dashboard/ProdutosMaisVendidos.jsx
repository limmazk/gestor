import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProdutosMaisVendidos({ vendas, produtos }) {
  const topProducts = useMemo(() => {
    const productCount = vendas.flatMap(v => v.itens).reduce((acc, item) => {
      acc[item.produto_id] = (acc[item.produto_id] || 0) + item.quantidade;
      return acc;
    }, {});
    
    const produtosMap = produtos.reduce((acc, p) => {
      acc[p.id] = p.nome_produto;
      return acc;
    }, {});

    return Object.entries(productCount)
      .map(([id, count]) => ({ id, name: produtosMap[id] || `Produto ID: ${id}`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

  }, [vendas, produtos]);

  return (
    <Card className="col-span-1 shadow-lg">
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        {topProducts.length > 0 ? (
          <ul className="space-y-4">
            {topProducts.map((p, index) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="font-medium text-slate-800 truncate pr-4">{p.name}</span>
                <Badge variant="secondary" className="text-sm">{p.count} vendidos</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-500 py-8">Nenhuma venda registrada para analisar.</p>
        )}
      </CardContent>
    </Card>
  );
}