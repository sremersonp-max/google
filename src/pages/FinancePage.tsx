import { useState, useEffect } from "react";
import { Wallet, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { dbService, FinanceRecord } from "../lib/db";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const FinancePage = () => {
    const [records, setRecords] = useState<FinanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const data = await dbService.getAll<FinanceRecord>('financeiro');
        setRecords(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const totalIncome = records.filter(r => r.tipo === 'receita').reduce((acc, r) => acc + r.valorPago, 0);
    const totalExpense = records.filter(r => r.tipo === 'despesa').reduce((acc, r) => acc + r.valorTotal, 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Wallet className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">📊 Relatórios</Button>
                    <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Novo Lançamento</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-green-50/50 border-green-100">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-green-700">Receitas (Pago)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-green-700">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>
                <Card className="bg-red-50/50 border-red-100">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-red-700">Despesas</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-red-700">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-blue-700">Saldo Atual</CardTitle>
                        <ArrowUpRight className={`h-4 w-4 ${balance >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-black ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Últimos Lançamentos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground animate-pulse">Consultando transações...</TableCell></TableRow>
                                ) : records.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">Nenhuma transação registrada.</TableCell></TableRow>
                                ) : records.map(record => (
                                    <TableRow key={record.id}>
                                        <TableCell className="text-xs">{record.dataCriacao ? format(new Date(record.dataCriacao), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</TableCell>
                                        <TableCell className="font-medium">{record.descricao}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-[10px]">{record.categoria}</Badge></TableCell>
                                        <TableCell>
                                            {record.tipo === 'receita' ? (
                                                <span className="text-green-600 flex items-center gap-1 text-xs font-bold">
                                                    <ArrowUpRight className="h-3 w-3" /> Receita
                                                </span>
                                            ) : (
                                                <span className="text-red-600 flex items-center gap-1 text-xs font-bold">
                                                    <ArrowDownRight className="h-3 w-3" /> Despesa
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            R$ {record.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge 
                                                variant={record.status === 'pago' ? 'default' : 'secondary'} 
                                                className={`text-[10px] ${record.status === 'pago' ? 'bg-green-600' : ''}`}
                                            >
                                                {record.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
