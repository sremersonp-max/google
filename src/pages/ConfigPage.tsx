import { useState, useEffect } from "react";
import { Cog, Save, Shield, Smartphone, HardDrive, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { dbService } from "../lib/db";
import { toast } from "sonner";

export const ConfigPage = () => {
    const [config, setConfig] = useState<any>({
        razaoSocial: "",
        nomeFantasia: "",
        cnpj: "",
        email: "",
        whatsapp: "",
        endereco: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            const keys = ['razaoSocial', 'nomeFantasia', 'cnpj', 'email', 'whatsapp', 'endereco'];
            const newConfig: any = {};
            for (const key of keys) {
                newConfig[key] = await dbService.getConfig(key) || "";
            }
            setConfig(newConfig);
            setLoading(false);
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        for (const [key, value] of Object.entries(config)) {
            await dbService.setConfig(key, value);
        }
        await dbService.setConfig('sistema_configurado', 'true');
        toast.success("Configurações salvas com sucesso!");
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Cog className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
                </div>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            Dados da Empresa
                        </CardTitle>
                        <CardDescription>Essas informações aparecerão nos orçamentos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome Fantasia</Label>
                            <Input value={config.nomeFantasia} onChange={e => setConfig({...config, nomeFantasia: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Razão Social</Label>
                            <Input value={config.razaoSocial} onChange={e => setConfig({...config, razaoSocial: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>CNPJ</Label>
                                <Input value={config.cnpj} onChange={e => setConfig({...config, cnpj: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>WhatsApp</Label>
                                <Input value={config.whatsapp} onChange={e => setConfig({...config, whatsapp: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Endereço Completo</Label>
                            <Input value={config.endereco} onChange={e => setConfig({...config, endereco: e.target.value})} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-orange-500" />
                            Dispositivo e Backup
                        </CardTitle>
                        <CardDescription>Gerencie a sincronização local e nuvem.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                           <Label>Machine ID</Label>
                           <div className="flex gap-2">
                               <Input readOnly value={localStorage.getItem('_of_machine_id') || "DESCONHECIDO"} className="bg-muted font-mono text-xs uppercase" />
                               <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
                           </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold flex items-center gap-2">
                                <HardDrive className="h-4 w-4" /> Exportação Manual
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="text-xs">💾 Exportar JSON</Button>
                                <Button variant="outline" className="text-xs">📤 Importar JSON</Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="rounded-lg border p-4 bg-blue-50/20 space-y-2">
                             <h4 className="text-xs font-black uppercase text-blue-700 tracking-tighter">Sincronização Nuvem</h4>
                             <p className="text-[10px] text-muted-foreground leading-tight">O sistema utiliza o Google Drive para manter seus dados sincronizados entre múltiplos dispositivos.</p>
                             <Button variant="link" className="p-0 h-auto text-xs text-blue-600 font-bold">Conectar Google Account →</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
