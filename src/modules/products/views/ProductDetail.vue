<template>
  <div class="product-detail">
    <v-container v-if="loading" class="py-16">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-text class="pa-8">
              <div class="text-center">
                <v-progress-circular
                  indeterminate
                  color="warning"
                  size="64"
                ></v-progress-circular>
                <div class="mt-4">
                  <h3 class="text-h5">{{ $t('loading') }}</h3>
                  <p class="text-body-1">{{ $t('loadingProduct') }}</p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-alert
      v-else-if="error"
      type="error"
      prominent
      class="ma-4"
    >
      <v-alert-title>{{ $t('error') }}</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Product Content -->
    <v-container v-else-if="product">
      <v-row>
        <v-col cols="12" md="6">
          <v-card elevation="2" class="rounded-3xl pa-4">
            <v-img
              :src="mainProductImage?.imageUrl || '/placeholder-product.jpg'"
              :alt="mainProductImage?.altText || product?.nameAr || 'Product Image'"
              height="420"
              class="rounded-2xl"
              cover
            >
              <template #placeholder>
                <v-skeleton-loader type="image"></v-skeleton-loader>
              </template>
              
              <!-- Stock Status Badge -->
              <div class="position-absolute top-2 left-2">
                <v-chip
                  :color="stockStatus === 'in_stock' ? 'success' : stockStatus === 'low_stock' ? 'warning' : 'error'"
                  variant="elevated"
                  size="small"
                >
                  {{ stockStatusText }}
                </v-chip>
              </div>
              
              <!-- Discount Badge -->
              <div v-if="discountPercentage > 0" class="position-absolute top-2 right-2">
                <v-chip
                  color="error"
                  variant="elevated"
                  size="small"
                >
                  {{ discountLabel }}
                </v-chip>
              </div>
            </v-img>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="4" class="rounded-3xl pa-6 pa-md-8 sticky top-24">
            <v-card-text>
              <!-- Product Title and Price -->
              <div class="mb-6">
                <h1 class="text-h3 font-weight-bold mb-2">{{ product.nameAr || product.nameEn }}</h1>
                <p class="text-body-1 text-medium-emphasis mb-4">{{ product.descriptionAr || product.descriptionEn }}</p>
                
                <!-- Price with Discount -->
                <div class="mb-4">
                  <div v-if="discountPercentage > 0" class="d-flex align-center gap-2 mb-2">
                    <span class="text-h3 font-weight-black text-warning">
                      {{ formatPrice(priceBreakdown.finalPrice) }}
                    </span>
                    <span class="text-body-2 text-medium-emphasis text-decoration-line-through">
                      {{ formatPrice(priceBreakdown.basePrice) }}
                    </span>
                    <v-chip color="error" variant="elevated" size="small">
                      -{{ discountPercentage }}%
                    </v-chip>
                  </div>
                  <div v-else class="text-h3 font-weight-black text-warning">
                    {{ formatPrice(priceBreakdown.basePrice) }}
                  </div>
                </div>
              </div>

              <!-- Product Tags -->
              <div class="d-flex flex-wrap gap-2 mb-4">
                <v-chip
                  v-for="tag in product.tags"
                  :key="tag"
                  variant="outlined"
                  color="grey-lighten-2"
                  size="small"
                  class="text-none"
                >
                  {{ tag }}
                </v-chip>
              </div>

              <!-- Product Actions -->
              <div class="d-flex gap-3 mb-6">
                <v-btn
                  color="warning"
                  size="large"
                  prepend-icon="mdi-cart-plus"
                  :disabled="!canAddToCartComputed"
                  :loading="loading"
                  @click="addToCart"
                  block
                >
                  {{ canAddToCartComputed ? ($t('addToCart') || 'أضف للسلة') : (stockStatus === 'out_of_stock' ? ($t('outOfStock') || 'نفد المخزون') : ($t('insufficientStock') || 'مخزون غير كافي')) }}
                </v-btn>
                
                <v-btn
                  color="success"
                  size="large"
                  prepend-icon="mdi-whatsapp"
                  :href="`https://wa.me/213663140341?text=${encodeURIComponent(($t('productInquiry') || 'استفسار عن المنتج') + ': ' + (product.nameAr || product.nameEn))}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                >
                  {{ $t('inquire') || 'استفسار' }}
                </v-btn>
              </div>
              
              <!-- Quantity Selector -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ $t('quantity') || 'الكمية' }}</h3>
                <div class="d-flex align-center gap-2">
                  <v-btn
                    icon="mdi-minus"
                    variant="outlined"
                    :disabled="quantity <= 1"
                    @click="decrementQuantity"
                  />
                  <v-text-field
                    v-model="quantity"
                    type="number"
                    min="1"
                    :max="currentStock"
                    variant="outlined"
                    density="compact"
                    class="flex-grow-0"
                    style="width: 80px"
                    hide-details
                  />
                  <v-btn
                    icon="mdi-plus"
                    variant="outlined"
                    :disabled="quantity >= currentStock"
                    @click="incrementQuantity"
                  />
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ $t('availableStock') || 'المخزون المتاح' }}: {{ currentStock }}
                  <span v-if="selectedVariant" class="ms-2">
                    ({{ $t('variant') || 'تنوع' }}: {{ selectedVariant.name }})
                  </span>
                </div>
              </div>

              <!-- Product Details -->
              <div class="product-details mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('productDetails') }}</h3>
                <v-row>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('category') }}</div>
                    <div class="text-body-2">{{ product.category }}</div>
                  </v-col>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('material') }}</div>
                    <div class="text-body-2">
                      <v-chip
                        v-if="selectedMaterial"
                        :color="selectedMaterial.isPremium ? 'warning' : 'primary'"
                        variant="elevated"
                        size="small"
                      >
                        {{ getMaterialName(selectedMaterial) }}
                      </v-chip>
                      <span v-else>{{ $t('selectMaterial') || 'اختر المادة' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('dimensions') }}</div>
                    <div class="text-body-2">{{ product.dimensions }}</div>
                  </v-col>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('weight') }}</div>
                    <div class="text-body-2">{{ product.weight }}</div>
                  </v-col>
                </v-row>
              </div>

              <!-- AI Smart Measurement -->
              <div class="ai-measurement mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('aiSmartMeasurement') }}</h3>
                <v-text-field
                  v-model="referenceDimension"
                  type="number"
                  :label="$t('referenceDimension')"
                  variant="outlined"
                  color="warning"
                  min="10"
                  class="mb-3"
                ></v-text-field>
                <v-file-input
                  accept="image/*"
                  :label="$t('uploadImage')"
                  variant="outlined"
                  color="warning"
                  prepend-icon="mdi-camera"
                  @change="onImageChange"
                  class="mb-3"
                ></v-file-input>
                <v-btn
                  @click="runSmartMeasurement"
                  color="warning"
                  variant="tonal"
                  prepend-icon="mdi-brain"
                  :loading="aiLoading"
                  :disabled="!aiImageFile"
                  block
                >
                  {{ aiLoading ? $t('calculating') : $t('calculateWithAI') }}
                </v-btn>
              </div>

              <!-- AI Results -->
              <div v-if="aiResults" class="ai-results mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('measurementResults') }}</h3>
                <v-alert type="success" variant="tonal">
                  <div class="mb-2">
                    <strong>{{ $t('estimatedArea') }}:</strong> {{ aiResults.area }} m²
                  </div>
                  <div>
                    <strong>{{ $t('estimatedPrice') }}:</strong> {{ formatPrice(aiResults.price) }}
                  </div>
                </v-alert>
              </div>

              <!-- Custom Dimensions Input -->
              <div class="custom-dimensions mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('customDimensions') || 'الأبعاد المخصصة' }}</h3>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="productDimensions.width"
                      type="number"
                      :label="$t('width') || 'العرض (سم)'"
                      variant="outlined"
                      min="10"
                      step="0.1"
                      @update:model-value="onDimensionChange"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="productDimensions.height"
                      type="number"
                      :label="$t('height') || 'الارتفاع (سم)'"
                      variant="outlined"
                      min="10"
                      step="0.1"
                      @update:model-value="onDimensionChange"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ $t('area') || 'المساحة' }}: {{ ((productDimensions.width * productDimensions.height) / 10000).toFixed(2) }} م²
                </div>
              </div>

              <!-- Marble Texture Selection -->
              <div class="texture-selection mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('marbleTexture') || 'نسيج الرخام' }}</h3>
                <v-select
                  v-model="selectedTexture"
                  :items="availableTextures"
                  :label="$t('selectTexture') || 'اختر النسيج'"
                  variant="outlined"
                  clearable
                  item-title="name"
                  item-value="value"
                  prepend-inner-icon="mdi-image-texture"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.name">
                      <template #prepend>
                        <v-icon :color="item.color">{{ item.icon }}</v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>

              <!-- Custom Design Input -->
              <div class="custom-design mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('customDesign') || 'تصميم مخصص' }}</h3>
                <v-textarea
                  v-model="customDesign"
                  :label="$t('designDescription') || 'وصف التصميم المخصص'"
                  variant="outlined"
                  rows="3"
                  counter="500"
                  prepend-inner-icon="mdi-draw"
                  placeholder="صف تصميمك المخصص هنا..."
                ></v-textarea>
              </div>

              <!-- Material Selection -->
              <div class="material-selection mb-6">
                <ProductMaterialSelector
                  v-if="currentProduct && hasAvailableMaterials(currentProduct)"
                  :product="currentProduct"
                  :dimensions="productDimensions"
                  :quantity="quantity"
                  @material-selected="onProductMaterialSelected"
                  @price-change="onProductMaterialPriceChange"
                />
                <MaterialSelector
                  v-else
                  v-model="selectedMaterial"
                  :dimensions="productDimensions"
                  :quantity="quantity"
                  @price-update="onPriceUpdate"
                />
              </div>

              <!-- Variant Selection -->
              <div v-if="currentProduct?.variants?.length > 0" class="variant-selection mb-6">
                <VariantSelector
                  :product="currentProduct"
                  :show-price-comparison="true"
                  @variant-selected="onVariantSelected"
                  @price-change="onVariantPriceChange"
                />
              </div>

              <!-- Shipping Info -->
              <div class="shipping-info mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('shippingInfo') }}</h3>
                <v-row>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('deliveryTime') }}</div>
                    <div class="text-body-2">{{ product.deliveryTime }}</div>
                  </v-col>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('shippingCost') }}</div>
                    <div class="text-body-2">{{ formatPrice(product.shippingCost) }}</div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useProductDetails } from '@/composables/useProductDetails';
