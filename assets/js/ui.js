/* Body Favors Waist Beads — UI Layer */

window.BF_UI = {
  pathPrefix() {
    return typeof BF_pathPrefix === 'function' ? BF_pathPrefix() : '';
  },

  init() {
    document.body.style.overflow = '';
    this.initHeader();
    this.initPromoBanner();
    this.initNavScroll();
    this.initShopDropdowns();
    this.initMobileMenu();
    this.initSearchOverlay();
    this.initAccordions();
    this.initRevealObserver();
    this.initCartDrawer();
    this.initToastContainer();
  },

  /* ---- HEADER HEIGHT MEASUREMENT ---- */
  initHeader() {
    const setHeaderHeight = () => {
      const header = document.querySelector('.site-header');
      if (!header) return;
      const h = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', h + 'px');
      // Push non-hero page content below the fixed header
      const main = document.querySelector('main, .page-content, .collection-page, .policy-page, .about-page');
      if (main && !document.querySelector('.hero')) {
        main.style.paddingTop = h + 'px';
      }
    };
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);
    // Re-measure after banner dismiss
    document.addEventListener('bf:bannerDismissed', setHeaderHeight);
  },

  /* ---- PROMO BANNER ---- */
  initPromoBanner() {
    const banner = document.querySelector('.promo-banner');
    if (!banner) return;

    if (localStorage.getItem('bf_promo_dismissed')) {
      banner.classList.add('hidden');
    }

    const closeBtn = banner.querySelector('.promo-banner__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        banner.classList.add('hidden');
        localStorage.setItem('bf_promo_dismissed', '1');
        document.dispatchEvent(new Event('bf:bannerDismissed'));
      });
    }
  },

  /* ---- NAV SCROLL ---- */
  initNavScroll() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    // Nav always has solid bg now (no transparent hero overlay)
    nav.classList.add('site-nav--scrolled');

    const onScroll = () => {
      if (window.scrollY > 10) {
        nav.classList.add('site-nav--scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  },

  /* ---- SHOP DROPDOWNS ---- */
  initShopDropdowns() {
    const dropdowns = document.querySelectorAll('.site-nav__dropdown-wrap');
    if (!dropdowns.length) return;

    const closeAll = (except = null) => {
      dropdowns.forEach(wrap => {
        if (wrap === except) return;
        wrap.classList.remove('open');
        wrap.querySelector('.site-nav__dropdown-trigger')?.setAttribute('aria-expanded', 'false');
      });
    };

    dropdowns.forEach(wrap => {
      const trigger = wrap.querySelector('.site-nav__dropdown-trigger');
      const menu = wrap.querySelector('.site-nav__dropdown');
      if (!trigger || !menu || trigger.dataset.dropdownReady === 'true') return;

      trigger.dataset.dropdownReady = 'true';
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');

      const toggle = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = !wrap.classList.contains('open');
        closeAll(wrap);
        wrap.classList.toggle('open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
      };

      trigger.addEventListener('click', toggle);
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') toggle(event);
        if (event.key === 'Escape') closeAll();
      });

      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => closeAll());
      });
    });

    document.addEventListener('click', () => closeAll());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAll();
    });
  },

  /* ---- MOBILE MENU ---- */
  initMobileMenu() {
    const hamburger = document.querySelector('.hamburger-btn');
    const menu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.mobile-menu__close');
    if (!hamburger || !menu) return;

    const open = () => {
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      menu.classList.remove('open');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);

    // Close on outside click
    menu.addEventListener('click', (e) => {
      if (e.target === menu) close();
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', close);
    });
  },

  /* ---- SEARCH OVERLAY ---- */
  initSearchOverlay() {
    const overlay = document.querySelector('.search-overlay');
    const input = document.querySelector('.search-overlay__input');
    const results = document.querySelector('.search-overlay__results');
    if (!overlay) return;

    const openBtns = document.querySelectorAll('[data-open-search]');
    openBtns.forEach(btn => btn.addEventListener('click', () => {
      overlay.classList.add('open');
      setTimeout(() => input && input.focus(), 100);
    }));

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') overlay.classList.remove('open');
    });

    if (input && results) {
      input.addEventListener('input', () => this._doSearch(input.value, results));
    }
  },

  _doSearch(query, resultsEl) {
    query = query.trim().toLowerCase();
    resultsEl.innerHTML = '';
    if (!query || query.length < 2) return;

    const matches = (window.BF.products || [])
      .filter(p => p.title.toLowerCase().includes(query) || (p.description_text || '').toLowerCase().includes(query))
      .slice(0, 8);

    if (matches.length === 0) {
      resultsEl.innerHTML = `<div style="padding:16px;color:var(--color-muted);text-align:center;font-size:14px;">No results for "${query}"</div>`;
      return;
    }

    const prefix = this.pathPrefix();

    matches.forEach(p => {
      const img = p.images && p.images[0] ? p.images[0].src : '';
      const item = document.createElement('a');
      item.className = 'search-result-item';
      item.href = `${prefix}products/product.html?handle=${p.handle}`;
      item.innerHTML = `
        ${img ? `<img src="${img}" alt="${p.title}" loading="lazy">` : ''}
        <div>
          <div class="search-result-item__name">${p.title}</div>
          <div class="search-result-item__price">${BF.formatPrice(p.price_min)}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        document.querySelector('.search-overlay')?.classList.remove('open');
      });
      resultsEl.appendChild(item);
    });
  },

  /* ---- CART DRAWER ---- */
  initCartDrawer() {
    // Create drawer HTML if not present
    if (!document.querySelector('.cart-drawer')) {
      this._injectCartDrawer();
    }

    // Open cart on cart icon clicks
    document.querySelectorAll('[data-open-cart]').forEach(btn => {
      btn.addEventListener('click', () => this.openCartDrawer());
    });

    // Close on overlay click
    const overlay = document.querySelector('.cart-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.closeCartDrawer());
    }

    const closeBtn = document.querySelector('.cart-drawer__close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeCartDrawer());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeCartDrawer();
    });

    // Initial render
    this.renderCartDrawer();
  },

  _injectCartDrawer() {
    const prefix = this.pathPrefix();
    const html = `
      <div class="cart-overlay"></div>
      <div class="cart-drawer" role="dialog" aria-label="Shopping cart">
        <div class="cart-drawer__header">
          <h2 class="cart-drawer__title">Your Bag</h2>
          <button class="cart-drawer__close" aria-label="Close cart">✕</button>
        </div>
        <div class="cart-shipping-bar">
          <div class="cart-shipping-bar__text">Add <strong class="ship-remaining">$55.00</strong> more for free shipping</div>
          <div class="cart-shipping-bar__track">
            <div class="cart-shipping-bar__fill" style="width:0%"></div>
          </div>
        </div>
        <div class="cart-drawer__items" id="cart-items-list"></div>
        <div class="cart-drawer__footer" id="cart-footer">
          <div class="cart-subtotal">
            <span class="cart-subtotal__label">Subtotal</span>
            <span class="cart-subtotal__amount" id="cart-total-display">$0.00</span>
          </div>
          <a href="${prefix}checkout/cart.html" class="btn btn--gold btn--full" style="margin-bottom:8px;">View Full Bag</a>
          <button class="btn btn--plum btn--full" onclick="BF_UI.checkout()">Checkout →</button>
          <p class="cart-note">Taxes and shipping calculated at checkout</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // Re-init close button
    const closeBtn = document.querySelector('.cart-drawer__close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeCartDrawer());
    const overlay = document.querySelector('.cart-overlay');
    if (overlay) overlay.addEventListener('click', () => this.closeCartDrawer());
  },

  openCartDrawer() {
    this.renderCartDrawer();
    document.querySelector('.cart-overlay')?.classList.add('open');
    document.querySelector('.cart-drawer')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeCartDrawer() {
    document.querySelector('.cart-overlay')?.classList.remove('open');
    document.querySelector('.cart-drawer')?.classList.remove('open');
    document.body.style.overflow = '';
  },

  renderCartDrawer() {
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total-display');
    if (!list) return;

    const cart = window.BF.cart;
    const items = cart.items || [];
    const total = cart.total || 0;
    const threshold = 55;
    const progress = Math.min(100, (total / threshold) * 100);
    const remaining = Math.max(0, threshold - total);

    // Update shipping bar
    const fill = document.querySelector('.cart-shipping-bar__fill');
    const remainText = document.querySelector('.ship-remaining');
    if (fill) fill.style.width = `${progress}%`;
    if (remainText) {
      if (remaining > 0) {
        remainText.closest('.cart-shipping-bar__text').innerHTML = `Add <strong class="ship-remaining">$${remaining.toFixed(2)}</strong> more for free shipping`;
      } else {
        remainText.closest('.cart-shipping-bar__text').innerHTML = `🎉 You've unlocked <strong>free shipping!</strong>`;
      }
    }

    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    if (items.length === 0) {
      const prefix = this.pathPrefix();
      list.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__icon">🛍️</div>
          <h3 class="cart-empty__title">Your bag is empty</h3>
          <p class="cart-empty__text">Add some beautiful beads to get started.</p>
          <a href="${prefix}collections/shop-all.html" class="btn btn--gold btn--sm" onclick="BF_UI.closeCartDrawer()">Shop Now</a>
        </div>
      `;
      return;
    }

    list.innerHTML = items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <img class="cart-item__img" src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Crect fill=%22%23F0EBE3%22 width=%2280%22 height=%2280%22/%3E%3C/svg%3E'">
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">$${parseFloat(item.price).toFixed(2)}</div>
          <div class="cart-item__controls">
            <div class="qty-stepper">
              <button onclick="BF.updateQty('${item.key}', ${item.qty - 1})" aria-label="Decrease">−</button>
              <span class="qty-stepper__count">${item.qty}</span>
              <button onclick="BF.updateQty('${item.key}', ${item.qty + 1})" aria-label="Increase">+</button>
            </div>
            <button class="cart-item__remove" onclick="BF.removeFromCart('${item.key}')">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  checkout() {
    this.showToast('Opening the official store to complete checkout', 'success');
    setTimeout(() => window.location.href = 'https://www.bodyfavorswaistbeads.com/cart', 1000);
  },

  /* ---- ACCORDIONS ---- */
  initAccordions() {
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
      if (trigger.dataset.accordionReady === 'true') return;
      trigger.dataset.accordionReady = 'true';
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const body = item.querySelector('.accordion-body');
        const isOpen = item.classList.contains('open');

        // Close siblings (optional: remove for multi-open)
        const container = item.closest('.accordion');
        if (container) {
          container.querySelectorAll('.accordion-item.open').forEach(other => {
            if (other !== item) {
              other.classList.remove('open');
              other.querySelector('.accordion-body').style.maxHeight = '0';
            }
          });
        }

        if (isOpen) {
          item.classList.remove('open');
          body.style.maxHeight = '0';
        } else {
          item.classList.add('open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  },

  /* ---- REVEAL ON SCROLL ---- */
  initRevealObserver() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    els.forEach(el => obs.observe(el));
  },

  /* ---- TOAST ---- */
  initToastContainer() {
    if (!document.querySelector('.toast-container')) {
      const el = document.createElement('div');
      el.className = 'toast-container';
      document.body.appendChild(el);
    }
  },

  showToast(message, type = '') {
    const container = document.querySelector('.toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast${type ? ' toast--' + type : ''}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.BF_UI.init();
});
