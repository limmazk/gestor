import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { FileUp, Loader, AlertCircle } from 'lucide-react';

export default function ImportarDadosDialog({ open, onOpenChange, entityName, jsonSchema, instructions, onSuccess }) {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    const importMutation = useMutation({
        mutationFn: async (fileToUpload) => {
            setError(null);
            // Passo 1: Fazer upload do arquivo
            const uploadResult = await base44.integrations.Core.UploadFile({ file: fileToUpload });
            if (!uploadResult.file_url) {
                throw new Error("Falha no upload do arquivo.");
            }

            // Passo 2: Extrair dados do arquivo
            const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
                file_url: uploadResult.file_url,
                json_schema: jsonSchema,
            });

            if (extractionResult.status !== 'success' || !extractionResult.output) {
                throw new Error(extractionResult.details || `Não foi possível extrair dados do arquivo. Verifique o formato e as colunas.`);
            }
            
            const dataToImport = extractionResult.output[Object.keys(extractionResult.output)[0]];
            
            if(!Array.isArray(dataToImport) || dataToImport.length === 0){
                throw new Error("Nenhum dado válido encontrado no arquivo para importar.");
            }

            // Passo 3: Inserir dados em massa no banco de dados
            await base44.entities[entityName].bulkCreate(dataToImport);
            
            return dataToImport.length;
        },
        onSuccess: (importedCount) => {
            toast({
                title: "Importação Concluída!",
                description: `${importedCount} registros de ${entityName.toLowerCase()} foram importados com sucesso.`,
                variant: "success",
            });
            onSuccess();
            onOpenChange(false);
            setFile(null);
        },
        onError: (err) => {
            setError(err.message);
            toast({
                title: "Erro na Importação",
                description: err.message,
                variant: "destructive",
            });
        }
    });

    const handleImport = () => {
        if (file) {
            importMutation.mutate(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Importar {entityName}s</DialogTitle>
                    <DialogDescription>
                        Faça o upload de um arquivo CSV para adicionar múltiplos registros de uma vez.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="p-4 bg-slate-100 rounded-lg border">
                        <h4 className="font-semibold mb-2">Instruções:</h4>
                        <p className="text-sm text-slate-600 mb-2">{instructions.description}</p>
                        <p className="text-sm text-slate-800 font-medium">O arquivo CSV deve conter as seguintes colunas na primeira linha:</p>
                        <code className="text-sm bg-slate-200 p-2 rounded-md block mt-2 text-slate-900">{instructions.csvHeaders}</code>
                    </div>

                    <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files[0])}
                        disabled={importMutation.isPending}
                    />

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md flex items-center gap-2">
                           <AlertCircle className="w-5 h-5"/>
                           <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleImport} disabled={!file || importMutation.isPending}>
                        {importMutation.isPending ? (
                            <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <FileUp className="w-4 h-4 mr-2" />
                                Processar e Importar
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}