import { useMaterials } from '@/composables/useMaterials';
import MaterialSelector from '@/shared/components/MaterialSelector.vue';
import ProductMaterialSelector from '@/shared/components/ProductMaterialSelector.vue';
import VariantSelector from '@/shared/components/VariantSelector.vue';

const route = useRoute();
const router = useRouter();
const store = useStore();
const { t } = useI18n();

// Composables
const { 
  getProductBySlug, 
  selectProduct, 
  isInStock, 
  getStockStatus, 
  getStockStatusText,
  canAddToCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  getMainImage,
  getAllImages,
  formatPrice,
  formatDimensions,
  getDiscountPercentage,
  getDiscountLabel,
  loadRelatedProducts,
  // Product Materials
  getAvailableMaterials,
  hasAvailableMaterials,
  calculateProductMaterialPrice,
  formatMaterialName,
  currentProduct,
  selectedVariant,
  selectedImage,
  quantity,
  priceBreakdown,
  loading: productLoading,
  error: productError
} = useProductDetails();

const { getMaterialName, calculateTotalPrice } = useMaterials();

// Reactive data
const loading = ref(true);
const error = ref(null);
const product = ref(null);
const selectedMaterial = ref(null);
const productDimensions = ref({ width: 100, height: 100 });
const calculatedPrice = ref(0);
const referenceDimension = ref(null);
const aiImageFile = ref(null);
const aiLoading = ref(false);
const aiResults = ref(null);
const selectedTexture = ref(null);
const customDesign = ref('');

