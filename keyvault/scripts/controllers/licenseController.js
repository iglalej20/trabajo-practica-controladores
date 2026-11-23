class LicenseController {
  constructor(rawLicenses = []) {
    this.licenses = rawLicenses.map(
      (item) =>
        new License(
          item.id,
          item.software,
          item.version,
          item.price,
          item.key,
          item.featured,
          item.discount,
          {
            category: item.category,
            icon: item.icon,
            image: item.image,
          }
        )
    );
  }

  ClearContainer(parent) {
    if (parent) {
      parent.innerHTML = "";
    }
  }

  RenderList(items, parent) {
    this.ClearContainer(parent);
    items.forEach((license) => license.Render(parent));
  }

  RenderFeatured(count, parent) {
    const featuredLicenses = this.licenses
      .filter((license) => license.featured)
      .slice(0, count);

    this.RenderList(featuredLicenses, parent);
  }

  RenderOffers(count, parent) {
    const offerLicenses = this.licenses
      .filter((license) => license.discount > 0)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, count);

    this.RenderList(offerLicenses, parent);
  }

  RenderLatest(count, parent) {
    const latestBySoftware = new Map();

    this.licenses.forEach((license) => {
      const currentSaved = latestBySoftware.get(license.software);

      if (!currentSaved) {
        latestBySoftware.set(license.software, license);
        return;
      }

      const isNewer =
        license.version.localeCompare(currentSaved.version, undefined, {
          numeric: true,
          sensitivity: "base",
        }) > 0;

      if (isNewer) {
        latestBySoftware.set(license.software, license);
      }
    });

    const latestLicenses = Array.from(latestBySoftware.values()).slice(0, count);
    this.RenderList(latestLicenses, parent);
  }

  RenderAll(count, parent, customSource = null) {
    const source = customSource || this.licenses;
    const shuffled = this.ShuffleArray([...source]);
    const limit = typeof count === "number" ? count : shuffled.length;
    const selected = shuffled.slice(0, limit);

    this.RenderList(selected, parent);
    return selected.length;
  }

  GetUniqueSoftwareNames() {
    return [...new Set(this.licenses.map((license) => license.software))].sort();
  }

  FilterLicenses({ search = "", category = "all", software = "all", discountOnly = false }) {
    const normalizedSearch = search.trim().toLowerCase();

    return this.licenses.filter((license) => {
      const matchesSearch =
        !normalizedSearch ||
        license.software.toLowerCase().includes(normalizedSearch) ||
        license.version.toLowerCase().includes(normalizedSearch);

      const matchesCategory = category === "all" || license.category === category;
      const matchesSoftware = software === "all" || license.software === software;
      const matchesDiscount = !discountOnly || license.discount > 0;

      return matchesSearch && matchesCategory && matchesSoftware && matchesDiscount;
    });
  }

  ShuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
  }
}
