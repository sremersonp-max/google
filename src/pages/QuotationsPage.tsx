import { useState, useEffect } from "react";
import { FileText, Plus, Search, Trash2, Edit, Save, Calculator, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dbService, Quotation, CompoundProduct, Product } from "../lib/db";
import { calculateProject } from "../lib/calculator";
import { toast } from "sonner";

export const QuotationsPage = () => {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [projectsBuffer, setProjectsBuffer] = useState<CompoundProduct[]>([]);
    const [stockBuffer, setStockBuffer] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState<Partial<Quotation>>({
        cliente: "",
        telefone: "",
        endereco: "",
        margem: 50,
        status: "Pendente",
        produtos: []
    });

    // Item to Add State
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [L, setL] = useState(1200);
    const [A, setA] = useState(1000);
    const [Q, setQ] = useState(1);

    const loadData = async () => {
        setLoading(true);
        const [qData, pData, sData] = await Promise.all([
            dbService.getAll<Quotation>('orcamentos'),
            dbService.getAll<CompoundProduct>('produtos_compostos'),
            dbService.getAll<Product>('produtos')
        ]);
        setQuotations(qData);
        setProjectsBuffer(pData);
        setStockBuffer(sData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const addProductToQuotation = () => {
        if (!selectedProjectId) return toast.error("Selecione um projeto.");
        const proj = projectsBuffer.find(p => p.id === parseInt(selectedProjectId));
        if (!proj) return;

        const result = calculateProject(proj, L, A, Q, stockBuffer, formData.margem || 50);
        
        const newItem = {
            id: Date.now(),
            produtoNome: proj.nome,
            L, A, Q,
            custoTotal: result.cost,
            valorUnitario: result.price / Q,
            totalItem: result.price
        };

        setFormData({
            ...formData,
            produtos: [...(formData.produtos || []), newItem]
        });
        
        toast.success("Produto adicionado ao orçamento.");
    };

    const handleSaveQuotation = async () => {
        if (!formData.cliente) return toast.error("Nome do cliente é obrigatório.");
        
        const subtotal = (formData.produtos || []).reduce((acc, p) => acc + p.totalItem, 0);
        const total = subtotal; // Simulating no manual discounts for now

        const dataToSave = {
            ...formData,
            data: new Date().toISOString(),
            subtotal: subtotal.toFixed(2),
            total: total.toFixed(2),
            totalNumero: total
        };

        try {
            if (formData.id) {
                await dbService.put('orcamentos', dataToSave);
                toast.success("Orçamento atualizado.");
            } else {
                await dbService.add('orcamentos', dataToSave);
                toast.success("Orçamento gerado.");
            }
            setIsOpen(false);
            loadData();
        } catch (e) {
            toast.error("Erro ao salvar orçamento.");
        }
    };

    const deleteQuotation = async (id: number) => {
        if (confirm("Excluir orçamento?")) {
            await dbService.delete('orcamentos', id);
            loadData();
        }
    };

    return (
        <div className="p-8 space-y-8">
            {/* Identity Header */}
            <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-6">
                <div className="flex flex-col">
                    <span className="bento-label mb-1">Commercial Quotes & Proposals</span>
                    <h1 className="text-3xl font-light tracking-tight">SALES <span className="font-bold">ORDNANCE</span></h1>
                </div>
                <div className="text-right">
                    <span className="bento-label block">Channel Pipeline</span>
                    <span className="font-mono text-sm opacity-60">ACTIVE-COMMERCE</span>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-30">Account Operations</span>
                    <Button onClick={() => { setFormData({ cliente: "", telefone: "", endereco: "", margem: 50, status: "Pendente", produtos: [] }); setIsOpen(true); }} className="rounded-sm text-[10px] uppercase tracking-widest font-bold h-9">
                        <Plus className="mr-2 h-3.5 w-3.5" /> Initialize Quote
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="space-y-2">
                        <Card className="h-16 animate-pulse" />
                        <Card className="h-16 animate-pulse" />
                    </div>
                ) : quotations.length === 0 ? (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <ReceiptText className="h-12 w-12 opacity-20 mb-4" />
                            <p>Nenhum orçamento cadastrado ainda.</p>
                        </CardContent>
                    </Card>
                ) : quotations.map(q => (
                    <Card key={q.id} className="hover:border-white/30 transition-all duration-300 border-white/10 group overflow-hidden">
                        <CardContent className="p-0 flex flex-col md:flex-row justify-between items-stretch">
                            <div className="flex items-center gap-6 p-6 flex-grow">
                                <div className="w-12 h-12 border border-white/10 flex items-center justify-center font-serif text-xl font-light bg-white/5">
                                    {q.cliente.substring(0,1).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <div className="font-serif text-lg font-bold tracking-tight flex items-center gap-3">
                                        {q.cliente}
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] h-4 uppercase tracking-[0.2em] font-black rounded-none border-none",
                                            q.status === 'Fechado' ? "bento-accent-emerald" : "bento-accent-slate"
                                        )}>
                                            {q.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 font-mono text-[10px] opacity-40 uppercase tracking-widest">
                                        <span>ID: {q.id}</span>
                                        <span>•</span>
                                        <span>{new Date(q.data).toLocaleDateString('pt-BR')}</span>
                                        <span>•</span>
                                        <span>{q.produtos?.length || 0} ITEMS</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 p-6 bg-white/5 md:border-l border-white/10 min-w-[280px] justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Evaluation</span>
                                    <div className="text-xl font-serif font-black tracking-tighter">
                                        <span className="text-[10px] font-sans opacity-40 mr-1 font-normal">R$</span>
                                        {parseFloat(q.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none hover:bg-white hover:text-black border border-white/5" onClick={() => { setFormData(q); setIsOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive rounded-none hover:bg-destructive hover:text-white border border-white/5" onClick={() => q.id && deleteQuotation(q.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{formData.id ? "Editar Orçamento" : "Gerar Orçamento"}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
                        {/* Info Section */}
                        <Card className="lg:col-span-1 shadow-none bg-muted/20">
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm">Dados do Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome do Cliente</Label>
                                    <Input value={formData.cliente} onChange={e => setFormData({...formData, cliente: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefone</Label>
                                    <Input value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Margem Lucro (%)</Label>
                                    <Input type="number" value={formData.margem} onChange={e => setFormData({...formData, margem: parseFloat(e.target.value) || 0})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={formData.status} onValueChange={(val: any) => setFormData({...formData, status: val})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pendente">Pendente</SelectItem>
                                            <SelectItem value="Fechado">Fechado</SelectItem>
                                            <SelectItem value="Finalizado">Finalizado</SelectItem>
                                            <SelectItem value="Cancelado">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Composition Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-none border-primary/20 bg-primary/5">
                                <CardHeader className="p-4 font-bold flex flex-row items-center gap-2">
                                    <Calculator className="h-4 w-4" /> Calcule e Adicione
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                        <div className="col-span-2 space-y-2">
                                            <Label>Projeto</Label>
                                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Escolha um projeto..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {projectsBuffer.map(p => (
                                                        <SelectItem key={p.id} value={p.id?.toString() || ""}>{p.nome}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Larg. (mm)</Label>
                                            <Input type="number" value={L} onChange={e => setL(parseInt(e.target.value) || 0)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Alt. (mm)</Label>
                                            <Input type="number" value={A} onChange={e => setA(parseInt(e.target.value) || 0)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Qtd</Label>
                                            <Input type="number" value={Q} onChange={e => setQ(parseInt(e.target.value) || 1)} />
                                        </div>
                                        <div className="col-span-1 md:col-start-4">
                                            <Button className="w-full" onClick={addProductToQuotation}>Add Item</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="text-[11px]">Produto</TableHead>
                                            <TableHead className="text-[11px] text-center">Medida</TableHead>
                                            <TableHead className="text-[11px] text-center">Qtd</TableHead>
                                            <TableHead className="text-[11px] text-right">Preço Total</TableHead>
                                            <TableHead className="text-[11px] text-center">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(formData.produtos || []).length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">Nenhum item no orçamento.</TableCell>
                                            </TableRow>
                                        ) : (formData.produtos || []).map((p, idx) => (
                                            <TableRow key={idx} className="text-xs">
                                                <TableCell className="font-bold">{p.produtoNome}</TableCell>
                                                <TableCell className="text-center">{p.L}x{p.A}mm</TableCell>
                                                <TableCell className="text-center">{p.Q}</TableCell>
                                                <TableCell className="text-right font-black text-primary">R$ {p.totalItem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                                                        const items = [...(formData.produtos || [])];
                                                        items.splice(idx, 1);
                                                        setFormData({...formData, produtos: items});
                                                    }}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end pr-4 text-sm font-bold gap-2">
                                <span className="text-muted-foreground uppercase tracking-wider">Subtotal:</span>
                                <span className="text-xl">R$ {(formData.produtos || []).reduce((acc, p) => acc + p.totalItem, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveQuotation} className="bg-primary hover:bg-primary/90">
                           <Save className="mr-2 h-4 w-4" /> Salvar Orçamento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
