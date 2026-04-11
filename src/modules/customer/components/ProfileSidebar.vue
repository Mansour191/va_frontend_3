<template>
  <div class="profile-sidebar">
    <div class="profile-header">
      <div class="avatar">
        <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
        <div v-else class="avatar-placeholder">
          {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
        </div>
      </div>
      <h3>{{ user.name || 'Guest User' }}</h3>
      <p>{{ user.email || 'guest@example.com' }}</p>
    </div>
    
    <nav class="profile-nav">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'ProfileSidebar',
  data() {
    return {
      user: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: null
      },
      menuItems: [
        {
          path: '/customer/profile',
          label: 'Profile Information',
          icon: 'fas fa-user'
        },
        {
          path: '/customer/orders',
          label: 'My Orders',
          icon: 'fas fa-shopping-bag'
        },
        {
          path: '/customer/wishlist',
          label: 'Wishlist',
          icon: 'fas fa-heart'
        },
        {
          path: '/customer/addresses',
          label: 'Addresses',
          icon: 'fas fa-map-marker-alt'
        },
        {
          path: '/customer/payments',
          label: 'Payment Methods',
          icon: 'fas fa-credit-card'
        },
        {
          path: '/customer/notifications',
          label: 'Notifications',
          icon: 'fas fa-bell'
        },
        {
          path: '/customer/settings',
          label: 'Settings',
          icon: 'fas fa-cog'
        }
      ]
    }
  }
}
</script>

<style scoped>
.profile-sidebar {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: fit-content;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  overflow: hidden;
  border: 3px solid #3498db;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.profile-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.profile-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.profile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #3498db;
}

.nav-item.active {
  background: #3498db;
  color: white;
}

.nav-item i {
  width: 20px;
  margin-right: 0.75rem;
  text-align: center;
}

.nav-item span {
  font-weight: 500;
}
</style>
