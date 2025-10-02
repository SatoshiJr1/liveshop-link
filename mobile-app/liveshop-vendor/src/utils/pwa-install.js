// PWA Installation Helper
let deferredPrompt;

// Écouter l'événement beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA install prompt triggered');
  
  // Empêcher l'affichage automatique du prompt
  e.preventDefault();
  
  // Stocker l'événement pour l'utiliser plus tard
  deferredPrompt = e;
  
  // Afficher un bouton d'installation personnalisé
  showInstallButton();
});

// Fonction pour afficher le bouton d'installation
function showInstallButton() {
  // Créer un bouton d'installation si il n'existe pas
  let installButton = document.getElementById('pwa-install-button');
  
  if (!installButton) {
    installButton = document.createElement('button');
    installButton.id = 'pwa-install-button';
    installButton.innerHTML = '📱 Installer l\'app';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #8B5CF6;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      z-index: 1000;
      transition: all 0.3s ease;
    `;
    
    // Ajouter des effets hover
    installButton.addEventListener('mouseenter', () => {
      installButton.style.transform = 'translateY(-2px)';
      installButton.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
    });
    
    installButton.addEventListener('mouseleave', () => {
      installButton.style.transform = 'translateY(0)';
      installButton.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
    });
    
    // Gérer le clic
    installButton.addEventListener('click', installPWA);
    
    document.body.appendChild(installButton);
  }
}

// Fonction pour installer la PWA
async function installPWA() {
  if (deferredPrompt) {
    // Afficher le prompt d'installation
    deferredPrompt.prompt();
    
    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`PWA install outcome: ${outcome}`);
    
    // Nettoyer
    deferredPrompt = null;
    
    // Masquer le bouton
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.remove();
    }
  }
}

// Écouter l'événement appinstalled
window.addEventListener('appinstalled', () => {
  console.log('PWA installed successfully');
  
  // Masquer le bouton d'installation
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.remove();
  }
  
  // Afficher une notification de succès
  showNotification('App installée avec succès ! 🎉');
});

// Fonction pour afficher une notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10B981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 1001;
    animation: slideIn 0.3s ease;
  `;
  
  // Ajouter l'animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Supprimer après 3 secondes
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 3000);
}

// Vérifier si l'app est déjà installée
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('PWA is already installed');
} else {
  console.log('PWA is not installed');
}

export { showInstallButton, installPWA };
