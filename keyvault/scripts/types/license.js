class License {
  constructor(id, software, version, price, key, featured = false, discount = 0, extra = {}) {
    this.id = id;
    this.software = software;
    this.version = version;
    this.price = Number(price);
    this.key = key;
    this.featured = Boolean(featured);
    this.discount = Number(discount);
    this.category = extra.category || "Software";
    this.icon = extra.icon || "🔑";
    this.image = extra.image || "";
  }

  GetFinalPrice() {
    if (this.discount <= 0) {
      return this.price;
    }
    const discountAmount = this.price * (this.discount / 100);
    return Number((this.price - discountAmount).toFixed(2));
  }

  Render(parent) {
    if (!parent) return;

    const card = document.createElement("article");
    card.className = "license-card";
    card.dataset.id = this.id;

    const finalPrice = this.GetFinalPrice();
    const hasDiscount = this.discount > 0;

    card.innerHTML = `
      <div>
        <div class="card__badges">
          ${this.featured ? '<span class="badge badge--featured">Destacado</span>' : ""}
          ${hasDiscount ? `<span class="badge badge--discount">-${this.discount}% DTO</span>` : ""}
        </div>

        <div class="card__header">
          <div class="card__icon">
            ${
              this.image
                ? `<img src="${this.image}" alt="${this.software}" onerror="this.style.display='none'; this.parentElement.textContent='${this.icon}';">`
                : this.icon
            }
          </div>
          <div>
            <h3 class="card__title">${this.software}</h3>
            <span class="card__version">Versión ${this.version}</span>
          </div>
        </div>

        <p class="card__meta">Categoría: ${this.category} &bull; Entrega digital</p>
      </div>

      <div class="card__footer">
        <div class="price-group">
          ${hasDiscount ? `<span class="price-original">${this.price.toFixed(2)} €</span>` : ""}
          <span class="price-final">${finalPrice.toFixed(2)} €</span>
        </div>
        <button type="button" class="btn btn--primary buy-btn">Comprar</button>
      </div>
    `;

    const buyButton = card.querySelector(".buy-btn");
    buyButton.addEventListener("click", () => this.Buy());

    parent.appendChild(card);
  }

  Buy() {
    const modal = document.getElementById("license-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalSubtitle = document.getElementById("modal-subtitle");
    const modalKey = document.getElementById("modal-key");
    const copyFeedback = document.getElementById("copy-feedback");

    if (!modal || !modalTitle || !modalSubtitle || !modalKey) {
      alert(`Licencia adquirida: ${this.software} (${this.version})\nClave: ${this.key}`);
      return;
    }

    modalTitle.textContent = this.software;
    modalSubtitle.textContent = `Versión ${this.version} — Pagado: ${this.GetFinalPrice().toFixed(2)} €`;
    modalKey.textContent = this.key;

    if (copyFeedback) {
      copyFeedback.classList.add("hidden");
    }

    modal.classList.remove("hidden");
  }
}
