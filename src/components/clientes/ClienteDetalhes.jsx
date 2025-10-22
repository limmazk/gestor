import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, Mail, MapPin, Calendar, CreditCard, ShoppingCart, DollarSign 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ClienteDetalhes({ cliente }) {
  const { data: vendas = [] } = useQuery({
    queryKey: ['vendas-cliente', cliente.id],
    queryFn: () => base44.entities.Venda.filter({ cliente_id: cliente.id }, '-created_date'),
    initialData: [],
  });

  const { data: parcelas = [] } = useQuery({
    queryKey: ['parcelas-cliente', cliente.id],
    queryFn: () => base44.entities.Parcela.filter({ cliente_id: cliente.id }),
    initialData: [],
  });

  const totalCompras = vendas.reduce((sum, v) => sum + (v.valor_total || 0), 0);
  const parcelasPendentes = parcelas.filter(p => p.status === 'pendente');
  const totalDevendo = parcelasPendentes.reduce((sum, p) => sum + (p.valor || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Nome Completo</p>
              <p className="font-semibold">{cliente.nome_completo}</p>
            </div>
            {cliente.cpf_cnpj && (
              <div>
                <p className="text-sm text-slate-600">CPF/CNPJ</p>
                <p className="font-semibold">{cliente.cpf_cnpj}</p>
              </div>
            )}
            {cliente.telefone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-600">Telefone</p>
                  <p className="font-semibold">{cliente.telefone}</p>
                </div>
              </div>
            )}
            {cliente.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold">{cliente.email}</p>
                </div>
              </div>
            )}
            {cliente.data_nascimento && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-600">Data de Nascimento</p>
                  <p className="font-semibold">
                    {format(new Date(cliente.data_nascimento), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <Badge variant={cliente.status === 'ativo' ? 'success' : 'secondary'}>
                {cliente.status}
              </Badge>
            </div>
          </div>

          {cliente.endereco && (
            <div className="pt-3 border-t">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-600 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Endereço</p>
                  <p className="font-semibold">{cliente.endereco}</p>
                  {cliente.cidade && (
                    <p className="text-sm text-slate-600">
                      {cliente.cidade}, {cliente.estado} - {cliente.cep}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {cliente.limite_credito > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-sm text-slate-600">Limite de Crédito</p>
                  <p className="font-semibold text-emerald-600">
                    R$ {cliente.limite_credito.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {cliente.observacoes && (
            <div className="pt-3 border-t">
              <p className="text-sm text-slate-600">Observações</p>
              <p className="text-sm">{cliente.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total de Compras</p>
                <p className="text-xl font-bold text-blue-600">
                  R$ {totalCompras.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Em Aberto</p>
                <p className="text-xl font-bold text-orange-600">
                  R$ {totalDevendo.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Parcelas Pendentes</p>
                <p className="text-xl font-bold text-purple-600">
                  {parcelasPendentes.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {vendas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendas.slice(0, 10).map((venda) => (
                <div key={venda.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Venda #{venda.numero_venda}</p>
                    <p className="text-sm text-slate-600">
                      {format(new Date(venda.data_venda || venda.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">R$ {venda.valor_total.toFixed(2)}</p>
                    <Badge variant={venda.status === 'pago' ? 'success' : 'secondary'}>
                      {venda.status}
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