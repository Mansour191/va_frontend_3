/**
 * Centralized Cart Store (Pinia)
 * This store manages all cart state and operations using GraphQL
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vuetify'
import { useMutation, useQuery } from '@vue/apollo-composable'
import {
  GET_MY_CART_QUERY,
  GET_CART_SUMMARY_QUERY,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_QUANTITY_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  CLEAR_CART_MUTATION,
  APPLY_COUPON_MUTATION,
  REMOVE_COUPON_MUTATION,
  SET_SHIPPING_MUTATION,
  CART_UPDATE_SUBSCRIPTION
} from '@/integration/graphql/cart.graphql'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])
  const isLoading = ref(false)
  const isUpdating = ref(false)
  const sessionId = ref(null)
  const lastFetched = ref(null)
  
  // Shipping state
  const selectedWilaya = ref(null)
  const deliveryType = ref('home')
  const shippingCost = ref(0)
  
  // Coupon state
  const appliedCoupon = ref(null)
  const couponDiscount = ref(0)
  
  // Toast system
  const toast = useToast()

  // Computed properties
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => {
      return total + (item.subtotal || 0)
    }, 0)
  })

  const discountTotal = computed(() => {
    return items.value.reduce((total, item) => {
      return total + (item.discountAmount || 0) + (item.couponDiscount || 0)
    }, 0)
  })

  const totalBeforeShipping = computed(() => {
    return Math.max(0, subtotal.value - discountTotal.value)
  })

  const total = computed(() => {
    return totalBeforeShipping.value + shippingCost.value
  })

  const isEmpty = computed(() => {
    return items.value.length === 0
  })

  const availableItems = computed(() => {
    return items.value.filter(item => item.isAvailable)
  })

  const unavailableItems = computed(() => {
    return items.value.filter(item => !item.isAvailable)
  })

  // Actions
  async function fetchCart() {
    if (isLoading.value) return

    isLoading.value = true
    
    try {
      const query = `
        query {
          myCart {
            id
            quantity
            options
            createdAt
            updatedAt
            product {
              id
              nameAr
              nameEn
              basePrice
              stock
              isActive
              images {
                id
                imageUrl
                isMain
              }
            }
            material {
              id
              nameAr
              nameEn
              pricePerM2
            }
            productDetails
            subtotal
            totalWithDiscount
            finalTotal
            isAvailable
            maxQuantity
            currentUnitPrice
            currentMaterialPrice
            priceChanged
            weight
            dimensions
          }
        }
      `

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      })

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      items.value = result.data.myCart || []
      lastFetched.value = Date.now()
      saveToStorage()
    } catch (error) {
      console.error('Error fetching cart:', error)
      // Fallback to localStorage
      loadFromStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function addToCart(product, options = {}) {
    if (isUpdating.value) return

    isUpdating.value = true

    try {
      const mutation = `
        mutation AddToCart($input: CartItemInput!) {
          addToCart(input: $input) {
            success
            message
            cartItem {
              id
              quantity
              options
              createdAt
              updatedAt
              product {
                id
                nameAr
                nameEn
                basePrice
                stock
                isActive
                images {
                  id
                  imageUrl
                  isMain
                }
              }
              material {
                id
                nameAr
                nameEn
                pricePerM2
              }
              productDetails
              subtotal
              totalWithDiscount
              finalTotal
              isAvailable
              maxQuantity
              currentUnitPrice
              currentMaterialPrice
              priceChanged
              weight
              dimensions
            }
            cartSummary
          }
        }
      `

      // Prepare options JSON with dimensions if provided
      const optionsData = {}
      if (options.width) optionsData.width = options.width
      if (options.height) optionsData.height = options.height
      if (options.dimensionUnit) optionsData.dimensionUnit = options.dimensionUnit
      if (options.options) Object.assign(optionsData, options.options)

      const variables = {
        input: {
          productId: product.id,
          materialId: options.materialId || null,
          quantity: options.quantity || 1,
          options: JSON.stringify(optionsData)
        }
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      const { addToCart } = result.data
      
      if (addToCart.success) {
        // Update cart summary
        if (addToCart.cartSummary) {
          updateCartSummary(JSON.parse(addToCart.cartSummary))
        }
        
        // Show success toast
        toast({
          title: '× Done',
          text: addToCart.message,
          color: 'success',
          timeout: 3000
        })
        
        // Refresh cart
        await fetchCart()
        
        return addToCart.cartItem
      } else {
        throw new Error(addToCart.message)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      
      // Show error toast
      toast({
        title: '× Error',
        text: error.message || 'Failed to add product to cart',
        color: 'error',
        timeout: 5000
      })
    } finally {
      isUpdating.value = false
    }
  }

  async function updateQuantity(itemId, quantity) {
    if (isUpdating.value) return

    isUpdating.value = true

    try {
      const mutation = `
        mutation UpdateCartQuantity($input: UpdateCartInput!) {
          updateCartQuantity(input: $input) {
            success
            message
            cartItem {
              id
              quantity
              subtotal
              totalWithDiscount
              finalTotal
              isAvailable
            }
            cartSummary
          }
        }
      `

      const variables = {
        input: {
          cartItemId: itemId,
          quantity: quantity
        }
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      const { updateCartQuantity } = result.data
      
      if (updateCartQuantity.success) {
        // Update cart summary
        if (updateCartQuantity.cartSummary) {
          updateCartSummary(JSON.parse(updateCartQuantity.cartSummary))
        }
        
        // Show success toast
        toast({
          title: '✅ تحديث السلة',
          text: updateCartQuantity.message,
          color: 'success',
          timeout: 2000
        })
        
        // Refresh cart
        await fetchCart()
      } else {
        throw new Error(updateCartQuantity.message)
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error)
      
      // Show error toast
      toast({
        title: '❌ خطأ',
        text: error.message || 'فشل تحديث الكمية',
        color: 'error',
        timeout: 5000
      })
    } finally {
      isUpdating.value = false
    }
  }

  async function removeFromCart(itemId) {
    if (isUpdating.value) return

    isUpdating.value = true

    try {
      const mutation = `
        mutation RemoveFromCart($cartItemId: Int!) {
          removeFromCart(cartItemId: $cartItemId) {
            success
            message
            cartSummary
          }
        }
      `

      const variables = {
        cartItemId: itemId
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      const { removeFromCart } = result.data
      
      if (removeFromCart.success) {
        // Update cart summary
        if (removeFromCart.cartSummary) {
          updateCartSummary(JSON.parse(removeFromCart.cartSummary))
        }
        
        // Show success toast
        toast({
          title: '✨ تم الحذف',
          text: removeFromCart.message,
          color: 'success',
          timeout: 2000
        })
        
        // Refresh cart
        await fetchCart()
      } else {
        throw new Error(removeFromCart.message)
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      
      // Show error toast
      toast({
        title: '❌ خطأ',
        text: error.message || 'فشل حذف المنتج',
        color: 'error',
        timeout: 5000
      })
    } finally {
      isUpdating.value = false
    }
  }

  async function applyCoupon(couponCode) {
    if (isUpdating.value) return

    isUpdating.value = true

    try {
      const mutation = `
        mutation ApplyCoupon($input: ApplyCouponInput!) {
          applyCoupon(input: $input) {
            success
            message
            cartSummary
          }
        }
      `

      const variables = {
        input: {
          couponCode: couponCode
        }
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      const { applyCoupon } = result.data
      
      if (applyCoupon.success) {
        // Update cart summary
        if (applyCoupon.cartSummary) {
          const summary = JSON.parse(applyCoupon.cartSummary)
          updateCartSummary(summary)
          couponDiscount.value = summary.discountTotal
        }
        
        // Show success toast
        toast({
          title: '🎫 تطبيق الكوبون',
          text: applyCoupon.message,
          color: 'success',
          timeout: 3000
        })
      } else {
        throw new Error(applyCoupon.message)
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      
      // Show error toast
      toast({
        title: '❌ خطأ في الكوبون',
        text: error.message || 'فشل تطبيق الكوبون',
        color: 'error',
        timeout: 5000
      })
    } finally {
      isUpdating.value = false
    }
  }

  async function setShipping(wilaya, type = 'home') {
    if (isUpdating.value) return

    isUpdating.value = true

    try {
      const mutation = `
        mutation SetShipping($input: SetShippingInput!) {
          setShipping(input: $input) {
            success
            message
            cartSummary
          }
        }
      `

      const variables = {
        input: {
          wilayaId: wilaya.wilayaId,
          deliveryType: type
        }
      }

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      const { setShipping } = result.data
      
      if (setShipping.success) {
        // Update cart summary
        if (setShipping.cartSummary) {
          const summary = JSON.parse(setShipping.cartSummary)
          updateCartSummary(summary)
          shippingCost.value = summary.shippingCost
        }
        
        selectedWilaya.value = wilaya
        deliveryType.value = type
        
        // Show success toast
        toast({
          title: '🚚 تحديث الشحن',
          text: setShipping.message,
          color: 'success',
          timeout: 2000
        })
      } else {
        throw new Error(setShipping.message)
      }
    } catch (error) {
      console.error('Error setting shipping:', error)
      
      // Show error toast
      toast({
        title: '❌ خطأ في الشحن',
        text: error.message || 'فشل تحديث معلومات الشحن',
        color: 'error',
        timeout: 5000
      })
    } finally {
      isUpdating.value = false
    }
  }

  async function clearCart() {
    if (isUpdating.value) return

    isUpdating.value = true

    try {
      const { mutate, onDone, onError } = useMutation(CLEAR_CART_MUTATION)
      
      await new Promise((resolve, reject) => {
        mutate()

        onDone((response) => {
          const { clearCart } = response.data
          
          if (clearCart.success) {
            items.value = []
            selectedWilaya.value = null
            shippingCost.value = 0
            appliedCoupon.value = null
            couponDiscount.value = 0
            saveToStorage()
            
            toast({
              title: 'Clear Cart',
              text: clearCart.message || 'Cart cleared successfully',
              color: 'success',
              timeout: 2000
            })
            
            resolve(response)
          } else {
            reject(new Error(clearCart.message))
          }
        })

        onError((error) => {
          reject(error)
        })
      })
    } catch (error) {
      console.error('Error clearing cart:', error)
      
      toast({
        title: 'Error',
        text: error.message || 'Failed to clear cart',
        color: 'error',
        timeout: 5000
      })
    } finally {
      isUpdating.value = false
    }
  }

  function updateCartSummary(summary) {
    // Update local items based on summary
    // This would typically be handled by fetching the cart again
    // But we can update computed values here if needed
  }

  function saveToStorage() {
    try {
      const data = {
        items: items.value,
        selectedWilaya: selectedWilaya.value,
        deliveryType: deliveryType.value,
        shippingCost: shippingCost.value,
        appliedCoupon: appliedCoupon.value,
        couponDiscount: couponDiscount.value,
        lastFetched: lastFetched.value
      }
      localStorage.setItem('cart_store', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving cart to storage:', error)
    }
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('cart_store')
      if (stored) {
        const data = JSON.parse(stored)
        items.value = data.items || []
        selectedWilaya.value = data.selectedWilaya || null
        deliveryType.value = data.deliveryType || 'home'
        shippingCost.value = data.shippingCost || 0
        appliedCoupon.value = data.appliedCoupon || null
        couponDiscount.value = data.couponDiscount || 0
        lastFetched.value = data.lastFetched || null
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error)
    }
  }

  function getAuthToken() {
    return localStorage.getItem('token') || ''
  }

  function initialize() {
    loadFromStorage()
    fetchCart()
  }

  function cleanup() {
    saveToStorage()
  }

  return {
    // State
    items,
    isLoading,
    isUpdating,
    sessionId,
    lastFetched,
    selectedWilaya,
    deliveryType,
    shippingCost,
    appliedCoupon,
    couponDiscount,
    
    // Computed
    totalItems,
    subtotal,
    discountTotal,
    totalBeforeShipping,
    total,
    isEmpty,
    availableItems,
    unavailableItems,
    
    // Actions
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    setShipping,
    clearCart,
    initialize,
    cleanup
  }
})
