import { useState, useEffect } from "react";
import { Scissors, FileText, CheckCircle2, ChevronRight, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dbService, Quotation, CompoundProduct } from "../lib/db";
import { evaluateFormula } from "../lib/calculator";
import { toast } from "sonner";

interface CutPiece {
    length: number;
    source: string;
}

interface Bar {
    pieces: CutPiece[];
    used: number;
    remaining: number;
}

interface MaterialGroup {
    code: string;
    description: string;
    color: string;
    barLength: number;
    pieces: CutPiece[];
    bars: Bar[];
}

export const CutSheetPage = () => {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [selectedQuots, setSelectedQuots] = useState<number[]>([]);
    const [cutSheet, setCutSheet] = useState<MaterialGroup[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const data = await dbService.getAll<Quotation>('orcamentos');
        // Only Closed / Finalized
        setQuotations(data.filter(q => q.status === 'Fechado' || q.status === 'Finalized'));
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleQuotation = (id: number) => {
        setSelectedQuots(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const generateOptimization = async () => {
        if (!selectedQuots.length) return toast.error("Selecione ao menos um orçamento.");
        
        toast.info("Otimizando cortes...");
        
        const stock = await dbService.getAll<any>('produtos');
        const projBuffer = await dbService.getAll<CompoundProduct>('produtos_compostos');
        
        const materialMap: Record<string, { desc: string, color: string, pieces: CutPiece[] }> = {};

        for (const quotId of selectedQuots) {
            const quot = quotations.find(q => q.id === quotId);
            if (!quot) continue;

            for (const item of quot.produtos) {
                if (item.tipo !== 'composto') continue;
                const proj = projBuffer.find(p => p.id === item.produtoId);
                if (!proj) continue;

                const ctx = { L: item.L, A: item.A, TP: proj.transpasse || 20, folhas: proj.folhas || 4, Q: 1 };
                
                for (const comp of proj.componentes) {
                    const stockItem = stock.find((s: any) => s.codigo_fabricante === comp.codigo);
                    if (stockItem?.unidade_venda !== 'MT') continue;

                    const mm = evaluateFormula(comp.formula, ctx);
                    const piecesCount = (comp.qtd_pecas || 1) * item.Q;
                    
                    const key = `${comp.codigo}_${item.cor || 'BRANCO'}`;
                    if (!materialMap[key]) {
                        materialMap[key] = { desc: comp.descricao, color: item.cor || 'BRANCO', pieces: [] };
                    }

                    for (let i = 0; i < piecesCount; i++) {
                        materialMap[key].pieces.push({ length: mm, source: `${quot.cliente} (#${quot.id})` });
                    }
                }
            }
        }

        // Apply Bin Packing (First Fit Decreasing)
        const BAR_LENGTH_MM = 6100;
        const result: MaterialGroup[] = [];

        Object.entries(materialMap).forEach(([code, data]) => {
            // Sort pieces descending
            const sortedPieces = [...data.pieces].sort((a, b) => b.length - a.length);
            const bars: Bar[] = [];

            sortedPieces.forEach(piece => {
                let fitted = false;
                for (const bar of bars) {
                    if (bar.remaining >= piece.length) {
                        bar.pieces.push(piece);
                        bar.used += piece.length;
                        bar.remaining -= piece.length;
                        fitted = true;
                        break;
                    }
                }

                if (!fitted) {
                    bars.push({
                        pieces: [piece],
                        used: piece.length,
                        remaining: BAR_LENGTH_MM - piece.length
                    });
                }
            });

            result.push({
                code,
                description: data.desc,
                color: data.color,
                barLength: BAR_LENGTH_MM,
                pieces: data.pieces,
                bars
            });
        });

        setCutSheet(result);
        toast.success("Otimização concluída!");
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Scissors className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Planilha de Corte</h1>
                </div>
                <Button onClick={generateOptimization} disabled={!selectedQuots.length}>
                    📏 Gerar Otimização
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="md:col-span-1">
                    <CardHeader className="p-4">
                        <CardTitle className="text-sm">Orçamentos Fechados</CardTitle>
                        <CardDescription className="text-[10px]">Selecione quais obras incluir no corte.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 space-y-1">
                        {loading ? (
                            <p className="text-xs p-4 animate-pulse">Carregando...</p>
                        ) : quotations.length === 0 ? (
                            <p className="text-xs p-4 text-muted-foreground italic">Nenhum orçamento fechado.</p>
                        ) : quotations.map(q => (
                            <div 
                                key={q.id} 
                                className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors ${selectedQuots.includes(q.id!) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'}`}
                                onClick={() => q.id && toggleQuotation(q.id)}
                            >
                                <span className="font-medium truncate max-w-[100px]">{q.cliente}</span>
                                {selectedQuots.includes(q.id!) && <CheckCircle2 className="h-3 w-3 text-primary" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="md:col-span-3 space-y-4">
                    {cutSheet.length === 0 ? (
                        <Card className="h-64 flex items-center justify-center border-dashed bg-muted/20">
                            <div className="text-center space-y-2">
                                <Layers className="h-10 w-10 mx-auto opacity-10" />
                                <p className="text-muted-foreground text-sm italic">Selecione as obras ao lado e clique em "Gerar".</p>
                            </div>
                        </Card>
                    ) : cutSheet.map((mat, idx) => (
                        <Card key={idx}>
                            <CardHeader className="p-4 bg-muted/30">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-base">{mat.code} - {mat.description}</CardTitle>
                                        <CardDescription className="text-xs">Cor: {mat.color} | Peças Totais: {mat.pieces.length}</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-background">{mat.bars.length} barras de 6.1m</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {mat.bars.map((bar, bIdx) => (
                                    <div key={bIdx} className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                            <span>Barra #{bIdx + 1}</span>
                                            <span>Sobra: {bar.remaining}mm</span>
                                        </div>
                                        <div className="h-8 w-full bg-slate-100 rounded-md overflow-hidden flex border">
                                            {bar.pieces.map((p, pIdx) => (
                                                <div 
                                                    key={pIdx} 
                                                    className="h-full border-r border-background flex items-center justify-center text-[9px] font-bold text-white overflow-hidden truncate"
                                                    style={{ 
                                                        width: `${(p.length / mat.barLength) * 100}%`,
                                                        backgroundColor: `hsl(${(pIdx * 137) % 360}, 60%, 40%)` 
                                                    }}
                                                    title={`${p.length}mm - ${p.source}`}
                                                >
                                                    {p.length}
                                                </div>
                                            ))}
                                            <div 
                                                className="h-full bg-yellow-200/50 flex items-center justify-center text-[9px] text-yellow-800 font-bold"
                                                style={{ width: `${(bar.remaining / mat.barLength) * 100}%` }}
                                            >
                                                {bar.remaining}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
