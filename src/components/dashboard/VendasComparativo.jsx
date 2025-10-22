import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VendasComparativo({ vendas }) {
  const data = useMemo(() => {
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      return startOfMonth(subMonths(new Date(), 5 - i));
    });

    const salesByMonth = last6Months.map(monthStart => {
      const monthKey = format(monthStart, 'MMM/yy', { locale: ptBR });
      const total = vendas
        .filter(v => format(new Date(v.created_date), 'yyyy-MM') === format(monthStart, 'yyyy-MM'))
        .reduce((sum, v) => sum + (v.valor_total || 0), 0);
      return { name: monthKey.charAt(0).toUpperCase() + monthKey.slice(1), "Vendas (R$)": total };
    });

    return salesByMonth;
  }, [vendas]);

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-lg">
      <CardHeader>
        <CardTitle>Análise de Vendas (Últimos 6 Meses)</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
            <Tooltip
              formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Total']}
              cursor={{ fill: 'rgba(60, 100, 200, 0.1)' }}
            />
            <Bar dataKey="Vendas (R$)" fill="url(#colorVendas)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}