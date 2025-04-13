export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  totalValue: number;
  lastUpdated: string | any;
  totalSellPrice: number;
  sellPrice: number;
};
