import BaseService from './base/BaseService';

class BlogCategoryService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/blog/categories';
  }

  // GraphQL Queries and Mutations
  GET_BLOG_CATEGORIES = `
    query GetBlogCategories {
      blogCategories {
        id
        nameAr
        nameEn
        slug
        description
        descriptionAr
        iconClass
        orderPriority
        isFeatured
        isActive
        metaTitle
        createdAt
        updatedAt
      }
    }
  `;

  GET_BLOG_CATEGORY = `
    query GetBlogCategory($id: ID!) {
      blogCategory(id: $id) {
        id
        nameAr
        nameEn
        slug
        description
        descriptionAr
        iconClass
        orderPriority
        isFeatured
        isActive
        metaTitle
        createdAt
        updatedAt
      }
    }
  `;

  CREATE_BLOG_CATEGORY = `
    mutation CreateBlogCategory($input: BlogCategoryInput!) {
      createBlogCategory(input: $input) {
        success
        message
        blogCategory {
          id
          nameAr
          nameEn
          slug
          description
          descriptionAr
          iconClass
          orderPriority
          isFeatured
          isActive
          metaTitle
          createdAt
          updatedAt
        }
        errors
      }
    }
  `;

  UPDATE_BLOG_CATEGORY = `
    mutation UpdateBlogCategory($id: ID!, $input: BlogCategoryInput!) {
      updateBlogCategory(id: $id, input: $input) {
        success
        message
        blogCategory {
          id
          nameAr
          nameEn
          slug
          description
          descriptionAr
          iconClass
          orderPriority
          isFeatured
          isActive
          metaTitle
          createdAt
          updatedAt
        }
        errors
      }
    }
  `;

  DELETE_BLOG_CATEGORY = `
    mutation DeleteBlogCategory($id: ID!) {
      deleteBlogCategory(id: $id) {
        success
        message
        errors
      }
    }
  `;

  // API Methods using GraphQL
  async getCategories() {
    try {
      const response = await this.graphql(this.GET_BLOG_CATEGORIES);
      if (response.data?.blogCategories) {
        return {
          success: true,
          data: response.data.blogCategories.map(this.transformCategory)
        };
      }
      return {
        success: false,
        data: this.getMockCategories(),
        error: 'Failed to load categories'
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      return {
        success: false,
        data: this.getMockCategories(),
        error: error.message
      };
    }
  }

  async getCategoryById(id) {
    try {
      const response = await this.graphql(this.GET_BLOG_CATEGORY, { id });
      if (response.data?.blogCategory) {
        return {
          success: true,
          data: this.transformCategory(response.data.blogCategory)
        };
      }
      return {
        success: false,
        error: 'Category not found'
      };
    } catch (error) {
      console.error('Error getting category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createCategory(categoryData) {
    try {
      const input = this.transformCategoryInput(categoryData);
      const response = await this.graphql(this.CREATE_BLOG_CATEGORY, { input });
      
      if (response.data?.createBlogCategory?.success) {
        return {
          success: true,
          data: this.transformCategory(response.data.createBlogCategory.blogCategory),
          message: response.data.createBlogCategory.message
        };
      }
      
      return {
        success: false,
        error: response.data?.createBlogCategory?.message || 'Failed to create category',
        errors: response.data?.createBlogCategory?.errors || []
      };
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const input = this.transformCategoryInput(categoryData);
      const response = await this.graphql(this.UPDATE_BLOG_CATEGORY, { id, input });
      
      if (response.data?.updateBlogCategory?.success) {
        return {
          success: true,
          data: this.transformCategory(response.data.updateBlogCategory.blogCategory),
          message: response.data.updateBlogCategory.message
        };
      }
      
      return {
        success: false,
        error: response.data?.updateBlogCategory?.message || 'Failed to update category',
        errors: response.data?.updateBlogCategory?.errors || []
      };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteCategory(id) {
    try {
      const response = await this.graphql(this.DELETE_BLOG_CATEGORY, { id });
      
      if (response.data?.deleteBlogCategory?.success) {
        return {
          success: true,
          message: response.data.deleteBlogCategory.message
        };
      }
      
      return {
        success: false,
        error: response.data?.deleteBlogCategory?.message || 'Failed to delete category',
        errors: response.data?.deleteBlogCategory?.errors || []
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Transform methods for GraphQL field naming
  transformCategory(category) {
    return {
      id: category.id,
      name_ar: category.nameAr,
      name_en: category.nameEn,
      slug: category.slug,
      description: category.description,
      description_ar: category.descriptionAr,
      icon_class: category.iconClass,
      order_priority: category.orderPriority,
      is_featured: category.isFeatured,
      is_active: category.isActive,
      meta_title: category.metaTitle,
      created_at: category.createdAt,
      updated_at: category.updatedAt
    };
  }

  transformCategoryInput(categoryData) {
    return {
      nameAr: categoryData.name_ar,
      nameEn: categoryData.name_en,
      slug: categoryData.slug,
      description: categoryData.description,
      descriptionAr: categoryData.description_ar,
      iconClass: categoryData.icon_class,
      orderPriority: categoryData.order_priority,
      isFeatured: categoryData.is_featured,
      isActive: categoryData.is_active,
      metaTitle: categoryData.meta_title
    };
  }

  // Mock data for fallback
  getMockCategories() {
    return [
      {
        id: 1,
        name_ar: ' decor',
        name_en: 'Decoration',
        slug: 'decoration',
        description: 'Home decoration ideas and tips',
        description_ar: 'ideas and tips for home decoration',
        icon_class: 'mdi-home',
        order_priority: 1,
        is_featured: true,
        is_active: true,
        meta_title: 'Home Decoration Ideas',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        name_ar: ' ',
        name_en: 'Cars',
        slug: 'cars',
        description: 'Car stickers and vinyl designs',
        description_ar: 'Car stickers and vinyl designs',
        icon_class: 'mdi-car',
        order_priority: 2,
        is_featured: true,
        is_active: true,
        meta_title: 'Car Vinyl Stickers',
        created_at: '2024-01-12T10:00:00Z',
        updated_at: '2024-01-12T10:00:00Z'
      },
      {
        id: 3,
        name_ar: ' ',
        name_en: 'Kitchens',
        slug: 'kitchens',
        description: 'Kitchen vinyl designs and ideas',
        description_ar: 'Kitchen vinyl designs and ideas',
        icon_class: 'mdi-kitchen',
        order_priority: 3,
        is_featured: false,
        is_active: true,
        meta_title: 'Kitchen Vinyl Designs',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 4,
        name_ar: ' ',
        name_en: 'Art',
        slug: 'art',
        description: 'Artistic vinyl designs and creativity',
        description_ar: 'Artistic vinyl designs and creativity',
        icon_class: 'mdi-palette',
        order_priority: 4,
        is_featured: false,
        is_active: true,
        meta_title: 'Artistic Vinyl Designs',
        created_at: '2024-01-08T10:00:00Z',
        updated_at: '2024-01-08T10:00:00Z'
      }
    ];
  }

  // Export singleton instance
  static getInstance() {
    if (!window.blogCategoryServiceInstance) {
      window.blogCategoryServiceInstance = new BlogCategoryService();
    }
    return window.blogCategoryServiceInstance;
  }
}

// Export class as default
export default BlogCategoryService;
