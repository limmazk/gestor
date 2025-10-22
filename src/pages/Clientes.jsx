
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Edit, Save, Loader, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import ImportarDadosDialog from '../components/shared/ImportarDadosDialog';

const PAGE_SIZE = 10;

const clienteSchema = {
    type: "object",
    properties: {
        clientes: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                    cpf_cnpj: { type: "string" },
                    endereco: { type: "string" },
                    limite_crediario: { type: "number" },
                    data_nascimento: { type: "string", format: "date" }
                },
                required: ["name"]
            }
        }
    }
};

const clienteInstructions = {
    description: "Crie um arquivo CSV com os dados dos seus clientes. A primeira linha deve ser o cabeçalho. As colunas podem estar em qualquer ordem, desde que os nomes correspondam.",
    csvHeaders: "name,email,phone,cpf_cnpj,endereco,limite_crediario,data_nascimento"
};


export default function Clientes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', phone: '', cpf_cnpj: '', endereco: '', limite_crediario: '', data_nascimento: '' });
  const [query, setQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Busca de dados usando React Query
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clientes', query],
    queryFn: () => {
        const q = query.toLowerCase();
        if (!q) return base44.entities.Cliente.list('-created_date');
        
        // Simula uma busca simples no lado do cliente por simplicidade. 
        // Idealmente, seria um filtro no backend.
        return base44.entities.Cliente.list().then(allClients => 
            allClients.filter(c => 
                (c.name && c.name.toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.phone && c.phone.toLowerCase().includes(q)) ||
                (c.cpf_cnpj && c.cpf_cnpj.toLowerCase().includes(q))
            )
        );
    },
    initialData: []
  });

  // Mutação para criar cliente
  const createClientMutation = useMutation({
    mutationFn: (newClient) => base44.entities.Cliente.create(newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['allClientes'] }); // Invalida a query do Dashboard
      toast({
        title: "Sucesso!",
        description: `Cliente "${form.name}" adicionado.`,
        variant: "success",
      });
      setForm({ name: '', email: '', phone: '', cpf_cnpj: '', endereco: '', limite_crediario: '', data_nascimento: '' });
    },
    onError: (error) => toast({ title: "Erro", description: error.message, variant: "destructive" })
  });

  // Mutação para atualizar cliente
  const updateClientMutation = useMutation({
    mutationFn: (updatedClient) => base44.entities.Cliente.update(updatedClient.id, updatedClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['allClientes'] }); // Invalida a query do Dashboard
      toast({ title: "Sucesso!", description: "Cliente atualizado com sucesso.", variant: "success" });
      setIsEditModalOpen(false);
      setEditingClient(null);
    },
    onError: (error) => toast({ title: "Erro", description: error.message, variant: "destructive" })
  });


  function handleAdd(e) {
    e.preventDefault();
    if (!form.name || form.name.trim() === '') {
      toast({
        title: "Erro",
        description: "O nome do cliente é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    const clientData = { 
        ...form, 
        limite_crediario: form.limite_crediario ? Number(form.limite_crediario) : null 
    };
    createClientMutation.mutate(clientData);
  }

  const handleOpenEditModal = (client) => {
    const formattedClient = {
        ...client,
        data_nascimento: client.data_nascimento ? new Date(client.data_nascimento).toISOString().split('T')[0] : ''
    };
    setEditingClient({ ...formattedClient });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = (e) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name || editingClient.name.trim() === '') {
        toast({ title: "Erro", description: "O nome do cliente não pode ficar em branco.", variant: "destructive" });
        return;
    }
    const clientData = { 
        ...editingClient, 
        limite_crediario: editingClient.limite_crediario ? Number(editingClient.limite_crediario) : null 
    };
    updateClientMutation.mutate(clientData);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Clientes ({clients.length})
          </h1>
          <Button onClick={() => setIsImportOpen(true)} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Importar Clientes
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader><CardTitle>Adicionar Novo Cliente</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
              <div className="space-y-1">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" placeholder="Nome do cliente" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
                <Input id="cpf_cnpj" placeholder="000.000.000-00 ou 00.000.000/0000-00" value={form.cpf_cnpj} onChange={e => setForm({ ...form, cpf_cnpj: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input id="data_nascimento" type="date" value={form.data_nascimento} onChange={e => setForm({ ...form, data_nascimento: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@cliente.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(00) 00000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
               <div className="space-y-1">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" placeholder="Rua, Número, Bairro, Cidade" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="limite_crediario">Limite de Crediário (R$)</Label>
                <Input id="limite_crediario" type="number" placeholder="0.00" value={form.limite_crediario} onChange={e => setForm({ ...form, limite_crediario: e.target.value })} />
              </div>
              <div className="lg:col-span-3 flex justify-end">
                 <Button type="submit" className="w-full md:w-auto" disabled={createClientMutation.isPending}>
                    {createClientMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Adicionar Cliente
                 </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
             <Input placeholder="Buscar por nome, email, telefone ou CPF/CNPJ..." value={query} onChange={e => setQuery(e.target.value)} className="mt-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-center p-4"><Loader className="w-6 h-6 animate-spin mx-auto"/></div> : (
              <ul className="space-y-3">
                {clients.map(c => (
                  <li key={c.id} className="p-4 bg-slate-50 rounded-lg flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-lg">{c.name}</p>
                      <div className="text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          {c.cpf_cnpj && <span>CPF/CNPJ: {c.cpf_cnpj}</span>}
                          {c.data_nascimento && <span>Nasc.: {new Date(c.data_nascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>}
                          {c.email && <span>Email: {c.email}</span>}
                          {c.phone && <span>Telefone: {c.phone}</span>}
                          {c.endereco && <span>Endereço: {c.endereco}</span>}
                          {c.limite_crediario !== null && c.limite_crediario !== undefined && <span>Limite: R$ {Number(c.limite_crediario).toFixed(2).replace('.', ',')}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(c)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Faça as alterações nas informações do cliente aqui. Clique em salvar para aplicar.
            </DialogDescription>
          </DialogHeader>
          {editingClient && (
            <form onSubmit={handleUpdateClient} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nome *
                </Label>
                <Input
                  id="edit-name"
                  value={editingClient.name || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cpf_cnpj" className="text-right">
                  CPF/CNPJ
                </Label>
                <Input
                  id="edit-cpf_cnpj"
                  value={editingClient.cpf_cnpj || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, cpf_cnpj: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-data_nascimento" className="text-right">
                  Nascimento
                </Label>
                <Input
                  id="edit-data_nascimento"
                  type="date"
                  value={editingClient.data_nascimento || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, data_nascimento: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingClient.email || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Telefone
                </Label>
                <Input
                  id="edit-phone"
                  value={editingClient.phone || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-endereco" className="text-right">
                  Endereço
                </Label>
                <Input
                  id="edit-endereco"
                  value={editingClient.endereco || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, endereco: e.target.value })}
                  className="col-span-3"
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-limite_crediario" className="text-right">
                  Limite (R$)
                </Label>
                <Input
                  id="edit-limite_crediario"
                  type="number"
                  value={editingClient.limite_crediario || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, limite_crediario: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateClientMutation.isPending}>
                    {updateClientMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ImportarDadosDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        entityName="Cliente"
        jsonSchema={clienteSchema}
        instructions={clienteInstructions}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['clientes'] });
          queryClient.invalidateQueries({ queryKey: ['allClientes'] });
          toast({
            title: "Sucesso!",
            description: "Clientes importados com sucesso.",
            variant: "success",
          });
        }}
        onError={(error) => {
            toast({
                title: "Erro na Importação",
                description: error.message,
                variant: "destructive",
            });
        }}
      />
    </div>
  );
}
