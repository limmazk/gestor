
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Printer } from "lucide-react";
import { format } from "date-fns";

export default function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState("");
  const [dadosRelatorio, setDadosRelatorio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGerarRelatorio = async () => {
    if (!tipoRelatorio) return;
    setIsLoading(true);
    let data = [];
    try {
      switch (tipoRelatorio) {
        case "vendas_mes":
          data = await base44.entities.Venda.list("-data_venda", 100);
          break;
        case "clientes_ativos":
          data = await base44.entities.Cliente.filter({ status: 'ativo' });
          break;
        case "produtos_mais_vendidos":
          // This is a complex query, for now we list all products
          data = await base44.entities.Produto.list();
          break;
        case "parcelas_atrasadas":
          data = await base44.entities.Parcela.filter({ status: 'atrasado' });
          break;
        default:
          break;
      }
      setDadosRelatorio(data);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRelatorio = () => {
    if (!dadosRelatorio) return <p className="text-center text-slate-500">Nenhum relatório gerado.</p>;

    switch (tipoRelatorio) {
      case "vendas_mes":
        return (
          <table className="w-full" id="tabela-relatorio">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Nº Venda</th>
                <th className="text-left p-2">Cliente</th>
                <th className="text-left p-2">Data</th>
                <th className="text-right p-2">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {dadosRelatorio.map(v => (
                <tr key={v.id} className="border-b">
                  <td className="p-2">{v.numero_venda}</td>
                  <td className="p-2">{v.cliente_nome}</td>
                  <td className="p-2">{format(new Date(v.data_venda), "dd/MM/yyyy")}</td>
                  <td className="text-right p-2 font-semibold">R$ {v.valor_total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      // Add other cases here
      default:
        return <pre>{JSON.stringify(dadosRelatorio, null, 2)}</pre>;
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #relatorio-imprimir, #relatorio-imprimir * {
            visibility: visible;
          }
          #relatorio-imprimir {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Relatórios
          </h1>
          <p className="text-slate-600 mt-1">Gere e visualize relatórios do seu negócio</p>
        </div>

        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendas_mes">Vendas do Mês</SelectItem>
                    <SelectItem value="clientes_ativos">Clientes Ativos</SelectItem>
                    <SelectItem value="produtos_mais_vendidos">Produtos Mais Vendidos (Simplificado)</SelectItem>
                    <SelectItem value="parcelas_atrasadas">Parcelas em Atraso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleGerarRelatorio} 
                disabled={!tipoRelatorio || isLoading} 
                className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
              >
                {isLoading ? "Gerando..." : "Gerar Relatório"}
              </Button>
              <Button onClick={handlePrint} variant="outline" disabled={!dadosRelatorio} className="w-full md:w-auto">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg" id="relatorio-imprimir">
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            {renderRelatorio()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
