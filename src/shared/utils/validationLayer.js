// Lightweight Client-Side Validation Layer for GraphQL Mutations
export class ValidationLayer {
  static validateAddress(input) {
    const errors = []
    
    // Required fields validation
    if (!input.firstName || input.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters')
    }
    
    if (!input.lastName || input.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters')
    }
    
    if (!input.address || input.address.trim().length < 5) {
      errors.push('Address must be at least 5 characters')
    }
    
    if (!input.wilayaId) {
      errors.push('Wilaya is required')
    }
    
    if (!input.communeId) {
      errors.push('Commune is required')
    }
    
    if (!input.phone || input.phone.trim().length < 10) {
      errors.push('Phone number must be at least 10 digits')
    }
    
    // Phone format validation (Algerian phone numbers)
    const phoneRegex = /^(0|00213)[5-7][0-9]{8}$/
    if (input.phone && !phoneRegex.test(input.phone.replace(/\s/g, ''))) {
      errors.push('Invalid Algerian phone number format')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  static validateProductVariant(input) {
    const errors = []
    
    // Required fields validation
    if (!input.name || input.name.trim().length < 2) {
      errors.push('Variant name must be at least 2 characters')
    }
    
    if (!input.sku || input.sku.trim().length < 3) {
      errors.push('SKU must be at least 3 characters')
    }
    
    if (!input.productId) {
      errors.push('Product ID is required')
    }
    
    // Price validation (prevent negative values)
    if (input.price !== undefined && input.price !== null) {
      const price = parseFloat(input.price)
      if (isNaN(price) || price < 0) {
        errors.push('Price cannot be negative')
      }
      if (price > 999999) {
        errors.push('Price cannot exceed 999,999')
      }
    }
    
    if (input.compareAtPrice !== undefined && input.compareAtPrice !== null) {
      const comparePrice = parseFloat(input.compareAtPrice)
      if (isNaN(comparePrice) || comparePrice < 0) {
        errors.push('Compare price cannot be negative')
      }
    }
    
    // Stock validation
    if (input.stock !== undefined && input.stock !== null) {
      const stock = parseInt(input.stock)
      if (isNaN(stock) || stock < 0) {
        errors.push('Stock cannot be negative')
      }
      if (stock > 99999) {
        errors.push('Stock cannot exceed 99,999')
      }
    }
    
    // Weight validation
    if (input.weight !== undefined && input.weight !== null) {
      const weight = parseFloat(input.weight)
      if (isNaN(weight) || weight <= 0) {
        errors.push('Weight must be greater than 0')
      }
      if (weight > 1000) {
        errors.push('Weight cannot exceed 1000kg')
      }
    }
    
    // SKU format validation
    const skuRegex = /^[A-Z0-9-_]{3,50}$/i
    if (input.sku && !skuRegex.test(input.sku)) {
      errors.push('SKU can only contain letters, numbers, hyphens, and underscores (3-50 characters)')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  static validateShippingMethod(input) {
    const errors = []
    
    if (!input.name || input.name.trim().length < 2) {
      errors.push('Shipping method name is required')
    }
    
    if (input.cost !== undefined && input.cost !== null) {
      const cost = parseFloat(input.cost)
      if (isNaN(cost) || cost < 0) {
        errors.push('Shipping cost cannot be negative')
      }
      if (cost > 50000) {
        errors.push('Shipping cost cannot exceed 50,000')
      }
    }
    
    if (input.deliveryDays !== undefined && input.deliveryDays !== null) {
      const days = parseInt(input.deliveryDays)
      if (isNaN(days) || days < 0) {
        errors.push('Delivery days cannot be negative')
      }
      if (days > 30) {
        errors.push('Delivery days cannot exceed 30')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  static sanitizeInput(input) {
    if (typeof input !== 'object' || input === null) {
      return input
    }
    
    const sanitized = {}
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        // Trim whitespace and remove potentially dangerous characters
        sanitized[key] = value.trim().replace(/[<>]/g, '')
      } else if (typeof value === 'number') {
        // Ensure valid numbers
        sanitized[key] = isNaN(value) ? 0 : value
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }
}

// Export validation wrapper for mutations
export const withValidation = (mutationFn, validator) => {
  return async (input) => {
    // Sanitize input first
    const sanitizedInput = ValidationLayer.sanitizeInput(input)
    
    // Validate input
    const validation = validator(sanitizedInput)
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Execute mutation with validated input
    return await mutationFn(sanitizedInput)
  }
}
