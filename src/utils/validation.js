/**
 * Utilitários de Validação
 */

export class Validator {
  /**
   * Validar nome (não vazio, min 3 caracteres)
   */
  static validateName(name) {
    return name && name.trim().length >= 3
  }
  
  /**
   * Validar WhatsApp brasileiro
   * Formatos aceitos: +55 98 98888-8888 ou 98988888888 ou (98) 98888-8888
   */
  static validateWhatsApp(phone) {
    const cleaned = phone.replace(/\D/g, '')
    // Min 10 (formato local) ou 13+ (com código país)
    return cleaned.length >= 10 && cleaned.length <= 15
  }
  
  /**
   * Validar data de nascimento (não pode ser futura, min 18 anos)
   */
  static validateDateOfBirth(dateString) {
    const birthDate = new Date(dateString)
    const today = new Date()
    
    // Não pode ser data futura
    if (birthDate > today) return false
    
    // Calcular idade
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    // Min 18 anos (ou opcional)
    return age >= 0
  }
  
  /**
   * Validar campo de texto grande (min 10 caracteres)
   */
  static validateLongText(text, minLength = 0) {
    return text && text.trim().length >= minLength
  }
  
  /**
   * Validar email
   */
  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }
  
  /**
   * Validar preço (número positivo, até 2 casas decimais)
   */
  static validatePrice(price) {
    const num = parseFloat(price)
    return !isNaN(num) && num > 0 && num === Math.round(num * 100) / 100
  }
  
  /**
   * Validar duração em minutos (número positivo)
   */
  static validateDuration(minutes) {
    const num = parseInt(minutes, 10)
    return !isNaN(num) && num > 0
  }
  
  /**
   * Validar data e hora futura
   */
  static validateFutureDateTime(dateString, timeString) {
    const dateTime = new Date(`${dateString}T${timeString}`)
    const now = new Date()
    return dateTime > now
  }
  
  /**
   * Exibir erro em um campo
   */
  static showFieldError(field, message) {
    field.classList.add('error')
    const errorEl = field.parentElement.querySelector('.form-error')
    if (errorEl) {
      errorEl.textContent = message
    }
  }
  
  /**
   * Limpar erro de um campo
   */
  static clearFieldError(field) {
    field.classList.remove('error')
    const errorEl = field.parentElement.querySelector('.form-error')
    if (errorEl) {
      errorEl.textContent = ''
    }
  }
}

/**
 * Toast notifications simples
 */
export class Toast {
  static show(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    toast.textContent = message
    toast.setAttribute('role', 'alert')
    
    document.body.appendChild(toast)
    
    if (duration > 0) {
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease'
        setTimeout(() => toast.remove(), 300)
      }, duration)
    }
    
    return toast
  }
  
  static success(message) {
    this.show(message, 'success')
  }
  
  static error(message) {
    this.show(message, 'error')
  }
  
  static warning(message) {
    this.show(message, 'warning')
  }
  
  static info(message) {
    this.show(message, 'info')
  }
}

// Adicionar animação slideOut ao CSS dinamicamente
const style = document.createElement('style')
style.textContent = `
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

/**
 * Modal de confirmação moderno
 */
export class ConfirmModal {
  /**
   * Exibe modal de confirmação
   * @param {object} options - { title, message, confirmText, cancelText, type }
   * @returns {Promise<boolean>}
   */
  static show({ title = 'Confirmar', message = 'Tem certeza?', confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' } = {}) {
    return new Promise((resolve) => {
      // Remover modal anterior se existir
      const existing = document.getElementById('confirm-modal-overlay')
      if (existing) existing.remove()

      const overlay = document.createElement('div')
      overlay.id = 'confirm-modal-overlay'
      overlay.className = 'confirm-modal-overlay'

      const iconMap = { danger: '🗑️', warning: '⚠️', info: 'ℹ️', success: '✅' }
      const icon = iconMap[type] || '⚠️'

      overlay.innerHTML = `
        <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
          <div class="confirm-modal-icon confirm-modal-icon--${type}">${icon}</div>
          <h3 class="confirm-modal-title" id="confirm-modal-title">${title}</h3>
          <p class="confirm-modal-message">${message}</p>
          <div class="confirm-modal-actions">
            <button class="confirm-modal-btn confirm-modal-btn--cancel" id="confirm-modal-cancel">${cancelText}</button>
            <button class="confirm-modal-btn confirm-modal-btn--${type}" id="confirm-modal-confirm">${confirmText}</button>
          </div>
        </div>
      `

      document.body.appendChild(overlay)

      // Animar entrada
      requestAnimationFrame(() => overlay.classList.add('confirm-modal-overlay--visible'))

      const close = (result) => {
        overlay.classList.remove('confirm-modal-overlay--visible')
        setTimeout(() => overlay.remove(), 250)
        resolve(result)
      }

      document.getElementById('confirm-modal-confirm').addEventListener('click', () => close(true))
      document.getElementById('confirm-modal-cancel').addEventListener('click', () => close(false))
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false) })
      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') { close(false); document.removeEventListener('keydown', handler) }
        if (e.key === 'Enter') { close(true); document.removeEventListener('keydown', handler) }
      })
    })
  }

  static delete(itemName) {
    return this.show({
      title: 'Deletar registro',
      message: `Tem certeza que deseja deletar <strong>${itemName}</strong>? Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar',
      type: 'danger'
    })
  }
}

/**
 * Modal genérico para formulários e detalhes
 */
export class Modal {
  /**
   * Abre um modal com HTML customizado
   * @param {object} options - { title, bodyHTML, footerHTML?, width?, onOpen? }
   * @returns {{ el: Element, close: Function }}
   */
  static open({ title, bodyHTML, footerHTML = '', width = '560px', onOpen }) {
    const existing = document.getElementById('page-modal-overlay')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id = 'page-modal-overlay'
    overlay.className = 'page-modal-overlay'

    overlay.innerHTML = `
      <div class="page-modal" role="dialog" aria-modal="true" style="max-width:${width}">
        <div class="page-modal-header">
          <h3 class="page-modal-title">${title}</h3>
          <button class="page-modal-close" id="page-modal-close" aria-label="Fechar">&times;</button>
        </div>
        <div class="page-modal-body">${bodyHTML}</div>
        ${footerHTML ? `<div class="page-modal-footer">${footerHTML}</div>` : ''}
      </div>
    `

    document.body.appendChild(overlay)
    requestAnimationFrame(() => overlay.classList.add('page-modal-overlay--visible'))

    const close = () => {
      overlay.classList.remove('page-modal-overlay--visible')
      setTimeout(() => overlay.remove(), 250)
    }

    document.getElementById('page-modal-close').addEventListener('click', close)
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })
    const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler) } }
    document.addEventListener('keydown', escHandler)

    if (onOpen) onOpen(overlay, close)

    return { el: overlay, close }
  }
}
