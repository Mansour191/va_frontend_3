/**
 * Organization Pinia Store
 * Centralized state management for organization data and social links
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGraphQL } from '@/shared/composables/useGraphQL'

export const useOrganizationStore = defineStore('organization', () => {
  // State
  const organization = ref(null)
  const socialLinks = ref([])
  const paymentMethods = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetched = ref(null)

  // Getters
  const isLoaded = computed(() => !!organization.value)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Get organization name based on current language
  const organizationName = computed(() => {
    if (!organization.value) return 'VinylArt'
    
    const locale = localStorage.getItem('locale') || 'ar'
    return locale === 'en' 
      ? organization.value.name_en || organization.value.name_ar
      : organization.value.name_ar || organization.value.name_en
  })

  // Get organization slogan based on current language
  const organizationSlogan = computed(() => {
    if (!organization.value) return ''
    
    const locale = localStorage.getItem('locale') || 'ar'
    return locale === 'en'
      ? organization.value.slogan_en || organization.value.slogan_ar
      : organization.value.slogan_ar || organization.value.slogan_en
  })

  // Get organization about text based on current language
  const organizationAbout = computed(() => {
    if (!organization.value) return ''
    
    const locale = localStorage.getItem('locale') || 'ar'
    return locale === 'en'
      ? organization.value.about_en || organization.value.about_ar
      : organization.value.about_ar || organization.value.about_en
  })

  // Get contact information
  const contactInfo = computed(() => {
    if (!organization.value) return {}
    
    return {
      email: organization.value.contact_email || 'info@vinylart.dz',
      phone1: organization.value.phone_1 || '0663140341',
      phone2: organization.value.phone_2,
      address: organization.value.address || '',
      taxNumber: organization.value.tax_number || '',
      mapsUrl: organization.value.maps_url || '',
      coordinates: {
        latitude: organization.value.latitude,
        longitude: organization.value.longitude
      }
    }
  })

  // Get public social links
  const publicSocialLinks = computed(() => {
    return socialLinks.value.filter(link => link.is_active && link.platform_type === 'public')
  })

  // Get active payment methods for customers
  const activePaymentMethods = computed(() => {
    return paymentMethods.value.filter(method => method.is_active).sort((a, b) => a.order_index - b.order_index)
  })

  // Actions
  const fetchOrganization = async (forceRefresh = false) => {
    // Check if we have recent data (5 minutes cache)
    const now = Date.now()
    const cacheTime = 5 * 60 * 1000 // 5 minutes
    
    if (!forceRefresh && 
        organization.value && 
        lastFetched.value && 
        (now - lastFetched.value) < cacheTime) {
      console.log('🏢 Using cached organization data')
      return organization.value
    }
    
    loading.value = true
    error.value = null
    
    try {
      console.log('🏢 Fetching organization data...')
      
      const { executeQuery } = useGraphQL()
      
      const query = `
        query GetOrganization {
          organization {
            id
            name_ar
            name_en
            slogan_ar
            slogan_en
            about_ar
            about_en
            contact_email
            phone_1
            phone_2
            address
            tax_number
            latitude
            longitude
            google_place_id
            maps_url
            logo
            is_active
            created_at
            updated_at
            social_links {
              id
              platform_name
              platform_type
              url
              icon_class
              fa_icon_class
              platform_display_name
              order_index
              is_active
            }
          }
        }
      `
      
      const response = await executeQuery(query)
      
      if (response?.data?.organization) {
        organization.value = response.data.organization
        socialLinks.value = response.data.organization.social_links || []
        lastFetched.value = now
        
        console.log('✅ Organization data loaded:', response.data.organization)
        return response.data.organization
      } else {
        throw new Error('No organization data received')
      }
      
    } catch (err) {
      console.error('❌ Error fetching organization data:', err)
      error.value = err.message || 'Failed to load organization data'
      
      // Return fallback data if available
      if (organization.value) {
        console.log('🔄 Using cached data as fallback')
        return organization.value
      }
      
      return null
    } finally {
      loading.value = false
    }
  }

  const updateOrganization = async (organizationData) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('🏢 Updating organization data...')
      
      const { executeMutation } = useGraphQL()
      
      const mutation = `
        mutation UpdateOrganization($input: UpdateOrganizationInput!) {
          updateOrganization(input: $input) {
            success
            message
            organization {
              id
              name_ar
              name_en
              slogan_ar
              slogan_en
              about_ar
              about_en
              contact_email
              phone_1
              phone_2
              address
              tax_number
              latitude
              longitude
              google_place_id
              maps_url
              logo
              is_active
              updated_at
            }
          }
        }
      `
      
      const variables = {
        input: {
          id: organizationData.id,
          ...organizationData
        }
      }
      
      const response = await executeMutation(mutation, variables)
      
      if (response?.data?.updateOrganization?.success) {
        // Update store with new data
        organization.value = {
          ...organization.value,
          ...response.data.updateOrganization.organization
        }
        lastFetched.value = Date.now()
        
        console.log('✅ Organization data updated successfully')
        return {
          success: true,
          message: response.data.updateOrganization.message,
          organization: response.data.updateOrganization.organization
        }
      } else {
        throw new Error(response?.data?.updateOrganization?.message || 'Update failed')
      }
      
    } catch (err) {
      console.error('❌ Error updating organization data:', err)
      error.value = err.message || 'Failed to update organization data'
      
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  const refreshOrganization = () => {
    return fetchOrganization(true)
  }

  const clearOrganization = () => {
    organization.value = null
    socialLinks.value = []
    paymentMethods.value = []
    error.value = null
    lastFetched.value = null
  }

  const fetchPaymentMethods = async (forceRefresh = false) => {
    // Check if we have recent data (5 minutes cache)
    const now = Date.now()
    const cacheTime = 5 * 60 * 1000 // 5 minutes
    
    if (!forceRefresh && 
        paymentMethods.value.length > 0 && 
        lastFetched.value && 
        (now - lastFetched.value) < cacheTime) {
      console.log('💳 Using cached payment methods data')
      return paymentMethods.value
    }
    
    loading.value = true
    error.value = null
    
    try {
      console.log('💳 Fetching payment methods...')
      
      const { executeQuery } = useGraphQL()
      
      const query = `
        query GetActivePaymentMethods {
          activePaymentMethods {
            id
            name_ar
            name_en
            name
            payment_type
            gateway_provider
            account_name
            account_number
            iban
            instructions_ar
            instructions_en
            instructions
            icon
            logo
            display_icon
            order_index
            is_active
            is_default
            max_amount
            fee_percentage
            fee_fixed
            safe_account_number
            fees_for_amount
            is_available_for_amount
          }
        }
      `
      
      const response = await executeQuery(query)
      
      if (response?.data?.activePaymentMethods) {
        paymentMethods.value = response.data.activePaymentMethods || []
        lastFetched.value = now
        
        console.log('✅ Payment methods loaded:', response.data.activePaymentMethods)
        return response.data.activePaymentMethods
      } else {
        throw new Error('No payment methods data received')
      }
      
    } catch (err) {
      console.error('❌ Error fetching payment methods:', err)
      error.value = err.message || 'Failed to load payment methods'
      
      // Return fallback data if available
      if (paymentMethods.value.length > 0) {
        console.log('🔄 Using cached payment methods data as fallback')
        return paymentMethods.value
      }
      
      return []
    } finally {
      loading.value = false
    }
  }

  const initialize = async () => {
    if (!organization.value) {
      await fetchOrganization()
    }
  }

  // Social Links Management
  const addSocialLink = async (socialLinkData) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('🔗 Adding social link...')
      
      const { executeMutation } = useGraphQL()
      
      const mutation = `
        mutation CreateSocialLink($input: CreateSocialLinkInput!) {
          createSocialLink(input: $input) {
            success
            message
            socialLink {
              id
              platform_name
              platform_type
              url
              icon_class
              order_index
              is_active
              platform_display_name
              fa_icon_class
            }
          }
        }
      `
      
      const variables = {
        input: socialLinkData
      }
      
      const response = await executeMutation(mutation, variables)
      
      if (response?.data?.createSocialLink?.success) {
        // Refresh organization data to get updated social links
        await refreshOrganization()
        
        console.log('✅ Social link added successfully')
        return {
          success: true,
          message: response.data.createSocialLink.message,
          socialLink: response.data.createSocialLink.socialLink
        }
      } else {
        throw new Error(response?.data?.createSocialLink?.message || 'Failed to add social link')
      }
      
    } catch (err) {
      console.error('❌ Error adding social link:', err)
      error.value = err.message || 'Failed to add social link'
      
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  const updateSocialLink = async (socialLinkData) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('🔗 Updating social link...')
      
      const { executeMutation } = useGraphQL()
      
      const mutation = `
        mutation UpdateSocialLink($input: UpdateSocialLinkInput!) {
          updateSocialLink(input: $input) {
            success
            message
            socialLink {
              id
              platform_name
              platform_type
              url
              icon_class
              order_index
              is_active
              platform_display_name
              fa_icon_class
            }
          }
        }
      `
      
      const variables = {
        input: socialLinkData
      }
      
      const response = await executeMutation(mutation, variables)
      
      if (response?.data?.updateSocialLink?.success) {
        // Refresh organization data to get updated social links
        await refreshOrganization()
        
        console.log('✅ Social link updated successfully')
        return {
          success: true,
          message: response.data.updateSocialLink.message,
          socialLink: response.data.updateSocialLink.socialLink
        }
      } else {
        throw new Error(response?.data?.updateSocialLink?.message || 'Failed to update social link')
      }
      
    } catch (err) {
      console.error('❌ Error updating social link:', err)
      error.value = err.message || 'Failed to update social link'
      
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  const deleteSocialLink = async (socialLinkId) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('🔗 Deleting social link...')
      
      const { executeMutation } = useGraphQL()
      
      const mutation = `
        mutation DeleteSocialLink($id: ID!) {
          deleteSocialLink(id: $id) {
            success
            message
          }
        }
      `
      
      const variables = { id: socialLinkId }
      
      const response = await executeMutation(mutation, variables)
      
      if (response?.data?.deleteSocialLink?.success) {
        // Refresh organization data to get updated social links
        await refreshOrganization()
        
        console.log('✅ Social link deleted successfully')
        return {
          success: true,
          message: response.data.deleteSocialLink.message
        }
      } else {
        throw new Error(response?.data?.deleteSocialLink?.message || 'Failed to delete social link')
      }
      
    } catch (err) {
      console.error('❌ Error deleting social link:', err)
      error.value = err.message || 'Failed to delete social link'
      
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Return store interface
  return {
    // State
    organization,
    socialLinks,
    paymentMethods,
    loading,
    error,
    lastFetched,
    
    // Getters
    isLoaded,
    isLoading,
    hasError,
    organizationName,
    organizationSlogan,
    organizationAbout,
    contactInfo,
    publicSocialLinks,
    activePaymentMethods,
    
    // Actions
    fetchOrganization,
    updateOrganization,
    refreshOrganization,
    clearOrganization,
    initialize,
    fetchPaymentMethods,
    
    // Social Links Actions
    addSocialLink,
    updateSocialLink,
    deleteSocialLink
  }
})
