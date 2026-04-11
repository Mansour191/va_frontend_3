import { ref, computed, reactive } from 'vue';
import { useQuery, useResult } from '@vue/apollo-composable';
import { provideApolloClient } from '@vue/apollo-composable';
import { client } from '@/shared/plugins/apolloPlugin';
import {
  ALL_MATERIALS_QUERY,
  ACTIVE_MATERIALS_QUERY,
  PREMIUM_MATERIALS_QUERY,
  MATERIAL_BY_ID_QUERY,
  MATERIAL_BY_NAME_QUERY,
  MATERIALS_WITH_PRICING_QUERY,
  SEARCH_MATERIALS_QUERY,
  MATERIAL_CATEGORIES_QUERY,
  MATERIAL_PROPERTIES_SCHEMA_QUERY
} from '@/integration/graphql/materials.graphql';

// Ensure Apollo Client is available
provideApolloClient(client);

// Materials State Management
const materialsState = reactive({
  materials: [],
  premiumMaterials: [],
  activeMaterials: [],
  selectedMaterial: null,
  loading: false,
  error: null,
  pricingEngine: null,
  materialCategories: [],
  propertiesSchema: null
});

export const useMaterials = () => {
  // Fetch all materials
  const { result: allMaterialsResult, loading: allMaterialsLoading, error: allMaterialsError } = useQuery(
    ALL_MATERIALS_QUERY,
    {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    }
  );

  // Fetch active materials only
  const { result: activeMaterialsResult, loading: activeMaterialsLoading, error: activeMaterialsError } = useQuery(
    ACTIVE_MATERIALS_QUERY,
    {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    }
  );

  // Fetch premium materials only
  const { result: premiumMaterialsResult, loading: premiumMaterialsLoading, error: premiumMaterialsError } = useQuery(
    PREMIUM_MATERIALS_QUERY,
    {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    }
  );

  // Fetch pricing engine data
  const { result: pricingResult, loading: pricingLoading, error: pricingError } = useQuery(
    MATERIALS_WITH_PRICING_QUERY,
    {
      variables: { width: 1, height: 1 }, // Default dimensions
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    }
  );

  // Fetch material by ID
  const getMaterialById = (id) => {
    const { result, loading, error } = useQuery(
      MATERIAL_BY_ID_QUERY,
      () => ({
        id: id
      }),
      {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
      }
    );
    return { result, loading, error };
  };

  // Fetch material by name
  const getMaterialByName = (name) => {
    const { result, loading, error } = useQuery(
      MATERIAL_BY_NAME_QUERY,
      () => ({
        name: name
      }),
      {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
      }
    );
    return { result, loading, error };
  };

  // Search materials
  const searchMaterials = (searchTerm, isPremium = null) => {
    const { result, loading, error } = useQuery(
      SEARCH_MATERIALS_QUERY,
      () => ({
        searchTerm,
        isPremium
      }),
      {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
      }
    );
    return { result, loading, error };
  };

  // Computed properties
  const materials = computed(() => {
    const data = useResult(allMaterialsResult, []).value;
    return data.edges?.map(edge => ({
      ...edge.node,
      // Ensure properties are properly parsed
      properties: parseMaterialProperties(edge.node.properties)
    })) || [];
  });

  const activeMaterials = computed(() => {
    const data = useResult(activeMaterialsResult, []).value;
    return data.edges?.map(edge => ({
      ...edge.node,
      properties: parseMaterialProperties(edge.node.properties)
    })) || [];
  });

  const premiumMaterials = computed(() => {
    const data = useResult(premiumMaterialsResult, []).value;
    return data.edges?.map(edge => ({
      ...edge.node,
      properties: parseMaterialProperties(edge.node.properties)
    })) || [];
  });

  const pricingEngine = computed(() => {
    return useResult(pricingResult, null).value?.pricingEngine || null;
  });

  const loading = computed(() => 
    allMaterialsLoading.value || 
    activeMaterialsLoading.value || 
    premiumMaterialsLoading.value || 
    pricingLoading.value
  );

  const error = computed(() => 
    allMaterialsError.value || 
    activeMaterialsError.value || 
    premiumMaterialsError.value || 
    pricingError.value
  );

  // Helper functions
  const parseMaterialProperties = (properties) => {
    try {
      return typeof properties === 'string' ? JSON.parse(properties) : (properties || {});
    } catch (error) {
      console.warn('❌ Error parsing material properties:', error);
      return {};
    }
  };

  const findMaterialById = (materialId) => {
    return materials.value.find(material => material.id === materialId);
  };

  const findMaterialByName = (name) => {
    return materials.value.find(material => 
      material.nameAr === name || material.nameEn === name
    );
  };

  const filterPremiumMaterials = (materialList = null) => {
    const sourceList = materialList || materials.value;
    return sourceList.filter(material => material.isPremium);
  };

  const filterActiveMaterials = (materialList = null) => {
    const sourceList = materialList || materials.value;
    return sourceList.filter(material => material.isActive);
  };

  const selectMaterial = (material) => {
    materialsState.selectedMaterial = material;
    console.log('✅ Material selected:', material);
  };

  const clearSelection = () => {
    materialsState.selectedMaterial = null;
  };

  // Price calculation functions
  const calculateMaterialPrice = (material, width, height, quantity = 1) => {
    if (!material) return 0;
    
    const area = (width * height) / 10000; // Convert cm² to m²
    const basePrice = material.pricePerM2 * area * quantity;
    
    // Add premium surcharge if applicable
    const premiumSurcharge = material.isPremium ? basePrice * 0.2 : 0; // 20% premium surcharge
    
    return basePrice + premiumSurcharge;
  };

  const calculateTotalPrice = (material, dimensions, quantity = 1) => {
    if (!material || !dimensions) return 0;
    
    const { width, height } = dimensions;
    const materialPrice = calculateMaterialPrice(material, width, height, quantity);
    
    // Add pricing engine factors if available
    if (pricingEngine.value) {
      const { rawMaterialCost, laborCost, internationalShipping } = pricingEngine.value;
      return materialPrice + (laborCost || 0) + (internationalShipping || 0);
    }
    
    return materialPrice;
  };

  // Material properties validation
  const validateMaterialProperties = (material, requiredProperties = []) => {
    if (!material || !material.properties) return false;
    
    const materialProps = material.properties;
    return requiredProperties.every(prop => 
      prop in materialProps && materialProps[prop] !== null && materialProps[prop] !== undefined
    );
  };

  const getMaterialProperty = (material, propertyName, defaultValue = null) => {
    if (!material || !material.properties) return defaultValue;
    return material.properties[propertyName] ?? defaultValue;
  };

  // Material comparison functions
  const compareMaterials = (material1, material2) => {
    if (!material1 || !material2) return 0;
    
    return material1.pricePerM2 - material2.pricePerM2;
  };

  const getCheapestMaterial = (materialList = null) => {
    const sourceList = materialList || materials.value;
    return sourceList.reduce((cheapest, current) => 
      current.pricePerM2 < cheapest.pricePerM2 ? current : cheapest
    , sourceList[0]);
  };

  const getMostExpensiveMaterial = (materialList = null) => {
    const sourceList = materialList || materials.value;
    return sourceList.reduce((expensive, current) => 
      current.pricePerM2 > expensive.pricePerM2 ? current : expensive
    , sourceList[0]);
  };

  // Update reactive state
  const updateState = () => {
    materialsState.materials = materials.value;
    materialsState.activeMaterials = activeMaterials.value;
    materialsState.premiumMaterials = premiumMaterials.value;
    materialsState.pricingEngine = pricingEngine.value;
    materialsState.loading = loading.value;
    materialsState.error = error.value;
  };

  // Watch for changes and update state
  const stopWatcher = computed(() => {
    updateState();
    return null;
  });

  // Initialize
  const initialize = () => {
    updateState();
  };

  return {
    // State
    materials,
    activeMaterials,
    premiumMaterials,
    selectedMaterial: computed(() => materialsState.selectedMaterial),
    pricingEngine,
    loading,
    error,
    materialCategories: computed(() => materialsState.materialCategories),
    propertiesSchema: computed(() => materialsState.propertiesSchema),

    // Actions
    getMaterialById,
    getMaterialByName,
    searchMaterials,
    findMaterialById,
    findMaterialByName,
    filterPremiumMaterials,
    filterActiveMaterials,
    selectMaterial,
    clearSelection,

    // Price calculations
    calculateMaterialPrice,
    calculateTotalPrice,

    // Properties handling
    validateMaterialProperties,
    getMaterialProperty,
    parseMaterialProperties,

    // Comparison functions
    compareMaterials,
    getCheapestMaterial,
    getMostExpensiveMaterial,

    // Initialization
    initialize
  };
};
