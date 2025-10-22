import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Lightbulb, Loader, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function AnaliseCompleta({ vendas, produtos }) {
    const [loading, setLoading] = useState(false);
    const [analise, setAnalise] = useState(null);
    const [error, setError] = useState(null);

    const gerarAnalise = async () => {
        setLoading(true);
        setError(null);
        setAnalise(null);

        const salesData = vendas.slice(0, 50).map(v => ({
            data: v.created_date,
            total: v.valor_total,
            itens: v.itens.map(i => ({
                produto: produtos.find(p => p.id === i.produto_id)?.nome_produto || 'N/A',
                qtd: i.quantidade,
                preco: i.valor_unitario
            }))
        }));

        const prompt = `
            Com base nos seguintes dados de vendas (em JSON), atue como um consultor de negócios e gere uma análise concisa e acionável em markdown.
            
            Dados: ${JSON.stringify(salesData)}

            Sua análise deve conter:
            1.  **Visão Geral:** Um resumo de 1-2 frases sobre o desempenho geral.
            2.  **Tendências Principais:** 2-3 pontos (bullet points) destacando tendências de vendas, produtos populares ou sazonalidade.
            3.  **Sugestão Acionável:** Uma recomendação clara e direta que o dono do negócio pode implementar para aumentar as vendas ou melhorar a gestão.
        `;

        try {
            const resultado = await base44.integrations.Core.InvokeLLM({ prompt });
            setAnalise(resultado);
        } catch (err) {
            setError("Ocorreu um erro ao gerar a análise. Tente novamente mais tarde.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="col-span-1 lg:col-span-3 bg-gradient-to-br from-slate-50 to-indigo-100 border-2 border-indigo-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <Bot className="w-6 h-6" />
                    Análise Inteligente
                </CardTitle>
                <Button onClick={gerarAnalise} disabled={loading}>
                    {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                    Gerar Análise com IA
                </Button>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="flex justify-center items-center p-8">
                        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                        <p className="ml-4 text-indigo-800 font-semibold">Analisando seus dados...</p>
                    </div>
                )}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {analise && (
                    <div className="prose prose-sm max-w-none text-slate-800">
                        <ReactMarkdown>{analise}</ReactMarkdown>
                    </div>
                )}
                {!loading && !analise && !error && (
                    <p className="text-center text-slate-600 py-8">Clique no botão acima para receber insights sobre seu negócio.</p>
                )}
            </CardContent>
        </Card>
    );
}