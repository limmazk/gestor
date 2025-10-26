
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, DollarSign, ShoppingCart, Trophy, TrendingDown, BarChart, Star, Package } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { startOfMonth } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, description }) => (
  <Card className="shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function AdminDashboardTab() {
  const allUsers = [];
  const allVendas = [];
  const allClientes = [];
  const allProducts = [];
  const allPayments = [];

  const stats = useMemo(() => {
    // Return early if essential data is not available
    if (allClientes.length === 0 && allVendas.length === 0 && allPayments.length === 0) {
      return { totalClients: 0, adminRevenue: 0, clientGmv: 0, clientRankingChart: [], topPerformers: [], bottomPerformers: [], topMonthlyProducts: [] };
    }

    const totalClients = allClientes.length; // Now correctly reflects the number of registered clients
    
    const adminRevenue = allPayments
      .filter(p => p.status === 'aprovado')
      .reduce((sum, p) => sum + (p.valor || 0), 0);
    
    const clientGmv = allVendas.reduce((sum, v) => sum + (v.valor_total || 0), 0);

    // --- CÁLCULO DOS PRODUTOS MAIS VENDIDOS ---
    const startOfCurrentMonth = startOfMonth(new Date());
    const monthlySales = allVendas.filter(sale => {
      const saleDate = new Date(sale.data_venda || sale.created_date); // Use data_venda or created_date from Venda
      return saleDate >= startOfCurrentMonth;
    });

    const productSales = monthlySales.reduce((acc, sale) => {
      sale.itens?.forEach(item => { // Assuming 'itens' is part of the Venda object
        const productName = item.produto_nome;
        if (!acc[productName]) {
          acc[productName] = { name: productName, quantity: 0, totalValue: 0 };
        }
        acc[productName].quantity += item.quantidade;
        acc[productName].totalValue += item.subtotal;
      });
      return acc;
    }, {});

    const topMonthlyProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    // --- FIM DO CÁLCULO DE PRODUTOS ---


    // 1. Inicializa todos os clientes com vendas zeradas, usando 'allClientes'
    const salesByClient = allClientes
      .reduce((acc, client) => {
        acc[client.id] = { // Use client.id as the key
          name: client.nome || `Cliente ${client.id}`, // Use client.nome
          total: 0,
          salesCount: 0
        };
        return acc;
      }, {});

    // 2. Popula os dados de vendas, usando 'allVendas' e 'cliente_id'
    allVendas.forEach(venda => {
      const clientId = venda.cliente_id; // Link Venda to Cliente via cliente_id
      if (salesByClient[clientId]) {
        salesByClient[clientId].total += venda.valor_total || 0;
        salesByClient[clientId].salesCount += 1;
      }
    });
    
    // 3. Converte para array e ordena do maior para o menor
    const allClientsRanked = Object.values(salesByClient).sort((a, b) => b.total - a.total);

    // 4. Separa os rankings
    const clientRankingChart = allClientsRanked.slice(0, 10);
    const topPerformers = allClientsRanked.slice(0, 5);
    const bottomPerformers = allClientsRanked.slice(-5).reverse();

    return { totalClients, adminRevenue, clientGmv, clientRankingChart, topPerformers, bottomPerformers, topMonthlyProducts };
  }, [allUsers, allPayments, allVendas, allClientes, allProducts]); // Added allClientes to dependencies

  // New memo for top performing clients based on sales from allVendas
  const topClientes = useMemo(() => {
    if (allVendas.length === 0) return [];
    
    const vendasPorCliente = allVendas.reduce((acc, venda) => {
      if (!acc[venda.cliente_id]) {
        acc[venda.cliente_id] = { nome: venda.cliente_nome, total: 0 };
      }
      acc[venda.cliente_id].total += venda.valor_total;
      return acc;
    }, {});
    
    return Object.values(vendasPorCliente)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
      
  }, [allVendas]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Faturamento (Mensalidades)"
          value={`R$ ${stats.adminRevenue.toFixed(2)}`}
          description="Total recebido de todos os clientes"
          icon={DollarSign}
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.totalClients}
          description="Total de sistemas vendidos"
          icon={Users}
        />
        <StatCard
          title="GMV da Plataforma"
          value={`R$ ${stats.clientGmv.toFixed(2)}`}
          description="Volume total de vendas dos seus clientes"
          icon={ShoppingCart}
        />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart className="text-blue-500" /> Desempenho dos Clientes</CardTitle>
          <CardDescription>Visão geral do volume de vendas dos seus principais clientes e pontos de atenção.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-600"><Trophy /> Top 5 Clientes (Mais Vendas)</h3>
              <div className="space-y-3">
                {stats.topPerformers.map((client, index) => (
                  <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-bold text-lg text-green-500 w-8 text-center">{index + 1}</span>
                    <div className="flex-1 ml-2">
                      <p className="font-semibold text-slate-800">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.salesCount} vendas</p>
                    </div>
                    <p className="text-md font-bold text-green-700">R$ {client.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
             <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-red-600"><TrendingDown /> Clientes com Baixo Desempenho</h3>
              <div className="space-y-3">
                {stats.bottomPerformers.map((client, index) => (
                  <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="font-bold text-lg text-red-500 w-8 text-center">{stats.totalClients - index}</span>
                     <div className="flex-1 ml-2">
                      <p className="font-semibold text-slate-800">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.salesCount} vendas</p>
                    </div>
                    <p className="text-md font-bold text-red-700">R$ {client.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <h3 className="font-semibold text-lg mb-4 text-center">Gráfico Top 10 Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={stats.clientRankingChart}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
              <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="total" fill="#1d4ed8" name="Total de Vendas" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>

        </CardContent>
      </Card>
      
      {/* NOVO CARD DE PRODUTOS MAIS VENDIDOS */}
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="text-yellow-400" /> Produtos Mais Vendidos na Plataforma (Mês)</CardTitle>
            <CardDescription>Ranking dos produtos mais vendidos por todos os seus clientes neste mês.</CardDescription>
        </CardHeader>
        <CardContent>
            {stats.topMonthlyProducts.length > 0 ? (
                <div className="space-y-3">
                    {stats.topMonthlyProducts.map((product, index) => (
                        <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="font-bold text-lg text-blue-500 w-8 text-center">#{index + 1}</span>
                            <div className="flex-1 ml-2">
                                <p className="font-semibold text-slate-800">{product.name}</p>
                                <p className="text-xs text-slate-500">
                                    Total de <span className="font-bold">{product.quantity}</span> unidades vendidas
                                </p>
                            </div>
                            <p className="text-md font-bold text-emerald-700">R$ {product.totalValue.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhuma venda registrada na plataforma este mês.</p>
                </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
