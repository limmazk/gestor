
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NotaDetalhes({ nota }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="printable-area">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            box-sizing: border-box; /* Ensure padding is included in width */
            background-color: white; /* Ensure background is white for printing */
          }
          .no-print {
            display: none !important;
          }
          /* Specific styles for better print readability, if needed */
          h2 { font-size: 1.5em !important; }
          .text-slate-600 { color: #4a5568 !important; }
          .font-semibold { font-weight: 600 !important; }
          .text-emerald-600 { color: #059669 !important; }
          .p-3 { padding: 12px !important; }
          .mt-6 { margin-top: 24px !important; }
          .pt-4 { padding-top: 16px !important; }
          .border-t { border-top-width: 1px !important; border-top-color: #e2e8f0 !important; }
          .text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        }
      `}</style>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Nota de Serviço #{nota.numero_nota}</h2>
          <p className="text-slate-600">
            Emitida em {format(new Date(nota.data_emissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 no-print">
              Opções
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handlePrint} className="gap-2 cursor-pointer">
              <Printer className="w-4 h-4" />
              Imprimir Documento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint} className="gap-2 cursor-pointer">
              <Download className="w-4 h-4" />
              Salvar como PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-slate-600">Nome</p>
            <p className="font-semibold">{nota.cliente_nome}</p>
          </div>
          {nota.cliente_cpf_cnpj && (
            <div>
              <p className="text-sm text-slate-600">CPF/CNPJ</p>
              <p className="font-semibold">{nota.cliente_cpf_cnpj}</p>
            </div>
          )}
          {nota.cliente_endereco && (
            <div>
              <p className="text-sm text-slate-600">Endereço</p>
              <p className="font-semibold">{nota.cliente_endereco}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens/Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nota.itens?.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.descricao}</p>
                  <p className="text-sm text-slate-600">
                    {item.quantidade} x R$ {item.valor_unitario?.toFixed(2)}
                  </p>
                </div>
                <p className="font-bold text-emerald-600">
                  R$ {item.valor_total?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Valor Total:</span>
              <span className="text-3xl font-bold text-emerald-600">
                R$ {nota.valor_total?.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {nota.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{nota.observacoes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