// Available marble textures
const availableTextures = ref([
  { name: 'رخام أبيض نقي', value: 'pure_white', icon: 'mdi-circle', color: 'grey-lighten-2' },
  { name: 'رخام أسود كلاسيكي', value: 'classic_black', icon: 'mdi-circle', color: 'black' },
  { name: 'رخام بني دافئ', value: 'warm_brown', icon: 'mdi-circle', color: 'brown-darken-2' },
  { name: 'رخام رمادي عصري', value: 'modern_gray', icon: 'mdi-circle', color: 'grey' },
  { name: 'رخام ذهبي فاخر', value: 'luxury_gold', icon: 'mdi-circle', color: 'amber-darken-2' },
  { name: 'رخام وردي ناعم', value: 'soft_pink', icon: 'mdi-circle', color: 'pink-lighten-2' },
  { name: 'رخام أزرق سماوي', value: 'sky_blue', icon: 'mdi-circle', color: 'blue-lighten-2' },
  { name: 'رخام أخضر طبيعي', value: 'natural_green', icon: 'mdi-circle', color: 'green-darken-1' }
]);

// Computed
const productId = computed(() => route.params.id);
const productSlug = computed(() => route.params.slug || route.params.id);
const finalPrice = computed(() => {
  if (currentProduct.value) {
    return priceBreakdown.value.totalCost;
  }
  return 0;
});

