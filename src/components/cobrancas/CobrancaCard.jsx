import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, DollarSign, MessageSquare, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CobrancaCard({ parcela, onPagar }) {
  const handleWhatsApp = () => {
    const telefone = parcela.cliente_telefone?.replace(/\D/g, '');
    if (!telefone) {
      alert("Este cliente não possui um número de telefone cadastrado para o WhatsApp.");
      return;
    }
    const mensagem = `Olá ${parcela.cliente_nome}! 

Lembramos que você tem uma parcela no valor de *R$ ${parcela.valor?.toFixed(2)}* da venda #${parcela.numero_venda} que vence em ${format(parseISO(parcela.data_vencimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.

${parcela.statusDerived === 'atrasado' ? `⚠️ Esta parcela está *${parcela.dias_atraso} dias atrasada*.` : ''}

Por favor, entre em contato para regularizar o pagamento.

Obrigado!`;

    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const statusColors = {
    'atrasado': 'border-l-red-500 bg-red-50',
    'pendente': 'border-l-blue-500 bg-blue-50',
    'pago': 'border-l-green-500 bg-green-50',
  };

  const statusBadges = {
    'atrasado': <Badge variant="destructive">Atrasado</Badge>,
    'pendente': <Badge variant="secondary">Pendente</Badge>,
    'pago': <Badge variant="success">Pago</Badge>,
  };

  const currentStatus = parcela.statusDerived || parcela.status;

  return (
    <Card className={`border-l-4 ${statusColors[currentStatus]} shadow-md hover:shadow-lg transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {parcela.cliente_nome}
                </h3>
                <p className="text-sm text-slate-600">
                  Venda #{parcela.numero_venda} - Parcela {parcela.numero_parcela}/{parcela.total_parcelas}
                </p>
              </div>
              {statusBadges[currentStatus]}
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-600" />
                <div>
                  <span className="text-slate-600">Valor:</span>{' '}
                  <span className="font-bold text-emerald-600">
                    R$ {parcela.valor?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <div>
                  <span className="text-slate-600">Vencimento:</span>{' '}
                  <span className="font-medium">
                    {format(parseISO(parcela.data_vencimento), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>

              {parcela.cliente_telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span className="font-medium">{parcela.cliente_telefone}</span>
                </div>
              )}

              {currentStatus === 'atrasado' && (
                <div className="text-red-600 font-semibold">
                  {parcela.dias_atraso} {parcela.dias_atraso === 1 ? 'dia de atraso' : 'dias de atraso'}
                </div>
              )}
            </div>
          </div>

          <div className="flex md:flex-col gap-2 pt-2 md:pt-0 md:border-l md:pl-4 justify-center items-center self-center md:self-auto">
            {parcela.status !== 'pago' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsApp}
                  className="flex-1 w-full md:w-auto text-green-600 border-green-600 hover:bg-green-50"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  onClick={() => onPagar(parcela)}
                  className="flex-1 w-full md:w-auto"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Pagar
                </Button>
              </>
            )}
            {parcela.status === 'pago' && parcela.data_pagamento && (
              <div className="text-sm text-green-700 bg-green-100 p-2 rounded-md text-center">
                Pago em: <br/> {format(parseISO(parcela.data_pagamento), 'dd/MM/yyyy')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}