import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  CreditCard,
  MessageSquare,
  ChevronRight,
  FileText
} from 'lucide-react';

const tutorials = [
  {
    icon: Users,
    title: "Como cadastrar um novo cliente?",
    content: (
      <ol className="list-decimal list-inside space-y-2">
        <li>No menu lateral, clique em <strong>Clientes</strong>.</li>
        <li>Clique no botão azul <strong>"Novo Cliente"</strong> no canto superior direito.</li>
        <li>Preencha as informações do cliente no formulário que aparecer. Os campos com * são obrigatórios.</li>
        <li>Dê atenção especial ao <strong>Limite de Crédito</strong> se for vender a prazo para este cliente.</li>
        <li>Clique em <strong>"Salvar Cliente"</strong> para finalizar.</li>
      </ol>
    ),
  },
  {
    icon: ShoppingCart,
    title: "Como registrar uma nova venda (inclusive a prazo)?",
    content: (
      <ol className="list-decimal list-inside space-y-2">
        <li>Acesse a página de <strong>Vendas</strong> no menu lateral.</li>
        <li>Clique em <strong>"Registrar Nova Venda"</strong>.</li>
        <li>Selecione o cliente e adicione os produtos desejados. O sistema buscará os preços automaticamente.</li>
        <li>Na seção "Pagamento", escolha a <strong>Forma de Pagamento</strong>.</li>
        <li>Se escolher <strong>"Crediário"</strong>, informe o <strong>número de parcelas</strong> e a data do primeiro vencimento. O sistema calculará o resto.</li>
        <li>Revise tudo e clique em <strong>"Finalizar Venda"</strong>. As parcelas e a baixa no estoque serão geradas automaticamente.</li>
      </ol>
    ),
  },
  {
    icon: DollarSign,
    title: "Como gerenciar cobranças e registrar pagamentos?",
    content: (
      <ol className="list-decimal list-inside space-y-2">
        <li>Vá para a página <strong>Cobranças</strong>. Você verá um resumo das parcelas atrasadas, as que vencem hoje e o total pendente.</li>
        <li>Cada parcela é um card. As atrasadas ficam destacadas em vermelho.</li>
        <li>Para cobrar um cliente, clique no ícone do <strong>WhatsApp</strong> no card da parcela para enviar uma mensagem pré-pronta.</li>
        <li>Quando o cliente pagar, clique no botão <strong>"Registrar Pagamento"</strong>.</li>
        <li>Confirme a data do pagamento e clique em <strong>"Confirmar Pagamento"</strong>. A parcela mudará seu status para "pago".</li>
      </ol>
    ),
  },
  {
    icon: Package,
    title: "Como controlar meu estoque?",
    content: (
      <ol className="list-decimal list-inside space-y-2">
        <li>Na página <strong>Estoque</strong>, você pode adicionar novos produtos clicando em <strong>"Adicionar Produto"</strong>.</li>
        <li>Ao cadastrar um produto, defina o <strong>"Estoque Mínimo"</strong> para receber alertas.</li>
        <li>O estoque é atualizado automaticamente a cada venda registrada no sistema.</li>
        <li>Produtos com estoque baixo são destacados com uma borda laranja para fácil visualização.</li>
        <li>Use a busca e os filtros para encontrar produtos rapidamente.</li>
      </ol>
    ),
  },
    {
    icon: CreditCard,
    title: "Como pagar a mensalidade de uso do sistema?",
    content: (
      <ol className="list-decimal list-inside space-y-2">
        <li>No menu, clique em <strong>"Mensalidade de Uso"</strong>. Você verá o status do seu pagamento atual.</li>
        <li>Se houver uma fatura pendente, a chave PIX para pagamento será exibida.</li>
        <li>Realize o pagamento usando a chave PIX e salve o comprovante.</li>
        <li>Clique em <strong>"Enviar Comprovante de Pagamento"</strong>, selecione o arquivo do comprovante e a data do pagamento.</li>
        <li>Clique em <strong>"Enviar"</strong>. Seu pagamento ficará com o status "Aguardando Verificação" e logo será aprovado.</li>
      </ol>
    ),
  },
];

const TutorialItem = ({ icon: Icon, title, content }) => (
  <details className="group border-b pb-4">
    <summary className="flex items-center justify-between font-semibold cursor-pointer py-3 hover:bg-slate-50 rounded-lg px-2">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <span>{title}</span>
      </div>
      <ChevronRight className="w-5 h-5 transform transition-transform group-open:rotate-90" />
    </summary>
    <div className="px-4 pt-2 text-slate-700">{content}</div>
  </details>
);

export default function DocumentacaoDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <FileText className="w-7 h-7 text-blue-700"/>
            Documentação e Tutoriais do GestãoPro
          </DialogTitle>
          <DialogDescription>
            Aprenda a usar as principais funcionalidades do sistema com estes guias passo a passo.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4">
            {tutorials.map((tut, index) => (
              <TutorialItem key={index} {...tut} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}