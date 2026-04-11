/**
 * Application Configuration Composable
 * Manages organization data and social links using Pinia store
 */

import { computed } from 'vue'
import { useOrganizationStore } from '@/stores/organization'

export function useAppConfig() {
  const organizationStore = useOrganizationStore()
  
  // Direct mapping to store properties
  const organization = computed(() => organizationStore.organization)
  const socialLinks = computed(() => organizationStore.socialLinks)
  const loading = computed(() => organizationStore.loading)
  const error = computed(() => organizationStore.error)
  const isLoaded = computed(() => organizationStore.isLoaded)
  const isLoading = computed(() => organizationStore.isLoading)
  
  // Computed properties from store
  const organizationName = computed(() => organizationStore.organizationName)
  const organizationSlogan = computed(() => organizationStore.organizationSlogan)
  const organizationAbout = computed(() => organizationStore.organizationAbout)
  const contactInfo = computed(() => organizationStore.contactInfo)
  const publicSocialLinks = computed(() => organizationStore.publicSocialLinks)
  const activePaymentMethods = computed(() => organizationStore.activePaymentMethods)
  
  // Actions from store
  const fetchOrganization = organizationStore.fetchOrganization
  const updateOrganization = organizationStore.updateOrganization
  const refreshOrganization = organizationStore.refreshOrganization
  const initialize = organizationStore.initialize
  const fetchPaymentMethods = organizationStore.fetchPaymentMethods
  
  // Social Links Actions
  const addSocialLink = organizationStore.addSocialLink
  const updateSocialLink = organizationStore.updateSocialLink
  const deleteSocialLink = organizationStore.deleteSocialLink
  
  return {
    // State
    organization,
    socialLinks,
    loading,
    error,
    isLoaded,
    isLoading,
    
    // Computed properties
    organizationName,
    organizationSlogan,
    organizationAbout,
    contactInfo,
    publicSocialLinks,
    activePaymentMethods,
    
    // Methods
    fetchOrganization,
    updateOrganization,
    refreshOrganization,
    initialize,
    fetchPaymentMethods,
    
    // Social Links Methods
    addSocialLink,
    updateSocialLink,
    deleteSocialLink
  }
}

// Export singleton instance for global use (backward compatibility)
export const appConfig = useAppConfig()
