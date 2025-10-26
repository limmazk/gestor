import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, CreditCard, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function VendaDetalhes({ venda }) {
  const parcelas = [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Venda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Número da Venda</p>
              <p className="font-bold text-lg">{venda.numero_venda}</p>
            </div>

            <div>
              <p className="text-sm text-slate-600">Status</p>
              <Badge variant={venda.status === 'pago' ? 'success' : 'secondary'}>
                {venda.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Cliente</p>
                <p className="font-semibold">{venda.cliente_nome}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Data da Venda</p>
                <p className="font-semibold">
                  {format(new Date(venda.data_venda || venda.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Forma de Pagamento</p>
                <p className="font-semibold">
                  {venda.forma_pagamento === 'crediario' ? `Crediário (${venda.quantidade_parcelas}x)` :
                   venda.forma_pagamento === 'a_vista' ? 'À Vista' :
                   venda.forma_pagamento === 'pix' ? 'PIX' :
                   venda.forma_pagamento === 'cartao_credito' ? 'Cartão de Crédito' :
                   venda.forma_pagamento === 'cartao_debito' ? 'Cartão de Débito' :
                   venda.forma_pagamento}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-600">Valor Total</p>
              <p className="text-2xl font-bold text-emerald-600">
                R$ {venda.valor_total?.toFixed(2)}
              </p>
            </div>
          </div>

          {venda.observacoes && (
            <div className="pt-3 border-t">
              <p className="text-sm text-slate-600">Observações</p>
              <p className="text-sm">{venda.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {venda.itens && venda.itens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Itens da Venda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {venda.itens.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.produto_nome}</p>
                    <p className="text-sm text-slate-600">
                      {item.quantidade} x R$ {item.preco_unitario?.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-emerald-600">
                    R$ {item.subtotal?.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {parcelas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parcelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parcelas.map((parcela) => (
                <div key={parcela.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Parcela {parcela.numero_parcela}</p>
                    <p className="text-sm text-slate-600">
                      Vencimento: {format(new Date(parcela.data_vencimento), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">R$ {parcela.valor?.toFixed(2)}</p>
                    <Badge variant={parcela.status === 'pago' ? 'success' : parcela.status === 'atrasado' ? 'destructive' : 'secondary'}>
                      {parcela.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}