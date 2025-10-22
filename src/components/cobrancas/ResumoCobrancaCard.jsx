import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ResumoCobrancaCard({ parcela }) {

  const isAtrasado = parcela.status === 'atrasado';

  return (
    <Card className={`transition-all hover:bg-slate-100 ${isAtrasado ? 'border-red-200' : 'border-blue-200'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-slate-600" />
              <p className="font-semibold text-slate-800">{parcela.cliente_nome}</p>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-600" />
              <p className="font-bold text-emerald-600">R$ {parcela.valor?.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant={isAtrasado ? 'destructive' : 'secondary'}>
                {isAtrasado ? `${parcela.dias_atraso} dias de atraso` : 'Vence Hoje'}
             </Badge>
             <Link to={createPageUrl('Clientes')}>
                <ArrowRight className="w-5 h-5 text-slate-400 hover:text-blue-600"/>
             </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}