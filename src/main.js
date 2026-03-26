import './styles/globals.css'
import './styles/layout.css'
import './styles/sidebar.css'
import './styles/forms.css'
import './styles/tables.css'
import './styles/dashboard.css'
import './styles/agenda.css'

// �️ Supabase - Database configuration
import './supabase/config.js'

import { Router } from './utils/router.js'
import { Sidebar } from './components/Sidebar.js'

// Inicializar aplicação
const app = document.getElementById('app')
const router = new Router(app)

// Registrar rotas
router.register('dashboard', () => import('./pages/DashboardPage.js').then(m => new m.DashboardPage()))
router.register('clientes', () => import('./pages/ClientesPage.js').then(m => new m.ClientesPage()))
router.register('procedimentos', () => import('./pages/ProcedimentosPage.js').then(m => new m.ProcedimentosPage()))
router.register('agenda', () => import('./pages/AgendaPage.js').then(m => new m.AgendaPage()))

// Renderizar layout principal
const sidebar = new Sidebar()
sidebar.setRouter(router)
app.appendChild(sidebar.render())

// Inicializar rota ao carregar (redireciona para dashboard se sem hash)
if (!window.location.hash || window.location.hash === '#') {
  window.location.hash = '#/dashboard'
} else {
  router.handleRouteChange()
}
