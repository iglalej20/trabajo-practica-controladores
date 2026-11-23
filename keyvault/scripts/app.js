class App {
  constructor() {
    this.dataUrl = "data/licenses.json";
    this.controller = null;

    this.featuredGrid = document.getElementById("featured-grid");
    this.offersGrid = document.getElementById("offers-grid");
    this.latestGrid = document.getElementById("latest-grid");
    this.allGrid = document.getElementById("all-grid");

    this.searchInput = document.getElementById("search-input");
    this.categoryFilter = document.getElementById("category-filter");
    this.softwareFilter = document.getElementById("software-filter");
    this.discountOnlyFilter = document.getElementById("discount-only-filter");
    this.shuffleBtn = document.getElementById("shuffle-btn");
    this.emptyState = document.getElementById("empty-state");

    this.modal = document.getElementById("license-modal");
    this.modalBackdrop = document.getElementById("modal-backdrop");
    this.modalClose = document.getElementById("modal-close");
    this.modalDoneBtn = document.getElementById("modal-done-btn");
    this.copyKeyBtn = document.getElementById("copy-key-btn");
    this.modalKey = document.getElementById("modal-key");
    this.copyFeedback = document.getElementById("copy-feedback");
  }

  async Init() {
    try {
      const rawData = await this.LoadData();
      this.controller = new LicenseController(rawData);

      this.PopulateSoftwareFilter();
      this.RenderSections();
      this.BindEvents();
    } catch (error) {
      console.error("Error inicializando la aplicación:", error);
      if (this.allGrid) {
        this.allGrid.innerHTML =
          '<p class="empty-state">No se pudieron cargar las licencias. Comprueba que existen data/licenses.json y data/licenses.js.</p>';
      }
    }
  }

  async LoadData() {
    // Con servidor (http/https) se lee data/licenses.json.
    // Abierto con doble clic (file://) el navegador bloquea fetch,
    // así que se usa el respaldo data/licenses.js (window.LICENSES_DATA).
    try {
      if (window.location.protocol === "file:") {
        throw new Error("fetch no disponible en file://");
      }
      const response = await fetch(this.dataUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (Array.isArray(window.LICENSES_DATA)) {
        return window.LICENSES_DATA;
      }
      throw error;
    }
  }

  RenderSections() {
    this.controller.RenderFeatured(3, this.featuredGrid);
    this.controller.RenderOffers(3, this.offersGrid);
    this.controller.RenderLatest(3, this.latestGrid);
    this.controller.RenderAll(this.controller.licenses.length, this.allGrid);
  }

  PopulateSoftwareFilter() {
    if (!this.softwareFilter) return;

    const softwareNames = this.controller.GetUniqueSoftwareNames();
    softwareNames.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      this.softwareFilter.appendChild(option);
    });
  }

  ApplyCatalogFilters() {
    const filtered = this.controller.FilterLicenses({
      search: this.searchInput.value,
      category: this.categoryFilter.value,
      software: this.softwareFilter.value,
      discountOnly: this.discountOnlyFilter.checked,
    });

    const renderedCount = this.controller.RenderAll(filtered.length, this.allGrid, filtered);

    if (this.emptyState) {
      this.emptyState.classList.toggle("hidden", renderedCount > 0);
    }
  }

  CloseModal() {
    if (this.modal) {
      this.modal.classList.add("hidden");
    }
  }

  BindEvents() {
    this.searchInput?.addEventListener("input", () => this.ApplyCatalogFilters());
    this.categoryFilter?.addEventListener("change", () => this.ApplyCatalogFilters());
    this.softwareFilter?.addEventListener("change", () => this.ApplyCatalogFilters());
    this.discountOnlyFilter?.addEventListener("change", () => this.ApplyCatalogFilters());
    this.shuffleBtn?.addEventListener("click", () => this.ApplyCatalogFilters());

    this.modalClose?.addEventListener("click", () => this.CloseModal());
    this.modalDoneBtn?.addEventListener("click", () => this.CloseModal());
    this.modalBackdrop?.addEventListener("click", () => this.CloseModal());

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.CloseModal();
      }
    });

    this.copyKeyBtn?.addEventListener("click", async () => {
      if (!this.modalKey) return;
      try {
        await navigator.clipboard.writeText(this.modalKey.textContent);
        this.copyFeedback?.classList.remove("hidden");
      } catch (err) {
        console.error("No se pudo copiar la clave:", err);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.Init();
});
