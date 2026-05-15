import { dbService } from "./db";

export const initialStock = [
    {
        categoria: "Acessórios",
        grupo: "TUBOS",
        descricao: "TAMPA PARA RIPADO PLB075 AMADEIRADO",
        cor: "AMADEIRADO",
        valor: "7.74",
        codigo_fabricante: "TAMPA075AM",
        unidade_compra: "UN",
        unidade_venda: "UN",
        qtd_unidade_compra: "1"
    },
    {
        categoria: "Acessórios",
        grupo: "Temperado",
        descricao: "ACABAMENTO DO PERFIL KIT BOX - BRANCO - PAR",
        cor: "BRANCO",
        valor: "0.58",
        codigo_fabricante: "NT106BR",
        unidade_compra: "UN",
        unidade_venda: "UN",
        qtd_unidade_compra: "1"
    },
    {
        categoria: "VIDROS",
        grupo: "INCOLOR",
        descricao: "Cristal Incolor 08 mm",
        cor: "INCOLOR",
        valor: "143.00",
        codigo_fabricante: "VD-1108",
        espessura: "08",
        unidade_compra: "M2",
        unidade_venda: "M2",
        qtd_unidade_compra: "1"
    },
    {
        categoria: "ALUMÍNIO",
        grupo: "PERFIL",
        descricao: "PERFIL SUPERIOR BOX BRANCO 6m",
        cor: "BRANCO",
        valor: "120.00",
        codigo_fabricante: "BX-110",
        unidade_compra: "BR",
        unidade_venda: "MT",
        qtd_unidade_compra: "6.0"
    }
];

export const initialCompoundProducts = [
    {
        nome: "Janela 4 Folhas Temperado",
        categoria: "Janela",
        subcategoria: "Temperado",
        espessura: "8",
        transpasse: 20,
        folhas: 4,
        componentes: [
            { codigo: "BX-110", descricao: "PERFIL SUPERIOR", formula: "L", tipo_calculo: "metro", comprimento_barra: 6, qtd_pecas: 1 },
        ],
        vidros: [
            { tipo: "FIXO", quantidade: "2", largura: "L/4", altura: "A-60" },
            { tipo: "MOVEL", quantidade: "2", largura: "L/4+TP", altura: "A-20" }
        ],
        variaveis: []
    }
];

export const seedDatabase = async () => {
    const stockCount = await dbService.count('produtos');
    if (stockCount === 0) {
        for (const item of initialStock) {
            await dbService.add('produtos', item);
        }
        console.log("Seed: Stock initialized.");
    }

    const projectsCount = await dbService.count('produtos_compostos');
    if (projectsCount === 0) {
        for (const item of initialCompoundProducts) {
            await dbService.add('produtos_compostos', item);
        }
        console.log("Seed: Projects initialized.");
    }
    
    await dbService.setConfig('sistema_configurado', 'true');
};
