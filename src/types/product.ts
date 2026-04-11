// Product Variant TypeScript Interface
export interface ProductVariant {
  id: string;
  product: string | Product;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Interface (for reference)
export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  basePrice: number;
  cost?: number;
  category?: Category;
  onSale: boolean;
  discountPercent: number;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  stock: number;
  weight?: number;
  dimensions?: string;
  tags?: Record<string, any> | string[];
  seoTitle?: string;
  seoDescription?: string;
  syncStatus?: string;
  erpnextItemCode?: string;
  syncError?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  materials?: Material[];
}

// Category Interface
export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon?: string;
  image?: string;
  parent?: string | Category;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ProductImage Interface
export interface ProductImage {
  id: string;
  product: string | Product;
  imageUrl: string;
  altText?: string;
  isMain: boolean;
  sortOrder: number;
  createdAt: string;
}

// ProductMaterial Interface
export interface ProductMaterial {
  id: string;
  product: string | Product;
  material: Material;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Material Interface
export interface Material {
  id: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  pricePerM2: number;
  isPremium: boolean;
  isActive: boolean;
  image?: string;
  properties?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
