import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader, Upload, Settings, Building } from 'lucide-react';

export default function ConfiguracoesEmpresa() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    // const { data: user, isLoading: isLoadingUser } = useQuery({
    //     queryKey: ['user'],
    //     queryFn: () => base44.auth.me(),
    // });
    const user = null;
    const isLoadingUser = false;

    // const uploadMutation = useMutation({
    //     mutationFn: async (file) => {
    //         if (!file) throw new Error("Nenhum arquivo selecionado.");
            
    //         const { file_url } = await base44.integrations.Core.UploadFile({ file });
    //         if (!file_url) throw new Error("Falha no upload do arquivo.");

    //         await base44.auth.updateMe({ logo_url: file_url });

    //         return file_url;
    //     },
    //     onSuccess: () => {
    //         toast({
    //             title: "Sucesso!",
    //             description: "Sua logo foi atualizada.",
    //             variant: "success",
    //         });
    //         queryClient.invalidateQueries({ queryKey: ['user'] });
    //     },
    //     onError: (error) => {
    //         toast({
    //             title: "Erro ao atualizar logo",
    //             description: error.message,
    //             variant: "destructive",
    //         });
    //     }
    // });
    const uploadMutation = { mutate: () => {}, isPending: false };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadMutation.mutate(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-600" />
                        Configurações da Empresa
                    </h1>
                    <p className="text-slate-600 mt-1">Personalize a aparência e as informações da sua empresa.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5"/> Logomarca</CardTitle>
                        <CardDescription>Faça o upload da logo da sua empresa. Ela aparecerá em telas como o PDV.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        <div className="w-48 h-48 bg-slate-100 rounded-lg border-2 border-dashed flex items-center justify-center">
                            {isLoadingUser || uploadMutation.isPending ? (
                                <Loader className="w-8 h-8 animate-spin text-slate-400" />
                            ) : user?.logo_url ? (
                                <img src={user.logo_url} alt="Logo da Empresa" className="object-contain w-full h-full p-2" />
                            ) : (
                                <p className="text-sm text-slate-500 text-center">Nenhuma logo</p>
                            )}
                        </div>

                        <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif, image/webp"
                        />
                        
                        <Button onClick={handleButtonClick} disabled={uploadMutation.isPending}>
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadMutation.isPending ? 'Enviando...' : 'Trocar Logo'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}