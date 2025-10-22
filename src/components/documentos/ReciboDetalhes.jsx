
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function ReciboDetalhes({ recibo }) {
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
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Recibo #{recibo.numero_recibo}</h2>
          <p className="text-slate-600">
            Emitido em {format(new Date(recibo.data_pagamento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
              Imprimir Recibo
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
          <CardTitle>Comprovante de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 bg-emerald-50 rounded-lg text-center">
            <p className="text-sm text-slate-600 mb-2">Valor Recebido</p>
            <p className="text-4xl font-bold text-emerald-600">
              R$ {recibo.valor_pago?.toFixed(2)}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Recebido de</p>
              <p className="font-semibold text-lg">{recibo.cliente_nome}</p>
            </div>
            {recibo.cliente_cpf_cnpj && (
              <div>
                <p className="text-sm text-slate-600">CPF/CNPJ</p>
                <p className="font-semibold">{recibo.cliente_cpf_cnpj}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-600">Data do Pagamento</p>
              <p className="font-semibold">
                {format(new Date(recibo.data_pagamento), 'dd/MM/yyyy')}
              </p>
            </div>
            {recibo.forma_pagamento && (
              <div>
                <p className="text-sm text-slate-600">Forma de Pagamento</p>
                <p className="font-semibold">{recibo.forma_pagamento}</p>
              </div>
            )}
          </div>

          {recibo.referente_a && (
            <div className="pt-4 border-t">
              <p className="text-sm text-slate-600">Referente a</p>
              <p className="font-semibold">{recibo.referente_a}</p>
            </div>
          )}

          {recibo.observacoes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-slate-600">Observações</p>
              <p className="text-sm">{recibo.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-slate-500 pt-6 border-t">
        <p>Este documento comprova o recebimento do valor acima especificado.</p>
      </div>
    </div>
  );
}
