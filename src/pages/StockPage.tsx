import { useState, useEffect } from "react";
import { 
  Database, 
  Download, 
  Filter, 
  Plus, 
  Search, 
  Trash2, 
  Upload, 
  Edit 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { dbService, Product } from "../lib/db";
import { toast } from "sonner";

export const StockPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [isModalOpen, setIsLicensed] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    categoria: "",
    grupo: "",
    descricao: "",
    cor: "",
    espessura: "",
    unidade_compra: "UN",
    unidade_venda: "UN",
    qtd_unidade_compra: "1",
    valor: "0",
    codigo_fabricante: ""
  });

  const loadProducts = async () => {
    setLoading(true);
    const data = await dbService.getAll<Product>('produtos');
    setProducts(data);
    setFilteredProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => 
        p.descricao.toLowerCase().includes(s) || 
        p.codigo_fabricante.toLowerCase().includes(s)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter(p => p.categoria === categoryFilter);
    }
    setFilteredProducts(result);
  }, [search, categoryFilter, products]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (editingProduct?.id) {
            await dbService.put('produtos', { ...formData, id: editingProduct.id });
            toast.success("Produto atualizado com sucesso!");
        } else {
            await dbService.add('produtos', formData);
            toast.success("Produto adicionado com sucesso!");
        }
        setIsLicensed(false);
        setEditingProduct(null);
        loadProducts();
    } catch (error) {
        toast.error("Erro ao salvar produto.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Deseja realmente excluir este item?")) {
        await dbService.delete('produtos', id);
        toast.success("Item removido.");
        loadProducts();
    }
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsLicensed(true);
  };

  const categories = Array.from(new Set(products.map(p => p.categoria))).filter(Boolean);

  return (
    <div className="p-8 space-y-8">
      {/* Identity Header */}
      <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-6">
        <div className="flex flex-col">
          <span className="bento-label mb-1">Stock Portfolio & Resources</span>
          <h1 className="text-3xl font-light tracking-tight">INVENTORY <span className="font-bold">ASSETS</span></h1>
        </div>
        <div className="text-right">
          <span className="bento-label block">Database Status</span>
          <span className="font-mono text-sm opacity-60">LOCAL-SYNCED</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-30">Management Actions</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-sm border-white/10 text-[10px] uppercase tracking-widest font-bold h-9">
              <Upload className="mr-2 h-3.5 w-3.5" /> Import
            </Button>
            <Button variant="outline" size="sm" className="rounded-sm border-white/10 text-[10px] uppercase tracking-widest font-bold h-9">
              <Download className="mr-2 h-3.5 w-3.5" /> Export
            </Button>
            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsLicensed(open); if(!open) setEditingProduct(null); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-sm text-[10px] uppercase tracking-widest font-bold h-9" onClick={() => { setEditingProduct(null); setFormData({ unidade_compra: "UN", unidade_venda: "UN", qtd_unidade_compra: "1", valor: "0" }); }}>
                  <Plus className="mr-2 h-3.5 w-3.5" /> Register Item
                </Button>
              </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? "Editar Item" : "Novo Item no Estoque"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="categoria">Categoria</Label>
                            <Input id="categoria" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} placeholder="VIDROS, ALUMÍNIO..." required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grupo">Subcategoria / Grupo</Label>
                            <Input id="grupo" value={formData.grupo} onChange={e => setFormData({...formData, grupo: e.target.value})} placeholder="Temperado, Perfil..." />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Input id="descricao" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Cristal Incolor 08 mm" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cor">Cor</Label>
                            <Input id="cor" value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} placeholder="BRANCO, PRETO..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código Fabricante</Label>
                            <Input id="codigo" value={formData.codigo_fabricante} onChange={e => setFormData({...formData, codigo_fabricante: e.target.value})} placeholder="VT804, VD-1108..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unidade_compra">Unid. Compra</Label>
                            <Input id="unidade_compra" value={formData.unidade_compra} onChange={e => setFormData({...formData, unidade_compra: e.target.value})} placeholder="BR, PC, M2" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unidade_venda">Unid. Venda</Label>
                            <Input id="unidade_venda" value={formData.unidade_venda} onChange={e => setFormData({...formData, unidade_venda: e.target.value})} placeholder="MT, UN, M2" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="qtd_unidade">Qtd por Compra</Label>
                            <Input id="qtd_unidade" type="number" step="0.01" value={formData.qtd_unidade_compra} onChange={e => setFormData({...formData, qtd_unidade_compra: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor R$ (Compra)</Label>
                            <Input id="valor" type="number" step="0.01" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} />
                        </div>
                        <DialogFooter className="col-span-2">
                            <Button type="button" variant="outline" onClick={() => setIsLicensed(false)}>Cancelar</Button>
                            <Button type="submit">Salvar Item</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card className="rounded-sm border-white/10 shadow-none">
        <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="SEARCH INVENTORY..." 
                        className="pl-8 rounded-sm bg-black/20 border-white/10 text-[10px] uppercase tracking-widest font-bold h-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px] rounded-sm bg-black/20 border-white/10 text-[10px] uppercase tracking-widest font-bold h-10">
                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="CATEGORY" />
                    </SelectTrigger>
                    <SelectContent className="bg-bento-card border-white/10">
                        <SelectItem value="all" className="text-[10px] uppercase font-bold tracking-widest">All Categories</SelectItem>
                        {categories.map(c => (
                            <SelectItem key={c} value={c} className="text-[10px] uppercase font-bold tracking-widest">{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-sm border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-white/5 border-white/10 hover:bg-white/5">
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold opacity-40">Code</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold opacity-40">Description</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold opacity-40">Category</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold opacity-40">Variation</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold opacity-40 text-right">Sale Value</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold opacity-40 text-center w-[100px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow className="border-white/5"><TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic font-mono text-[10px] uppercase tracking-widest">Scanning inventory...</TableCell></TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow className="border-white/5"><TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic font-mono text-[10px] uppercase tracking-widest">No entries found.</TableCell></TableRow>
                        ) : filteredProducts.map((p) => {
                            const val = parseFloat(p.valor || "0");
                            const qtd = parseFloat(p.qtd_unidade_compra || "1") || 1;
                            const valVenda = val / qtd;
                            return (
                                <TableRow key={p.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="font-mono text-[10px] opacity-60 tracking-tighter">{p.codigo_fabricante || '-'}</TableCell>
                                    <TableCell className="font-serif font-medium text-sm tracking-tight">{p.descricao}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-bold border-white/10 text-[9px] uppercase tracking-widest rounded-none bg-white/5">{p.categoria}</Badge>
                                    </TableCell>
                                    <TableCell className="text-[10px] opacity-60">{p.cor || '-'}</TableCell>
                                    <TableCell className="text-right font-serif font-bold text-base">
                                        <span className="text-[10px] font-sans opacity-40 mr-1">R$</span>
                                        {valVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        <span className="text-[9px] text-muted-foreground ml-1 uppercase tracking-widest">/{p.unidade_venda}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-black rounded-none" onClick={() => openEdit(p)}>
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive hover:text-white rounded-none" onClick={() => p.id && handleDelete(p.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};
