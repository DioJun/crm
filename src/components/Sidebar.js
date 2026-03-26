/**
 * Componente Sidebar com navegação
 */

export class Sidebar {
  constructor() {
    this.router = null
    this.expanded = false
    this.element = null
  }
  
  setRouter(router) {
    this.router = router
  }
  
  render() {
    const sidebar = document.createElement('div')
    sidebar.className = 'sidebar'
    
    const container = document.createElement('div')
    container.className = 'sidebar-container'
    
    // Header com logo e hamburger
    const header = document.createElement('div')
    header.className = 'sidebar-header'
    
    const logo = document.createElement('div')
    logo.innerHTML = `
      <div>
        <div class="logo">✨ CRM</div>
        <span class="logo-text">Estética</span>
      </div>
    `
    
    const hamburger = document.createElement('button')
    hamburger.className = 'hamburger-btn'
    hamburger.innerHTML = '<span></span><span></span><span></span>'
    hamburger.addEventListener('click', () => this.toggleMobile())
    
    header.appendChild(logo)
    header.appendChild(hamburger)
    
    // Navegação
    const nav = document.createElement('nav')
    nav.className = 'sidebar-nav'
    
    const items = [
      { label: '📊 Dashboard', path: '#/dashboard', icon: '📊' },
      { label: '👥 Clientes', path: '#/clientes', icon: '👥' },
      { label: '📅 Agenda', path: '#/agenda', icon: '📅' },
      { label: '✂️ Procedimentos', path: '#/procedimentos', icon: '✂️' }
    ]
    
    items.forEach(item => {
      const navItem = document.createElement('a')
      navItem.href = item.path
      navItem.className = 'nav-item'
      navItem.innerHTML = `
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label.replace(/^[^\s]+ /, '')}</span>
      `
      
      navItem.addEventListener('click', (e) => {
        e.preventDefault()
        if (this.router) {
          this.router.navigate(item.path)
          this.closeMobile()
        }
      })
      
      nav.appendChild(navItem)
    })
    
    // Footer
    const footer = document.createElement('div')
    footer.className = 'sidebar-footer'
    footer.innerHTML = '<p>CRM v1.0</p>'
    
    container.appendChild(header)
    container.appendChild(nav)
    container.appendChild(footer)
    
    sidebar.appendChild(container)
    this.element = sidebar
    
    return sidebar
  }
  
  toggleMobile() {
    this.expanded = !this.expanded
    if (this.element) {
      this.element.classList.toggle('expanded', this.expanded)
      this.element.parentElement.querySelector('.hamburger-btn')?.classList.toggle('active', this.expanded)
    }
  }
  
  closeMobile() {
    this.expanded = false
    if (this.element) {
      this.element.classList.remove('expanded')
      this.element.parentElement.querySelector('.hamburger-btn')?.classList.remove('active')
    }
  }
}