const stockStatus = computed(() => {
  if (currentProduct.value) {
    // Use variant stock if variant is selected, otherwise use product stock
    return getStockStatus(currentProduct.value, selectedVariant.value);
  }
  return 'out_of_stock';
});

const stockStatusText = computed(() => {
  return getStockStatusText(stockStatus.value);
});

const currentStock = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.stock || 0;
  }
  return currentProduct.value?.stock || 0;
});

const canAddToCartComputed = computed(() => {
  return canAddToCart(currentProduct.value, selectedVariant.value, quantity.value);
});

const discountPercentage = computed(() => {
  if (currentProduct.value) {
    return getDiscountPercentage(currentProduct.value);
  }
  return 0;
});

const discountLabel = computed(() => {
  if (currentProduct.value) {
    return getDiscountLabel(currentProduct.value);
  }
  return '';
});

const productImages = computed(() => {
  if (currentProduct.value) {
    return getAllImages(currentProduct.value);
  }
  return [];
});

const mainProductImage = computed(() => {
  if (selectedImage.value) {
    return selectedImage.value;
  }
  if (currentProduct.value) {
    return getMainImage(currentProduct.value);
  }
  return null;
});

// Methods
const fetchProduct = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Use GraphQL composable instead of REST API
    const { result, loading: queryLoading, error: queryError } = getProductBySlug(productSlug.value);
    
    // Wait for the query to complete
    if (queryLoading.value) {
      return;
    }
    
    if (queryError.value) {
      throw new Error(queryError.value.message);
    }
    
    const productsData = result.value?.products?.edges;
    if (productsData && productsData.length > 0) {
      const productData = productsData[0].node;
      
      // Select the product using the composable
      selectProduct(productData);
      product.value = productData;
      
      // Load related products
      if (productData.category?.id) {
        await loadRelatedProducts(productData.category.id, productData.id);
      }
      
      console.log('✅ Product loaded via GraphQL:', product.value);
    } else {
      throw new Error('Product not found');
    }
  } catch (err) {
    console.error('❌ Error fetching product:', err);
    error.value = t('productNotFound') || 'المنتج غير موجود';
  } finally {
    loading.value = false;
  }
};

const onPriceUpdate = (newPrice) => {
  calculatedPrice.value = newPrice;
  console.log('💰 Material price updated:', newPrice);
};

const onDimensionChange = () => {
  // Recalculate price when dimensions change
  if (selectedMaterial.value) {
    onPriceUpdate(calculateTotalPrice(selectedMaterial.value, productDimensions.value, quantity.value));
  }
  
  // Update AI results if they exist
  if (aiResults.value) {
    const area = (productDimensions.value.width * productDimensions.value.height) / 10000;
    const basePrice = currentProduct.value?.basePrice || 0;
    const materialPrice = selectedMaterial.value ? 
      calculateTotalPrice(selectedMaterial.value, productDimensions.value, quantity.value) : 0;
    
    aiResults.value = {
      area: area.toFixed(2),
      price: basePrice + materialPrice
    };
  }
};

const onImageChange = (event) => {
  aiImageFile.value = event.target.files[0];
  aiResults.value = null;
};

