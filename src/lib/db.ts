import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'EstoquePedidosDB';
const DB_VERSION = 15;

export interface Product {
  id?: number;
  uid?: string;
  categoria: string;
  grupo: string;
  descricao: string;
  cor: string;
  espessura: string;
  unidade_compra: string;
  unidade_venda: string;
  qtd_unidade_compra: string;
  valor: string;
  codigo_fabricante: string;
  data_alteracao?: string;
}

export interface CompoundProduct {
  id?: number;
  uid?: string;
  nome: string;
  categoria: string;
  subcategoria: string;
  espessura: string;
  transpasse: number;
  folhas: number;
  componentes: any[];
  vidros: any[];
  variaveis: any[];
  imagem_orcamento?: string;
  data_alteracao?: string;
}

export interface Quotation {
  id?: number;
  uid?: string;
  data: string;
  cliente: string;
  telefone: string;
  endereco: string;
  margem: number;
  descontoPerc: number;
  descontoValor: number;
  subtotal: string;
  total: string;
  totalNumero: number;
  status: 'Pendente' | 'Fechado' | 'Finalizado' | 'Cancelado';
  produtos: any[];
  data_alteracao?: string;
}

export interface FinanceRecord {
  id?: number;
  uid?: string;
  tipo: 'receita' | 'despesa';
  cliente?: string;
  fornecedor?: string;
  descricao: string;
  categoria: string;
  valorTotal: number;
  valorPago: number;
  status: 'pendente' | 'pago' | 'parcial';
  dataCriacao: string;
  dataVencimento?: string;
  dataPagamento?: string;
  formaPagamento?: string;
  parcelas?: any[];
  historico?: any[];
  observacao?: string;
  orcamentoId?: number;
  data_alteracao?: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export const initDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('produtos')) {
        const store = db.createObjectStore('produtos', { keyPath: 'id', autoIncrement: true });
        store.createIndex('categoria', 'categoria');
        store.createIndex('grupo', 'grupo');
        store.createIndex('codigo_fabricante', 'codigo_fabricante');
      }
      if (!db.objectStoreNames.contains('produtos_compostos')) {
        db.createObjectStore('produtos_compostos', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('variaveis_produto')) {
        const store = db.createObjectStore('variaveis_produto', { keyPath: 'id', autoIncrement: true });
        store.createIndex('produto_id', 'produto_id');
      }
      if (!db.objectStoreNames.contains('orcamentos')) {
        const store = db.createObjectStore('orcamentos', { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status');
        store.createIndex('cliente', 'cliente');
      }
      if (!db.objectStoreNames.contains('obras')) {
        db.createObjectStore('obras', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pedidos_material')) {
        const store = db.createObjectStore('pedidos_material', { keyPath: 'id', autoIncrement: true });
        store.createIndex('obraId', 'obraId');
        store.createIndex('status', 'status');
      }
      if (!db.objectStoreNames.contains('pedidos_tempera')) {
        const store = db.createObjectStore('pedidos_tempera', { keyPath: 'id', autoIncrement: true });
        store.createIndex('obraId', 'obraId');
        store.createIndex('status', 'status');
      }
      if (!db.objectStoreNames.contains('pedidos')) {
        const store = db.createObjectStore('pedidos', { keyPath: 'id', autoIncrement: true });
        store.createIndex('data', 'data');
      }
      if (!db.objectStoreNames.contains('configuracoes')) {
        db.createObjectStore('configuracoes', { keyPath: 'chave' });
      }
      if (!db.objectStoreNames.contains('categorias_produtos')) {
        db.createObjectStore('categorias_produtos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('licenca')) {
        db.createObjectStore('licenca', { keyPath: 'chave' });
      }
      if (!db.objectStoreNames.contains('financeiro')) {
        const store = db.createObjectStore('financeiro', { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status');
        store.createIndex('obraId', 'obraId');
        store.createIndex('cliente', 'cliente');
        store.createIndex('tipo', 'tipo');
        store.createIndex('dataVencimento', 'dataVencimento');
        store.createIndex('dataPagamento', 'dataPagamento');
        store.createIndex('categoria', 'categoria');
      }
    },
  });

  return dbPromise;
};

export const dbService = {
  async getAll<T>(store: string): Promise<T[]> {
    const db = await initDB();
    return db.getAll(store);
  },
  async get<T>(store: string, id: any): Promise<T | undefined> {
    const db = await initDB();
    return db.get(store, id);
  },
  async add(store: string, data: any) {
    const db = await initDB();
    const now = new Date().toISOString();
    const uid = data.uid || `uid_${Math.random().toString(36).substr(2, 9)}`;
    return db.add(store, { ...data, uid, data_alteracao: now });
  },
  async put(store: string, data: any) {
    const db = await initDB();
    const now = new Date().toISOString();
    const uid = data.uid || `uid_${Math.random().toString(36).substr(2, 9)}`;
    return db.put(store, { ...data, uid, data_alteracao: now });
  },
  async delete(store: string, id: any) {
    const db = await initDB();
    return db.delete(store, id);
  },
  async count(store: string) {
    const db = await initDB();
    return db.count(store);
  },
  async getConfig(chave: string) {
    const db = await initDB();
    const config = await db.get('configuracoes', chave);
    return config ? config.valor : null;
  },
  async setConfig(chave: string, valor: any) {
    return this.put('configuracoes', { chave, valor });
  }
};
