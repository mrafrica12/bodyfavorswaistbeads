/* Body Favors Waist Beads — Shop / Collection Pages */

window.BF_SHOP = {
  allProducts: [],
  filtered: [],
  inStockOnly: false,
  sortBy: 'featured',
  priceMax: 200,
  category: 'all', // set per-page

  init(category) {
    this.category = category || 'all';
    BF.onProductsReady((products) => {
      this.allProducts = products;
      this.filter();
    });
    this._initControls();
  },

  _initControls() {
    // Sort
    const sortEl = document.getElementById('sort-select');
    if (sortEl) {
      sortEl.addEventListener('change', () => {
        this.sortBy = sortEl.value;
        this.filter();
      });
    }

    // In-stock toggle
    const stockToggle = document.getElementById('instock-toggle');
    if (stockToggle) {
      stockToggle.addEventListener('change', () => {
        this.inStockOnly = stockToggle.checked;
        this.filter();
      });
    }

    // Price filter
    const priceRange = document.getElementById('price-range');
    const priceLabel = document.getElementById('price-label');
    if (priceRange) {
      priceRange.addEventListener('input', () => {
        this.priceMax = parseInt(priceRange.value);
        if (priceLabel) priceLabel.textContent = `$${this.priceMax}+`;
        this.filter();
      });
    }
  },

  _matchesCategory(product) {
    const tags = (product.tags || []).map(t => t.toLowerCase());
    const type = (product.product_type || '').toLowerCase();
    switch (this.category) {
      case 'waist-beads':
        return tags.some(t => ['waistbeads', 'traditional', 'removable', 'tie on'].includes(t));
      case 'fans':
        return tags.some(t => ['fans', 'fan', 'fabric fan', 'folding fan', 'woven fans'].includes(t)) || type.includes('fan');
      case 'accessories':
        return tags.some(t => ['accessories', 'anklet', 'bracelet', 'wrap bracelet'].includes(t)) || type.includes('accessor');
      case 'self-care':
        return tags.some(t => ['self-care', 'self care'].includes(t)) ||
          type.includes('self') ||
          /bath|sponge|exfoliat|gift-set|gift set/.test(product.handle || '') ||
          /bath|sponge|exfoliat|gift set/.test(product.title || '');
      case 'flaws-all':
        return tags.some(t => ['clearance', 'clear'].includes(t));
      case 'all':
      default:
        return true;
    }
  },

  filter() {
    let products = this.allProducts.filter(p => this._matchesCategory(p));

    // In-stock
    if (this.inStockOnly) {
      products = products.filter(p => p.variants && p.variants.some(v => v.available));
    }

    // Price
    products = products.filter(p => parseFloat(p.price_min) <= this.priceMax || this.priceMax >= 150);

    // Sort
    switch (this.sortBy) {
      case 'price-asc':
        products.sort((a, b) => parseFloat(a.price_min) - parseFloat(b.price_min));
        break;
      case 'price-desc':
        products.sort((a, b) => parseFloat(b.price_min) - parseFloat(a.price_min));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
        break;
      default: // featured — keep original order
        break;
    }

    this.filtered = products;
    this.render();
  },

  render() {
    const grid = document.getElementById('product-grid');
    const countEl = document.getElementById('product-count');
    if (!grid) return;

    const count = this.filtered.length;
    if (countEl) countEl.textContent = `${count} product${count !== 1 ? 's' : ''}`;

    if (count === 0) {
      grid.innerHTML = `
        <div class="no-results" style="grid-column:1/-1">
          <div class="no-results__icon">✨</div>
          <p>No products match your current filters.</p>
          <button class="btn btn--outline btn--sm" style="margin-top:16px" onclick="BF_SHOP.resetFilters()">Clear Filters</button>
        </div>
      `;
      return;
    }

    const prefix = typeof BF_pathPrefix === 'function' ? BF_pathPrefix() : '';

    grid.innerHTML = this.filtered.map(p => this._cardHTML(p, prefix)).join('');

    // Animate cards
    grid.querySelectorAll('.product-card').forEach((card, i) => {
      card.style.animationDelay = `${i * 0.04}s`;
      card.classList.add('animate-in');
    });
  },

  _cardHTML(p, prefix) {
    const cdnFallback1 = p.images && p.images[0] ? p.images[0].src : '';
    const hasSecondImage = p.images && p.images[1];
    const cdnFallback2 = hasSecondImage ? p.images[1].src : '';
    const img1 = BF_imgPath(p.handle, 0, cdnFallback1, prefix);
    const img2 = hasSecondImage ? BF_imgPath(p.handle, 1, cdnFallback2, prefix) : '';
    const inStock = p.variants && p.variants.some(v => v.available);
    const isNew = new Date(p.published_at) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const compareAt = p.variants && p.variants[0] && p.variants[0].compare_at_price;
    const badge = !inStock ? 'Sold Out' : (isNew ? 'New' : (compareAt ? 'Sale' : ''));
    const badgeClass = !inStock ? '' : (isNew ? 'product-card__badge--gold' : (compareAt ? 'product-card__badge--sale' : 'product-card__badge--gold'));

    return `
      <div class="product-card">
        <a href="${prefix}products/product.html?handle=${p.handle}" class="product-card__img-wrap">
          ${badge ? `<span class="product-card__badge ${badgeClass}">${badge}</span>` : ''}
          <img class="img-primary" src="${img1}" alt="${p.title}" loading="lazy" onerror="if(this.src!=='${cdnFallback1}')this.src='${cdnFallback1}'">
          ${img2 ? `<img class="img-secondary" src="${img2}" alt="${p.title}" loading="lazy" onerror="if(this.src!=='${cdnFallback2}')this.src='${cdnFallback2}'">` : ''}
        </a>
        <div class="product-card__body">
          <a href="${prefix}products/product.html?handle=${p.handle}" class="product-card__name">${p.title}</a>
          <p class="product-card__tagline">${this._getTagline(p)}</p>
          <div class="product-card__price">
            ${BF.formatPrice(p.price_min)}
            ${compareAt ? `<span class="product-card__compare">${BF.formatPrice(compareAt)}</span>` : ''}
          </div>
          ${inStock
            ? `<button class="product-card__add" onclick="event.stopPropagation(); BF_SHOP.quickAdd('${p.handle}', this)" data-handle="${p.handle}">+ Add to Bag</button>`
            : `<button class="product-card__add" disabled style="opacity:0.5;cursor:not-allowed;">Sold Out</button>`
          }
        </div>
      </div>
    `;
  },

  _getTagline(p) {
    if (p.description_text) {
      return p.description_text.substring(0, 60).trim() + '…';
    }
    const tags = p.tags || [];
    if (tags.length) return tags.slice(0, 3).join(' · ');
    return '';
  },

  quickAdd(handle, btn) {
    const product = this.allProducts.find(p => p.handle === handle);
    if (!product) return;
    btn.textContent = '✓ Added!';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '+ Add to Bag';
      btn.classList.remove('added');
    }, 2000);
    window.BF.addToCart(product, 1);
  },

  resetFilters() {
    this.inStockOnly = false;
    this.sortBy = 'featured';
    this.priceMax = 200;
    const sortEl = document.getElementById('sort-select');
    if (sortEl) sortEl.value = 'featured';
    const stockToggle = document.getElementById('instock-toggle');
    if (stockToggle) stockToggle.checked = false;
    const priceRange = document.getElementById('price-range');
    if (priceRange) priceRange.value = 200;
    const priceLabel = document.getElementById('price-label');
    if (priceLabel) priceLabel.textContent = 'Any price';
    this.filter();
  }
};
