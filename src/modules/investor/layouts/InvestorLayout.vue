<template>
  <div class="investor-layout">
    <header class="investor-header">
      <h1>Investor Portal</h1>
      <nav class="investor-nav">
        <router-link to="/investor/hub">Hub</router-link>
        <router-link to="/investor/ai-insights">AI Insights</router-link>
        <router-link to="/investor/creative-voting">Creative Voting</router-link>
      </nav>
    </header>
    <main class="investor-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'InvestorLayout'
}
</script>

<style scoped>
.investor-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.investor-header {
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
}

.investor-nav {
  margin-top: 1rem;
}

.investor-nav a {
  color: white;
  margin-right: 2rem;
  text-decoration: none;
}

.investor-nav a:hover,
.investor-nav a.router-link-active {
  text-decoration: underline;
}

.investor-main {
  flex: 1;
  padding: 2rem;
}
</style>
