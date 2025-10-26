import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserX, Mail, Phone, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function InadimplentesTab() {
  const allUsers = [];
  const allPayments = [];

  const inadimplentes = useMemo(() => {
    const hoje = new Date();
    const mesAtualRef = format(hoje, 'MM/yyyy');
    
    const clientes = allUsers.filter(u => u.role !== 'admin');
    
    const idsPagantesMesAtual = new Set(
      allPayments
        .filter(p => p.mes_referencia === mesAtualRef && (p.status === 'aprovado' || p.status === 'aguardando_verificacao'))
        .map(p => p.empresa_id)
    );

    return clientes.filter(cliente => !idsPagantesMesAtual.has(cliente.id));
  }, [allUsers, allPayments]);

  if (inadimplentes.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="pt-6 text-center">
            <UserX className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Tudo em Dia!</h3>
            <p className="text-slate-500 mt-2">Nenhum cliente está com a mensalidade deste mês pendente.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600"/>
            <div>
                <CardTitle>Clientes com Pagamento Pendente ({inadimplentes.length})</CardTitle>
                <CardDescription>Lista de clientes que ainda não pagaram a mensalidade do mês atual.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inadimplentes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.full_name}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell>{format(new Date(cliente.created_date), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="text-red-600 font-bold">Pendente</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}