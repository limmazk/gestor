
import React from 'react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, CreditCard, MessageSquare, LogOut } from 'lucide-react';

export default function BloqueioMensalidade() {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full text-center p-8 md:p-12 transform transition-all">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Acesso Bloqueado</h1>
        <p className="text-slate-600 text-lg mb-8">
          Sua mensalidade está pendente. Para continuar utilizando o GestãoPro, por favor, regularize o pagamento.
        </p>
        <div className="space-y-4">
          <Link to={createPageUrl("Mensalidade")}>
            <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-lg py-7">
              <CreditCard className="w-5 h-5 mr-2" />
              Regularizar Pagamento
            </Button>
          </Link>
          <Link to={createPageUrl("ChatSuporte")}>
            <Button size="lg" variant="outline" className="w-full text-lg py-7">
              <MessageSquare className="w-5 h-5 mr-2" />
              Falar com Suporte
            </Button>
          </Link>
          <Button
            size="lg"
            variant="ghost"
            className="w-full text-slate-600"
            onClick={() => window.location.reload()}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair e tentar novamente
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-6">
          Após o pagamento, seu acesso será liberado. Se houver algum problema, fale com o suporte ou tente entrar novamente.
        </p>
      </div>
    </div>
  );
}