const runSmartMeasurement = async () => {
  if (!aiImageFile.value || !referenceDimension.value) return;
  
  aiLoading.value = true;
  aiResults.value = null;
  
  try {
    // Mock AI measurement calculation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const area = (productDimensions.value.width * productDimensions.value.height) / 10000; // Convert to m²
    const basePrice = currentProduct.value?.basePrice || 0;
    const materialPrice = selectedMaterial.value ? 
      calculateTotalPrice(selectedMaterial.value, productDimensions.value, quantity.value) : 0;
    
    aiResults.value = {
      area: area.toFixed(2),
      price: basePrice + materialPrice
    };
    
    console.log('✅ AI measurement completed:', aiResults.value);
  } catch (error) {
    console.error('❌ AI measurement error:', error);
  } finally {
    aiLoading.value = false;
  }
};

const addToCart = async () => {
  if (!canAddToCartComputed.value) {
    console.warn('⚠️ Cannot add to cart: Product not available or insufficient stock');
    return;
  }
  
  try {
    // Use cart store with new OrderItem fields
    const { useCartStore } = await import('@/stores/cart');
    const cartStore = useCartStore();
    
    const options = {
      materialId: selectedMaterial.value?.id || null,
      quantity: quantity.value,
      width: productDimensions.value.width,
      height: productDimensions.value.height,
      dimensionUnit: 'cm',
      marbleTexture: selectedTexture.value || null,
      customDesign: customDesign.value || null,
      variantId: selectedVariant.value?.id || null,
      options: {
        sku: selectedVariant.value?.sku || currentProduct.value.sku || 'N/A',
        variantName: selectedVariant.value?.name || null,
        textureName: availableTextures.value.find(t => t.value === selectedTexture.value)?.name || null
      }
    };
    
    await cartStore.addToCart(currentProduct.value, options);
    
    console.log('✅ Added to cart with OrderItem fields:', {
      product: currentProduct.value.nameAr || currentProduct.value.nameEn,
      dimensions: productDimensions.value,
      texture: selectedTexture.value,
      customDesign: customDesign.value,
      material: selectedMaterial.value?.nameAr || selectedMaterial.value?.nameEn,
      quantity: quantity.value
    });
    
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: t('addToCartError') || 'فشلت إضافة المنتج للسلة',
      icon: 'mdi-alert-circle',
      timeout: 5000
    });
  }
};

const selectProductImage = (image) => {
  if (image) {
    selectedImage.value = image;
    console.log('✅ Product image selected:', image);
  }
};

const onVariantSelected = (variant) => {
  console.log('✅ Variant selected in ProductDetail:', variant);
  // Variant selection is handled by useProductDetails composable
};

const onVariantPriceChange = (newPrice) => {
  console.log('💰 Variant price changed:', newPrice);
  // Price breakdown is automatically updated by useProductDetails composable
};

const onProductMaterialSelected = (material) => {
  console.log('✅ Product material selected:', material);
  selectedMaterial.value = material;
  
  // Update price breakdown with material cost
  const materialCost = calculateProductMaterialPrice(
    currentProduct.value,
    material,
    productDimensions.value,
    quantity.value
  );
  updatePriceBreakdown(materialCost);
};

const onProductMaterialPriceChange = (materialCost) => {
  console.log('💰 Product material price changed:', materialCost);
  updatePriceBreakdown(materialCost);
};

// Watchers
watch(() => currentProduct.value, (newProduct) => {
  if (newProduct) {
    product.value = newProduct;
  }
});

watch(() => productDimensions.value, () => {
  if (selectedMaterial.value) {
    onPriceUpdate(calculateTotalPrice(selectedMaterial.value, productDimensions.value, quantity.value));
  }
}, { deep: true });

watch(() => quantity.value, () => {
  if (selectedMaterial.value) {
    onPriceUpdate(calculateTotalPrice(selectedMaterial.value, productDimensions.value, quantity.value));
  }
});

// Initialize
onMounted(() => {
  fetchProduct();
});
</script>

<style scoped>
.product-detail {
  background: var(--bg-surface);
  min-height: 100vh;
}

.sticky {
  position: sticky;
  top: 24px;
}

.ai-measurement,
.ai-results,
.shipping-info {
  background: var(--bg-deep);
  border-radius: 12px;
  padding: 1.5rem;
}

.ai-results .v-alert {
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 960px) {
  .sticky {
    position: static;
    top: 0;
  }
}
</style>
