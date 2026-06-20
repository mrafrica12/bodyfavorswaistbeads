/* Body Favors Waist Beads — Data Layer */

function BF_pathPrefix() {
  const path = decodeURIComponent(window.location.pathname);
  const sectionDirs = ['collections', 'products', 'pages', 'account', 'checkout', 'policies', 'blogs'];
  return sectionDirs.some(dir => path.includes(`/${dir}/`)) ? '../' : '';
}

// Resolve product image — prefer local webp, fall back to CDN src
function BF_imgPath(handle, index, fallbackSrc, basePrefix) {
  const prefix = basePrefix || BF._imgPrefix || '';
  const num = String(index + 1).padStart(2, '0');
  const localPath = `${prefix}assets/images/products/${handle}-${num}.webp`;
  // Store fallback for later use if local image fails
  BF._imageFallbacks = BF._imageFallbacks || {};
  BF._imageFallbacks[localPath] = fallbackSrc;
  return localPath;
}

window.BF = {
  products: [],
  productsLoaded: false,
  cart: { items: [], total: 0 },
  _cartKey: 'bf_cart',

  async init() {
    this._restoreCart();
    await this._loadProducts();
  },

  async _loadProducts() {
    const prefix = BF_pathPrefix();
    this._imgPrefix = prefix;
    const url = prefix + 'products/products.json';

    try {
      if (window.location.protocol === 'file:') {
        await this._loadProductsFromScript(url.replace(/\.json$/, '.js'));
        return;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load products');
      this.products = await res.json();
      this.productsLoaded = true;
      document.dispatchEvent(new CustomEvent('bf:productsLoaded', { detail: this.products }));
    } catch (err) {
      console.warn('BF: Could not load products.json; trying script fallback', err);
      await this._loadProductsFromScript(url.replace(/\.json$/, '.js'));
    }
  },

  _loadProductsFromScript(url) {
    return new Promise((resolve) => {
      const finish = (products) => {
        this.products = products;
        this.productsLoaded = true;
        document.dispatchEvent(new CustomEvent('bf:productsLoaded', { detail: products }));
        resolve(products);
      };

      if (Array.isArray(window.BF_PRODUCT_DATA)) {
        finish(window.BF_PRODUCT_DATA);
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.onload = () => finish(Array.isArray(window.BF_PRODUCT_DATA) ? window.BF_PRODUCT_DATA : []);
      script.onerror = () => {
        console.warn('BF: Could not load product fallback script');
        finish([]);
      };
      document.head.appendChild(script);
    });
  },

  onProductsReady(callback) {
    if (this.productsLoaded) {
      callback(this.products);
      return;
    }
    document.addEventListener('bf:productsLoaded', (e) => callback(e.detail), { once: true });
  },

  _restoreCart() {
    try {
      const saved = localStorage.getItem(this._cartKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.cart = parsed;
      }
    } catch (e) {
      this.cart = { items: [], total: 0 };
    }
    this._updateCartUI();
  },

  _saveCart() {
    localStorage.setItem(this._cartKey, JSON.stringify(this.cart));
  },

  _calcTotal() {
    this.cart.total = this.cart.items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.qty;
    }, 0);
  },

  addToCart(product, qty = 1, variant = null) {
    const variantId = variant ? variant.id : (product.variants[0] ? product.variants[0].id : product.id);
    const price = variant ? variant.price : product.price_min;
    const image = product.images && product.images[0] ? product.images[0].src : '';
    const key = `${product.id}_${variantId}`;

    const existing = this.cart.items.find(i => i.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      this.cart.items.push({
        key,
        id: product.id,
        handle: product.handle,
        name: product.title,
        price,
        qty,
        image,
        variantId
      });
    }

    this._calcTotal();
    this._saveCart();
    this._updateCartUI();
    BF_UI.openCartDrawer();
    BF_UI.showToast(`✓ "${product.title}" added to bag`, 'success');
    document.dispatchEvent(new CustomEvent('bf:cartUpdated', { detail: this.cart }));
  },

  removeFromCart(key) {
    this.cart.items = this.cart.items.filter(i => i.key !== key);
    this._calcTotal();
    this._saveCart();
    this._updateCartUI();
    BF_UI.renderCartDrawer();
    document.dispatchEvent(new CustomEvent('bf:cartUpdated', { detail: this.cart }));
  },

  updateQty(key, qty) {
    const item = this.cart.items.find(i => i.key === key);
    if (!item) return;
    if (qty <= 0) {
      this.removeFromCart(key);
      return;
    }
    item.qty = qty;
    this._calcTotal();
    this._saveCart();
    this._updateCartUI();
    BF_UI.renderCartDrawer();
    document.dispatchEvent(new CustomEvent('bf:cartUpdated', { detail: this.cart }));
  },

  clearCart() {
    this.cart = { items: [], total: 0 };
    this._saveCart();
    this._updateCartUI();
    document.dispatchEvent(new CustomEvent('bf:cartUpdated', { detail: this.cart }));
  },

  _updateCartUI() {
    const count = this.cart.items.reduce((sum, i) => sum + i.qty, 0);
    // Update all cart badges
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = count > 0 ? count : '';
      el.style.display = count > 0 ? 'flex' : 'none';
    });
    // Update mobile cart bar
    const bar = document.querySelector('.mobile-cart-bar');
    if (bar) {
      if (count > 0) {
        bar.classList.add('has-items');
        const countEl = bar.querySelector('.mobile-cart-bar__count');
        const totalEl = bar.querySelector('.mobile-cart-bar__total');
        if (countEl) countEl.textContent = `${count} item${count !== 1 ? 's' : ''}`;
        if (totalEl) totalEl.textContent = `$${this.cart.total.toFixed(2)}`;
        document.body.classList.add('has-cart-bar');
      } else {
        bar.classList.remove('has-items');
        document.body.classList.remove('has-cart-bar');
      }
    }
  },

  formatPrice(p) {
    return `$${parseFloat(p).toFixed(2)}`;
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.BF.init();
});
