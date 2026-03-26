/**
 * Router SPA simples baseado em hash
 * Uso: 
 *   const router = new Router(containerElement)
 *   router.register('clientes', () => new ClientesPage())
 *   router.navigate('/clientes')
 */

export class Router {
  constructor(container) {
    this.container = container
    this.routes = new Map()
    this.currentRoute = null
    this.currentPage = null
    
    // Listener para mudanças de hash
    window.addEventListener('hashchange', () => this.handleRouteChange())
  }
  
  register(path, componentLoader) {
    this.routes.set(`#/${path}`, componentLoader)
  }
  
  navigate(path) {
    window.location.hash = path
  }
  
  async handleRouteChange() {
    const hash = window.location.hash || '#/dashboard'
    const loader = this.routes.get(hash)
    
    if (!loader) {
      console.warn(`Rota não encontrada: ${hash}`)
      this.navigate('#/dashboard')
      return
    }
    
    try {
      // Limpar página anterior
      if (this.currentPage && typeof this.currentPage.destroy === 'function') {
        this.currentPage.destroy()
      }
      
      // Carregar nova página
      const mainContent = this.getMainContent()
      mainContent.innerHTML = '<div class="loading"><div class="loading-spinner"></div><span>Carregando...</span></div>'
      
      this.currentPage = await loader()
      
      // Se houver setter de instância, chamar
      const setterName = `set${this.currentPage.constructor.name.replace('Page', '')}Instance`
      if (typeof window[setterName] === 'function') {
        window[setterName](this.currentPage)
      }
      
      const html = this.currentPage.render()
      mainContent.innerHTML = ''
      mainContent.appendChild(html)
      
      this.currentRoute = hash
      
      // Atualizar sidebar (se existir)
      this.updateActiveSidebarItem(hash)
    } catch (error) {
      console.error('Erro ao carregar página:', error)
      const mainContent = this.getMainContent()
      mainContent.innerHTML = '<div class="error-state"><p>Erro ao carregar página</p></div>'
    }
  }
  
  getMainContent() {
    let main = document.querySelector('.main-content')
    if (!main) {
      main = document.createElement('div')
      main.className = 'main-content'
      this.container.appendChild(main)
    }
    return main
  }
  
  updateActiveSidebarItem(hash) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active')
    })
    
    const activeItem = document.querySelector(`.nav-item[href="${hash}"]`)
    if (activeItem) {
      activeItem.classList.add('active')
    }
  }
}
