// Shipping TypeScript Interfaces

export interface Shipping {
  id: string;
  wilayaId: string;
  nameAr: string;
  nameFr: string;
  stopDeskPrice: number;
  homeDeliveryPrice: number;
  isActive: boolean;
  regions: string[] | Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  provider: string;
  serviceType: string;
  expectedDeliveryTime: number;
  deliveryDays: string[] | Record<string, any>;
  cutoffTime?: string;
  logo?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  trackingAvailable: boolean;
  insuranceAvailable: boolean;
  codAvailable: boolean;
  coverageWilayas: string[] | Record<string, any>;
  maxWeight?: number;
  maxDimensions: Record<string, any>;
  trackingUrlTemplate?: string;
  apiEndpoint?: string;
  apiKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingPrice {
  id: string;
  wilaya: string | Shipping;
  shippingMethod: string | ShippingMethod;
  homeDeliveryPrice: number;
  stopDeskPrice: number;
  expressPrice?: number;
  pickupPrice?: number;
  freeShippingMinimum?: number;
  weightSurcharge: number;
  volumeSurcharge: number;
  codAvailable: boolean;
  codFee: number;
  insuranceAvailable: boolean;
  insuranceRate: number;
  trackingAvailable: boolean;
  maxWeight?: number;
  maxValue?: number;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingOption {
  type: 'home_delivery' | 'stop_desk' | 'express' | 'pickup';
  price: number;
  estimatedDays: number;
  description: string;
}

export interface ShippingCalculation {
  id: string;
  wilayaId: string;
  nameAr: string;
  nameFr: string;
  stopDeskPrice: number;
  homeDeliveryPrice: number;
  isActive: boolean;
  regions: string[] | Record<string, any>;
  calculatedPrice: number;
  estimatedDeliveryTime: number;
  deliveryOptions: ShippingOption[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingInput {
  wilayaId: string;
  nameAr: string;
  nameFr: string;
  stopDeskPrice: number;
  homeDeliveryPrice: number;
  isActive?: boolean;
  regions?: string[] | Record<string, any>;
}

export interface ShippingUpdateInput {
  id: string;
  stopDeskPrice?: number;
  homeDeliveryPrice?: number;
  isActive?: boolean;
  regions?: string[] | Record<string, any>;
}

export interface ShippingFilterInput {
  wilayaId?: string;
  nameAr?: string;
  nameFr?: string;
  isActive?: boolean;
}

// GraphQL Response Types
export interface ShippingResponse {
  id: string;
  wilayaId: string;
  nameAr: string;
  nameFr: string;
  stopDeskPrice: number;
  homeDeliveryPrice: number;
  isActive: boolean;
  regions: string[] | Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingListResponse {
  edges: {
    node: ShippingResponse;
    cursor: string;
  }[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
}

export interface ShippingMutationResponse {
  success: boolean;
  message: string;
  shipping?: ShippingResponse;
}

export interface ShippingUpdatePricesVariables {
  wilayaId: string;
  stopDeskPrice: number;
  homeDeliveryPrice: number;
}

export interface ToggleShippingStatusVariables {
  wilayaId: string;
  isActive: boolean;
}
