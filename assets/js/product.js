/* Body Favors Waist Beads — Product Page */

window.BF_PRODUCT = {
  product: null,
  selectedVariant: null,
  currentImageIdx: 0,
  qty: 1,

  init() {
    const handle = new URLSearchParams(window.location.search).get('handle');
    if (!handle) {
      this.showError('No product specified.');
      return;
    }

    BF.onProductsReady((products) => {
      this.product = products.find(p => p.handle === handle);
      if (!this.product) {
        this.showError(`Product "${handle}" not found.`);
        return;
      }
      this.selectedVariant = this.product.variants && this.product.variants[0];
      this.render();
    });
  },

  render() {
    const p = this.product;
    document.title = `${p.title} — Body Favors Waist Beads`;

    // Gallery
    this.renderGallery();

    // Panel
    const panel = document.getElementById('product-panel');
    if (!panel) return;

    const inStock = p.variants && p.variants.some(v => v.available);
    const compareAt = this.selectedVariant && this.selectedVariant.compare_at_price;

    panel.innerHTML = `
      <nav class="breadcrumb">
        <a href="../index.html">Home</a>
        <span class="breadcrumb__sep">›</span>
        <a href="../collections/shop-all.html">Shop</a>
        <span class="breadcrumb__sep">›</span>
        <span>${p.title}</span>
      </nav>

      <h1 style="font-family:var(--font-display);font-size:clamp(28px,4vw,42px);font-weight:600;margin:var(--space-3) 0 var(--space-2);line-height:1.2;">${p.title}</h1>

      <div class="product-panel__rating">
        <span style="color:var(--color-gold)">★★★★★</span>
        <span>4.9 · 47 reviews</span>
      </div>

      <div class="product-panel__price">
        ${BF.formatPrice(p.price_min)}
        ${compareAt ? `<span style="font-size:18px;color:var(--color-muted);text-decoration:line-through;margin-left:8px;">${BF.formatPrice(compareAt)}</span>` : ''}
      </div>

      <div class="product-panel__divider"></div>

      ${this._renderVariants()}

      <div style="margin-bottom:var(--space-4)">
        <div class="variant-label">Quantity</div>
        <div class="qty-row">
          <div class="qty-stepper--lg">
            <button onclick="BF_PRODUCT.setQty(-1)" aria-label="Decrease quantity">−</button>
            <span class="qty-count" id="qty-display">1</span>
            <button onclick="BF_PRODUCT.setQty(1)" aria-label="Increase quantity">+</button>
          </div>
          <span style="font-size:var(--text-small);color:var(--color-muted)">
            ${inStock ? '<span style="color:var(--color-success)">✓ In Stock</span>' : '<span style="color:var(--color-error)">Out of Stock</span>'}
          </span>
        </div>
      </div>

      <button
        class="btn btn--gold btn--full"
        style="font-size:16px;padding:18px;margin-bottom:var(--space-2);${!inStock ? 'opacity:0.6;cursor:not-allowed;' : ''}"
        onclick="BF_PRODUCT.addToCart()"
        ${!inStock ? 'disabled' : ''}
        id="add-to-bag-btn"
      >
        ${inStock ? 'Add to Bag' : 'Out of Stock'}
      </button>

      <a href="https://www.bodyfavorswaistbeads.com/products/${p.handle}" target="_blank" class="btn btn--outline btn--full" style="margin-bottom:var(--space-4)">
        View on Official Store ↗
      </a>

      <div class="product-panel__divider"></div>

      <!-- Accordions -->
      <div class="accordion" id="product-accordions">
        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>Color Story & Materials</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div class="accordion-body">
            <div class="accordion-body__inner">
              ${p.description_text || 'A beautiful collection of hand-crafted glass beads, carefully strung on durable thread. Each piece carries intention and beauty.'}
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>Bead Meaning & Intention</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div class="accordion-body">
            <div class="accordion-body__inner">
              ${(p.tags || []).length > 0
                ? `These beads carry the energy of: <strong>${p.tags.slice(0,5).join(', ')}</strong>. Wear them as a daily reminder of your intention and power.`
                : 'Each waist bead is crafted with intention. Wear them close to your body to set your daily affirmations and manifest your highest self.'}
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>Description</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div class="accordion-body">
            <div class="accordion-body__inner">
              ${p.description_html || p.description_text || 'Beautifully crafted waist beads from our Atlanta studio.'}
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>Care Instructions</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div class="accordion-body">
            <div class="accordion-body__inner">
              To keep your beads beautiful, avoid soaking in water for extended periods. Gently pat dry after showers. Store in a soft pouch when not wearing. Avoid harsh chemicals and perfumes directly on beads.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>Length Guide</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div class="accordion-body">
            <div class="accordion-body__inner">
              <p style="margin-bottom:12px">Our tie-on waist beads are approximately 50 inches and fit most waist sizes. To find your perfect placement, measure around your waist or hips at the position where you want the beads to sit.</p>
              <p>Removable clasp styles come in specific sizes — please see variant options above. When in doubt, size up!</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Re-init accordions for product page
    BF_UI.initAccordions();

    // Show page
    document.getElementById('product-loading')?.remove();
    document.getElementById('product-content')?.removeAttribute('style');
  },

  _renderVariants() {
    const p = this.product;
    if (!p.variants || p.variants.length <= 1 && p.variants[0]?.title === 'Default Title') return '';

    return `
      <div style="margin-bottom:var(--space-4)">
        <div class="variant-label">Options</div>
        <div class="variant-options" id="variant-options">
          ${p.variants.map(v => `
            <button
              class="variant-btn ${v.id === this.selectedVariant?.id ? 'selected' : ''}"
              onclick="BF_PRODUCT.selectVariant(${v.id})"
              ${!v.available ? 'disabled' : ''}
              data-variant-id="${v.id}"
            >${v.title}</button>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderGallery() {
    const p = this.product;
    const images = p.images || [];
    const prefix = BF._imgPrefix || '';

    // Build local-first image list (up to images.length, plus at least 1)
    const count = Math.max(images.length, 1);
    this._galleryImgs = Array.from({ length: count }, (_, i) => ({
      local: BF_imgPath(p.handle, i, images[i] ? images[i].src : '', prefix),
      cdn: images[i] ? images[i].src : ''
    }));

    const mainImg = document.getElementById('gallery-main-img');
    const thumbsEl = document.getElementById('gallery-thumbs');
    if (!mainImg) return;

    mainImg.src = this._galleryImgs[0].local;
    mainImg.alt = p.title;
    mainImg.onerror = () => {
      if (mainImg.src !== this._galleryImgs[0].cdn && this._galleryImgs[0].cdn) {
        mainImg.src = this._galleryImgs[0].cdn;
      }
    };

    if (thumbsEl && this._galleryImgs.length > 1) {
      thumbsEl.innerHTML = this._galleryImgs.map((img, i) => `
        <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="BF_PRODUCT.setImage(${i})" data-idx="${i}">
          <img src="${img.local}" alt="${p.title} image ${i+1}" loading="lazy" onerror="const fallback='${img.cdn}';if(this.src!==fallback&&fallback)this.src=fallback;">
        </div>
      `).join('');
    } else if (thumbsEl) {
      thumbsEl.style.display = 'none';
    }

    this.currentImageIdx = 0;
  },

  setImage(idx) {
    const imgs = this._galleryImgs || [];
    if (!imgs[idx]) return;
    this.currentImageIdx = idx;
    const mainImg = document.getElementById('gallery-main-img');
    if (mainImg) {
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = imgs[idx].local;
        mainImg.onerror = () => {
          if (mainImg.src !== imgs[idx].cdn && imgs[idx].cdn) {
            mainImg.src = imgs[idx].cdn;
          }
        };
        mainImg.style.opacity = '1';
      }, 150);
    }
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === idx);
    });
  },

  selectVariant(variantId) {
    const v = this.product.variants.find(v => v.id === variantId);
    if (!v) return;
    this.selectedVariant = v;
    document.querySelectorAll('.variant-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.variantId) === variantId);
    });
  },

  setQty(delta) {
    this.qty = Math.max(1, this.qty + delta);
    const el = document.getElementById('qty-display');
    if (el) el.textContent = this.qty;
  },

  addToCart() {
    if (!this.product) return;
    BF.addToCart(this.product, this.qty, this.selectedVariant);
    const btn = document.getElementById('add-to-bag-btn');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Added to Bag!';
      btn.style.background = 'var(--color-success)';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
      }, 2000);
    }
  },

  showError(msg) {
    const loading = document.getElementById('product-loading');
    if (loading) {
      loading.innerHTML = `<div style="text-align:center;padding:96px 24px;color:var(--color-muted)"><p style="font-size:48px;margin-bottom:16px">😕</p><p>${msg}</p><a href="../collections/shop-all.html" class="btn btn--gold btn--sm" style="margin-top:24px">Shop All Products</a></div>`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.BF_PRODUCT.init();
});
