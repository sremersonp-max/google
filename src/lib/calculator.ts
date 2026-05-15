export const evaluateFormula = (formula: string, context: Record<string, number>): number => {
    if (!formula || !formula.trim()) return 0;
    
    let expression = String(formula);
    
    // Sort keys by length descending to avoid replacing partial names (e.g., 'L' and 'L2')
    const keys = Object.keys(context).sort((a, b) => b.length - a.length);
    
    for (const key of keys) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        expression = expression.replace(regex, context[key].toString());
    }

    // Clean up math functions
    expression = expression.replace(/Math\./gi, '')
        .replace(/CEIL\(/gi, 'Math.ceil(')
        .replace(/FLOOR\(/gi, 'Math.floor(')
        .replace(/ROUND\(/gi, 'Math.round(')
        .replace(/INT\(/gi, 'Math.trunc(')
        .replace(/ABS\(/gi, 'Math.abs(');

    // Basic security check
    if (!/^[\d\s+\-*/().,a-zA-Z]+$/.test(expression)) {
        console.warn('Invalid formula:', expression);
        return 0;
    }

    try {
        // eslint-disable-next-line no-new-func
        return Math.round(new Function(`"use strict"; return (${expression})`)());
    } catch (e) {
        console.error('Error calculating formula:', formula, e);
        return 0;
    }
};

export interface CalcResult {
    cost: number;
    price: number;
    components: any[];
}

export const calculateProject = (
    project: any, 
    L: number, 
    A: number, 
    Q: number, 
    stock: any[], 
    margin: number
): CalcResult => {
    let totalCost = 0;
    const TP = project.transpasse || 20;
    const ctx = { L, A, TP, folhas: project.folhas || 4, Q };
    
    const calculatedComponents = (project.componentes || []).map((comp: any) => {
        const mmPerPiece = evaluateFormula(comp.formula, ctx);
        const totalMM = mmPerPiece * (comp.qtd_pecas || 1) * Q;
        
        // Find in stock
        const item = stock.find(s => s.codigo_fabricante === comp.codigo);
        let cost = 0;
        
        if (item) {
            const rawVal = parseFloat(item.valor) || 0;
            const qtdBuy = parseFloat(item.qtd_unidade_compra) || 1;
            const unitVal = rawVal / qtdBuy;
            
            if (item.unidade_venda === 'MT') {
                cost = (totalMM / 1000) * unitVal;
            } else {
                cost = Math.ceil(totalMM) * unitVal;
            }
        }
        
        totalCost += cost;
        return { ...comp, mmPerPiece, totalMM, cost };
    });

    return {
        cost: totalCost,
        price: totalCost * (1 + margin / 100),
        components: calculatedComponents
    };
};
