import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { FileUp, Loader, AlertCircle } from 'lucide-react';

export default function ImportarDadosDialog({ open, onOpenChange, entityName, jsonSchema, instructions, onSuccess }) {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleImport = () => {
        if (file) {
            setIsLoading(true);
            setTimeout(() => {
                setError("Funcionalidade de importação temporariamente desabilitada.");
                setIsLoading(false);
            }, 1000);
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
                        disabled={isLoading}
                    />

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md flex items-center gap-2">
                           <AlertCircle className="w-5 h-5"/>
                           <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleImport} disabled={!file || isLoading}>
                        {isLoading ? (
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