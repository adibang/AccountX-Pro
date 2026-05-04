// js/sidebar.js
import { isAdmin, isKasir, getCurrentRole, logoutUser } from './auth-guard.js';

// ========== KONFIGURASI MENU ==========
const MENU_CONFIG = [
  {
    title: 'Home',
    icon: 'home',
    href: 'index.html',
    roles: ['admin', 'kasir']
  },
  {
    title: 'Master Data',
    icon: 'package',
    roles: ['admin'],
    submenu: [
      { title: 'Tambah Produk', icon: 'plus-circle', href: 'masterdata.html', section: 'tambahProduk' },
      { title: 'Daftar Produk', icon: 'list', href: 'masterdata.html', section: 'daftarProduk' },
      { title: 'Tambah Kategori', icon: 'plus-circle', href: 'masterdata.html', section: 'tambahKategori' },
      { title: 'Daftar Kategori', icon: 'list', href: 'masterdata.html', section: 'daftarKategori' },
      { title: 'Tambah Satuan', icon: 'plus-circle', href: 'masterdata.html', section: 'tambahUnit' },
      { title: 'Daftar Satuan', icon: 'list', href: 'masterdata.html', section: 'daftarUnit' },
      { title: 'Tambah Gudang', icon: 'plus-circle', href: 'masterdata.html', section: 'tambahGudang' },
      { title: 'Daftar Gudang', icon: 'list', href: 'masterdata.html', section: 'daftarGudang' },
      { title: 'History Transfer', icon: 'clock', href: 'masterdata.html', section: 'historyTransfer' }
    ]
  },
  {
    title: 'Sales',
    icon: 'shopping-cart',
    roles: ['admin', 'kasir'],
    submenu: [
      { title: 'Transaksi', icon: 'shopping-cart', href: 'sales.html' },
      { title: 'Daftar Transaksi', icon: 'list', href: 'sales-list.html' }
    ]
  },
  {
    title: 'Purchase',
    icon: 'truck',
    roles: ['admin'],
    submenu: [
      { title: 'Pembelian', icon: 'shopping-cart', href: 'purchase.html' },
      { title: 'Daftar Pembelian', icon: 'list', href: 'purchase-list.html' }
    ]
  },
  {
    title: 'Accounting',
    icon: 'book',
    roles: ['admin'],
    submenu: [
      { title: 'Jurnal Umum', icon: 'book-open', href: 'accounting.html', section: 'journal' },
      { title: 'Neraca Saldo', icon: 'activity', href: 'accounting.html', section: 'trialBalance' },
      { title: 'Daftar Akun', icon: 'list', href: 'accounting.html', section: 'accounts' }
    ]
  },
  {
    title: 'Finance',
    icon: 'dollar-sign',
    href: 'finance.html',
    roles: ['admin']
  },
  {
    title: 'Inventory',
    icon: 'layers',
    href: 'inventory.html',
    roles: ['admin']
  },
  {
    title: 'Relation',
    icon: 'users',
    roles: ['admin', 'kasir'],
    submenu: [
      { title: 'Tambah Customer', icon: 'plus-circle', href: 'relation.html', section: 'tambahCustomer' },
      { title: 'Daftar Customer', icon: 'list', href: 'relation.html', section: 'daftarCustomer' },
      { title: 'Tambah Supplier', icon: 'plus-circle', href: 'relation.html', section: 'tambahSupplier' },
      { title: 'Daftar Supplier', icon: 'list', href: 'relation.html', section: 'daftarSupplier' }
    ]
  },
  {
    title: 'Report',
    icon: 'bar-chart-2',
    href: 'report.html',
    roles: ['admin']
  },
  {
    title: 'Setting',
    icon: 'settings',
    href: 'setting.html',
    roles: ['admin']
  }
];

// ========== FUNGSI RENDER SIDEBAR ==========
export function renderSidebar(options = {}) {
  const {
    containerId = 'sidebar',
    overlayId = 'overlay',
    menuToggleId = 'menuToggle',
    closeSidebarId = 'closeSidebar',
    activePage = getCurrentPage(),
    activeSection = getActiveSection(),
    showLocalUser = false,
    localUserName = '',
    onLocalLogout = null
  } = options;

  const sidebar = document.getElementById(containerId);
  if (!sidebar) return;

  const role = getCurrentRole();
  const filteredMenu = MENU_CONFIG.filter(item => item.roles.includes(role));
  
  let html = `
    <div class="sidebar-header">
      <h2>MUDA POS</h2>
      <button class="close-sidebar" id="${closeSidebarId}"><i data-feather="x"></i></button>
    </div>
    <ul class="sidebar-menu">
  `;

  filteredMenu.forEach(item => {
    const isActive = !item.submenu && item.href === activePage;
    if (item.submenu) {
      const hasActiveChild = item.submenu.some(sub => sub.href === activePage);
      const openClass = hasActiveChild ? 'open' : '';
      
      html += `<li class="has-submenu ${openClass}">`;
      html += `<a class="menu-link"><i data-feather="${item.icon}"></i> ${item.title} <i data-feather="chevron-down" class="arrow"></i></a>`;
      html += `<ul class="submenu">`;
      
      item.submenu.forEach(sub => {
          const subActive = sub.href === activePage && 
                           (!sub.section || sub.section === activeSection);
          html += `<li><a href="${sub.href}${sub.section ? '#' + sub.section : ''}" 
                          class="${subActive ? 'active' : ''}">
                    <i data-feather="${sub.icon || 'circle'}"></i> ${sub.title}
                  </a></li>`;
      });
      
      html += `</ul></li>`;
    } else {
      html += `<li><a href="${item.href}" class="menu-link ${isActive ? 'active' : ''}">
                <i data-feather="${item.icon}"></i> ${item.title}
              </a></li>`;
    }
  });

  html += `</ul>`;

  if (showLocalUser) {
    html += `
      <div class="sidebar-footer">
        <div class="local-user-info">
          <span>${localUserName || 'User'}</span>
          <button class="local-logout-btn" id="localLogoutBtn">Logout</button>
        </div>
      </div>
    `;
  }

  sidebar.innerHTML = html;
  if (window.feather) feather.replace();

  initSidebarEvents({ containerId, overlayId, menuToggleId, closeSidebarId, onLocalLogout });
}

function initSidebarEvents({ containerId, overlayId, menuToggleId, closeSidebarId, onLocalLogout }) {
  const sidebar = document.getElementById(containerId);
  const overlay = document.getElementById(overlayId);
  const menuToggle = document.getElementById(menuToggleId);
  const closeBtn = document.getElementById(closeSidebarId);

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('active');
    });
  }

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  sidebar.querySelectorAll('.has-submenu .menu-link').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = toggle.closest('.has-submenu');
      parent.classList.toggle('open');
    });
  });

  const localLogoutBtn = document.getElementById('localLogoutBtn');
  if (localLogoutBtn && onLocalLogout) localLogoutBtn.addEventListener('click', onLocalLogout);
}

function getCurrentPage() {
  const path = window.location.pathname;
  return path.split('/').pop() || 'index.html';
}

function getActiveSection() {
  const hash = window.location.hash.substring(1);
  return hash || null;
}

export function getMenuConfig() { return MENU_CONFIG; }
