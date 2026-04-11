/**
 * Shipping Store (Pinia)
 * This store manages shipping data and calculations using GraphQL
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ACTIVE_SHIPPING_QUERY, ALL_SHIPPING_QUERY, SHIPPING_QUERY, SHIPPING_BY_WILAYA_QUERY } from '@/integration/graphql/shipping'
import { useApolloClient } from '@vue/apollo-composable'

export const useShippingStore = defineStore('shipping', () => {
  // State
  const wilayas = ref([])
  const isLoading = ref(false)
  const lastFetched = ref(null)
  const baseCity = ref(null)
  const apollo = useApolloClient()
  
  // Computed properties
  const activeWilayas = computed(() => {
    return wilayas.value.filter(wilaya => wilaya.isActive)
  })

  const wilayasByCode = computed(() => {
    const result = {}
    wilayas.value.forEach(wilaya => {
      result[wilaya.wilayaId] = wilaya
    })
    return result
  })

  const wilayasById = computed(() => {
    const result = {}
    wilayas.value.forEach(wilaya => {
      result[wilaya.id] = wilaya
    })
    return result
  })

  const northernWilayas = computed(() => {
    // Northern Algeria (codes 1-18)
    return wilayas.value.filter(wilaya => {
      const code = parseInt(wilaya.wilayaId)
      return code >= 1 && code <= 18
    })
  })

  const southernWilayas = computed(() => {
    // Southern Algeria (codes 19-58)
    return wilayas.value.filter(wilaya => {
      const code = parseInt(wilaya.wilayaId)
      return code >= 19 && code <= 58
    })
  })

  const averageHomeDeliveryPrice = computed(() => {
    const active = activeWilayas.value
    if (active.length === 0) return 0
    const total = active.reduce((sum, wilaya) => sum + parseFloat(wilaya.homeDeliveryPrice), 0)
    return total / active.length
  })

  const averageStopDeskPrice = computed(() => {
    const active = activeWilayas.value
    if (active.length === 0) return 0
    const total = active.reduce((sum, wilaya) => sum + parseFloat(wilaya.stopDeskPrice), 0)
    return total / active.length
  })

  // Actions
  async function fetchWilayas() {
    if (isLoading.value) return

    isLoading.value = true

    try {
      const { data } = await apollo.query({
        query: ACTIVE_SHIPPING_QUERY,
        fetchPolicy: 'network-first'
      })

      if (data?.activeShipping?.edges) {
        wilayas.value = data.activeShipping.edges.map(edge => edge.node)
        lastFetched.value = Date.now()
        saveToStorage()
      }
    } catch (error) {
      console.error('Error fetching wilayas:', error)
      // Fallback to localStorage
      loadFromStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAllWilayas() {
    if (isLoading.value) return

    isLoading.value = true

    try {
      const { data } = await apollo.query({
        query: ALL_SHIPPING_QUERY,
        fetchPolicy: 'network-first'
      })

      if (data?.allShipping?.edges) {
        wilayas.value = data.allShipping.edges.map(edge => edge.node)
        lastFetched.value = Date.now()
        saveToStorage()
      }
    } catch (error) {
      console.error('Error fetching all wilayas:', error)
      // Fallback to localStorage
      loadFromStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchWilaya(wilayaId) {
    try {
      const { data } = await apollo.query({
        query: SHIPPING_QUERY,
        variables: { id: wilayaId },
        fetchPolicy: 'network-first'
      })

      if (data?.shipping) {
        // Update in local array
        const index = wilayas.value.findIndex(w => w.id === wilayaId)
        if (index !== -1) {
          wilayas.value[index] = data.shipping
          saveToStorage()
        } else {
          wilayas.value.push(data.shipping)
          saveToStorage()
        }
        
        return data.shipping
      }
    } catch (error) {
      console.error('Error fetching wilaya:', error)
      return null
    }
  }

  async function fetchWilayaByCode(wilayaCode) {
    try {
      const { data } = await apollo.query({
        query: SHIPPING_BY_WILAYA_QUERY,
        variables: { wilayaId: wilayaCode },
        fetchPolicy: 'network-first'
      })

      if (data?.allShipping?.edges && data.allShipping.edges.length > 0) {
        const wilaya = data.allShipping.edges[0].node
        
        // Update in local array
        const index = wilayas.value.findIndex(w => w.id === wilaya.id)
        if (index !== -1) {
          wilayas.value[index] = wilaya
        } else {
          wilayas.value.push(wilaya)
        }
        saveToStorage()
        
        return wilaya
      }
    } catch (error) {
      console.error('Error fetching wilaya by code:', error)
      return null
    }
  }

  function getWilayaByCode(code) {
    return wilayas.value.find(wilaya => wilaya.wilayaId === code) || null
  }

  function getWilayaById(id) {
    return wilayas.value.find(wilaya => wilaya.id === id) || null
  }

  function calculateShippingCost(wilayaId, serviceType = 'home') {
    const wilaya = getWilayaByCode(wilayaId)
    if (!wilaya || !wilaya.isActive) return 0

    let basePrice = 0
    if (serviceType === 'home') {
      basePrice = parseFloat(wilaya.homeDeliveryPrice)
    } else if (serviceType === 'stop_desk') {
      basePrice = parseFloat(wilaya.stopDeskPrice)
    }

    return basePrice
  }

  function calculateDeliveryTime(wilayaId, serviceType = 'home') {
    const wilaya = getWilayaByCode(wilayaId)
    if (!wilaya || !wilaya.isActive) return null

    // Basic delivery time estimation based on region
    const code = parseInt(wilayaId)
    if (code <= 18) {
      // Northern Algeria - faster delivery
      return serviceType === 'home' ? 2 : 1
    } else {
      // Southern Algeria - slower delivery
      return serviceType === 'home' ? 4 : 2
    }
  }

  function isFreeShippingEligible(wilayaId, orderTotal) {
    // For now, no free shipping threshold is implemented
    // This can be enhanced later with business logic
    return false
  }

  function getAvailableShippingMethods(wilayaId) {
    const wilaya = getWilayaByCode(wilayaId)
    if (!wilaya || !wilaya.isActive) return []

    // Return basic shipping options
    return [
      {
        id: 'home_delivery',
        name: 'Home Delivery',
        serviceType: 'home',
        price: parseFloat(wilaya.homeDeliveryPrice),
        estimatedTime: calculateDeliveryTime(wilayaId, 'home'),
        available: true
      },
      {
        id: 'stop_desk',
        name: 'Stop Desk',
        serviceType: 'stop_desk',
        price: parseFloat(wilaya.stopDeskPrice),
        estimatedTime: calculateDeliveryTime(wilayaId, 'stop_desk'),
        available: true
      }
    ]
  }

  function getWilayasByRegion(region) {
    return wilayas.value.filter(wilaya => 
      wilaya.regions && Array.isArray(wilaya.regions) && wilaya.regions.includes(region)
    )
  }

  function searchWilayas(query) {
    if (!query) return wilayas.value

    const searchTerm = query.toLowerCase()
    return wilayas.value.filter(wilaya => 
      wilaya.nameAr.toLowerCase().includes(searchTerm) ||
      wilaya.nameFr.toLowerCase().includes(searchTerm) ||
      wilaya.wilayaId.toLowerCase().includes(searchTerm)
    )
  }

  function setBaseCity(city) {
    baseCity.value = city
    saveToStorage()
  }

  function saveToStorage() {
    try {
      const data = {
        wilayas: wilayas.value,
        lastFetched: lastFetched.value,
        baseCity: baseCity.value
      }
      localStorage.setItem('shipping_store', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving shipping data to storage:', error)
    }
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('shipping_store')
      if (stored) {
        const data = JSON.parse(stored)
        wilayas.value = data.wilayas || []
        lastFetched.value = data.lastFetched || null
        baseCity.value = data.baseCity || null
      }
    } catch (error) {
      console.error('Error loading shipping data from storage:', error)
    }
  }

  function initialize() {
    loadFromStorage()
    
    // Fetch fresh data if needed (older than 1 hour)
    if (!lastFetched.value || Date.now() - lastFetched.value > 3600000) {
      fetchWilayas()
    }
  }

  function cleanup() {
    saveToStorage()
  }

  return {
    // State
    wilayas,
    isLoading,
    lastFetched,
    baseCity,
    
    // Computed
    activeWilayas,
    wilayasByCode,
    wilayasById,
    northernWilayas,
    southernWilayas,
    averageHomeDeliveryPrice,
    averageStopDeskPrice,
    
    // Actions
    fetchWilayas,
    fetchAllWilayas,
    fetchWilaya,
    fetchWilayaByCode,
    getWilayaByCode,
    getWilayaById,
    calculateShippingCost,
    calculateDeliveryTime,
    isFreeShippingEligible,
    getAvailableShippingMethods,
    getWilayasByRegion,
    searchWilayas,
    setBaseCity,
    initialize,
    cleanup
  }
})
