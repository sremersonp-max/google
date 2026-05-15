import { useState, useEffect } from "react";
import { Box, Plus, Search, Trash2, Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { dbService, CompoundProduct, Product } from "../lib/db";
import { toast } from "sonner";

export const ProjectsPage = () => {
    const [projects, setProjects] = useState<CompoundProduct[]>([]);
    const [stockItems, setStockItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsOpen] = useState(false);
    
    // Form State for Compound Product
    const [formData, setFormData] = useState<Partial<CompoundProduct>>({
        nome: "",
        categoria: "Janela",
        subcategoria: "Temperado",
        espessura: "8",
        transpasse: 20,
        folhas: 4,
        componentes: [],
        vidros: [],
        variaveis: []
    });

    const loadData = async () => {
        setLoading(true);
        const [projData, stockData] = await Promise.all([
            dbService.getAll<CompoundProduct>('produtos_compostos'),
            dbService.getAll<Product>('produtos')
        ]);
        setProjects(projData);
        setStockItems(stockData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async () => {
        if (!formData.nome) return toast.error("Nome é obrigatório.");
        try {
            if (formData.id) {
                await dbService.put('produtos_compostos', formData);
                toast.success("Projeto atualizado.");
            } else {
                await dbService.add('produtos_compostos', formData);
                toast.success("Projeto criado.");
            }
            setIsOpen(false);
            loadData();
        } catch (e) {
            toast.error("Erro ao salvar projeto.");
        }
    };

    const addComponent = (item: Product) => {
        const newComp = {
            codigo: item.codigo_fabricante,
            descricao: item.descricao,
            formula: "L", // default
            qtd_pecas: 1
        };
        setFormData({
            ...formData,
            componentes: [...(formData.componentes || []), newComp]
        });
        toast.info(`Item ${item.codigo_fabricante} adicionado.`);
    };

    const removeComponent = (index: number) => {
        const comps = [...(formData.componentes || [])];
        comps.splice(index, 1);
        setFormData({ ...formData, componentes: comps });
    };

    return (
        <div className="p-8 space-y-8">
            {/* Identity Header */}
            <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-6">
                <div className="flex flex-col">
                    <span className="bento-label mb-1">Architecture & Engineering</span>
                    <h1 className="text-3xl font-light tracking-tight">PROJECT <span className="font-bold">SCHEMATICS</span></h1>
                </div>
                <div className="text-right">
                    <span className="bento-label block">Design Repository</span>
                    <span className="font-mono text-sm opacity-60">MASTER-TEMPLATES</span>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-30">Structural Operations</span>
                    <Button onClick={() => { setFormData({ nome: "", categoria: "Janela", subcategoria: "Temperado", espessura: "8", transpasse: 20, folhas: 4, componentes: [], vidros: [], variaveis: [] }); setIsOpen(true); }} className="rounded-sm text-[10px] uppercase tracking-widest font-bold h-9">
                        <Plus className="mr-2 h-3.5 w-3.5" /> Initialize Project
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <Card key={i} className="h-48 animate-pulse bg-white/5 border-white/10" />)
                ) : projects.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground italic font-mono text-[10px] uppercase tracking-widest">No schematics registered.</div>
                ) : projects.map(project => (
                    <Card key={project.id} className="overflow-hidden hover:border-white/30 transition-all duration-300 border-white/10 group flex flex-col min-h-[200px]">
                        <CardHeader className="pb-3 flex-grow relative">
                            <span className="absolute top-4 right-4 text-[9px] uppercase tracking-[0.2em] font-black opacity-40 px-2 py-0.5 border border-white/10">{project.categoria}</span>
                            <div className="space-y-1 mt-4">
                                <CardTitle className="text-xl font-serif font-bold tracking-tight">{project.nome}</CardTitle>
                                <CardDescription className="font-mono text-[10px] uppercase tracking-widest opacity-40">{project.subcategoria} · {project.folhas} Folhas</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="flex gap-4 border-t border-white/10 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-30">Materials</span>
                                    <span className="font-serif italic text-sm">{project.componentes?.length || 0} Components</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-30">Glass</span>
                                    <span className="font-serif italic text-sm">{project.vidros?.length || 0} Specifications</span>
                                </div>
                            </div>
                            <div className="flex gap-1 justify-end pt-2">
                                <Button variant="ghost" size="sm" className="h-8 rounded-none text-[9px] uppercase tracking-widest font-bold hover:bg-white hover:text-black" onClick={() => { setFormData(project); setIsOpen(true); }}>
                                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 rounded-none text-[9px] uppercase tracking-widest font-bold text-destructive hover:bg-destructive hover:text-white" onClick={() => project.id && dbService.delete('produtos_compostos', project.id).then(loadData)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{formData.id ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome do Produto</Label>
                                <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Janela 2 Folhas Correr" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Categoria</Label>
                                    <Input value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Espessura</Label>
                                    <Input value={formData.espessura} onChange={e => setFormData({...formData, espessura: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-primary font-bold">🛠️ Composição (Materiais)</Label>
                                <div className="rounded-md border p-2 bg-muted/30 max-h-[300px] overflow-y-auto space-y-2">
                                    {formData.componentes?.length === 0 ? (
                                        <p className="text-xs text-center py-4 text-muted-foreground">Nenhum material adicionado.</p>
                                    ) : formData.componentes?.map((comp, idx) => (
                                        <div key={idx} className="bg-background p-2 rounded border text-xs flex flex-col gap-2">
                                            <div className="flex justify-between font-bold">
                                                <span>{comp.codigo}</span>
                                                <X className="h-3 w-3 cursor-pointer text-destructive" onClick={() => removeComponent(idx)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px]">Fórmula (mm)</Label>
                                                    <Input className="h-7 text-[11px]" value={comp.formula} onChange={e => {
                                                        const comps = [...(formData.componentes || [])];
                                                        comps[idx].formula = e.target.value;
                                                        setFormData({...formData, componentes: comps});
                                                    }} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px]">Qtde Peças</Label>
                                                    <Input type="number" className="h-7 text-[11px]" value={comp.qtd_pecas} onChange={e => {
                                                       const comps = [...(formData.componentes || [])];
                                                       comps[idx].qtd_pecas = parseInt(e.target.value) || 1;
                                                       setFormData({...formData, componentes: comps});
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <Label>🔎 Buscar no Estoque</Label>
                             <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Digite código ou descrição..." className="pl-8" />
                             </div>
                             <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="text-[10px]">Cód.</TableHead>
                                            <TableHead className="text-[10px]">Descrição</TableHead>
                                            <TableHead className="text-[10px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockItems.map(item => (
                                            <TableRow key={item.id} className="text-xs">
                                                <TableCell className="font-mono">{item.codigo_fabricante}</TableCell>
                                                <TableCell className="max-w-[150px] truncate">{item.descricao}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addComponent(item)}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar Projeto</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
