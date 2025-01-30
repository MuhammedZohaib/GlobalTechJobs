const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", async () => {
  const companiesTable = document.getElementById("companies-table");
  const filterInput = document.getElementById("filter-services");
  const searchInput = document.getElementById("search-location");
  const paginationDiv = document.getElementById("pagination");
  const cardsContainer = document.getElementById("cards-container");

  let currentPage = 1;
  const rowsPerPage = 10;
  let allCompanies = [];
  let filteredCompanies = [];

  // Theme toggle functionality
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // View toggle functionality
  const viewToggle = document.getElementById("view-toggle");
  const savedView = localStorage.getItem("view") || "table";
  document.documentElement.setAttribute("data-view", savedView);

  viewToggle.addEventListener("click", () => {
    const currentView = document.documentElement.getAttribute("data-view");
    const newView = currentView === "table" ? "cards" : "table";
    document.documentElement.setAttribute("data-view", newView);
    localStorage.setItem("view", newView);
    displayCompanies(filteredCompanies, currentPage);
  });

  function displayCompanies(data, page) {
    const currentView = document.documentElement.getAttribute("data-view");
    companiesTable.innerHTML = "";
    cardsContainer.innerHTML = "";
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    if (currentView === "table") {
      companiesTable.closest("table").style.display = "table";
      cardsContainer.style.display = "none";

      paginatedData.forEach((company) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${company.company_name}</td>
          <td>${company.location}</td>
          <td><a href="#" class="external-link" data-url="${company.site}">${
          company.site
        }</a></td>
          <td>${company.number}</td>
          <td>${company.services.join(", ")}</td>
        `;
        companiesTable.appendChild(row);
      });
    } else {
      companiesTable.closest("table").style.display = "none";
      cardsContainer.style.display = "grid";

      paginatedData.forEach((company) => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
          <h3>${company.company_name}</h3>
          <div class="card-info">
            <p><i class="fas fa-location-dot"></i> ${company.location}</p>
            <p><i class="fas fa-globe"></i> <a href="#" class="external-link" data-url="${
              company.site
            }">${company.site}</a></p>
            <p><i class="fas fa-phone"></i> ${company.number}</p>
            <div class="services-container">${formatServices(
              company.services
            )}</div>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    }
    updatePagination(data.length, page);
  }

  function updatePagination(totalItems, currentPage) {
    paginationDiv.innerHTML = "";
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    const createButton = (text, page, disabled = false) => {
      const button = document.createElement("button");
      button.innerText = text;
      button.disabled = disabled;
      button.classList.add("pagination-button");
      if (page === currentPage) button.classList.add("active");
      button.addEventListener("click", () => {
        if (page !== currentPage && !disabled) {
          displayCompanies(filteredCompanies, page);
        }
      });
      return button;
    };

    paginationDiv.appendChild(createButton("First", 1, currentPage === 1));
    paginationDiv.appendChild(
      createButton("Previous", currentPage - 1, currentPage === 1)
    );

    const range = 2;
    const startPage = Math.max(1, currentPage - range);
    const endPage = Math.min(totalPages, currentPage + range);

    for (let i = startPage; i <= endPage; i++) {
      paginationDiv.appendChild(createButton(i, i));
    }

    paginationDiv.appendChild(
      createButton("Next", currentPage + 1, currentPage === totalPages)
    );
    paginationDiv.appendChild(
      createButton("Last", totalPages, currentPage === totalPages)
    );
  }

  function filterAndSearch() {
    const filterText = filterInput.value.toLowerCase();
    const searchText = searchInput.value.toLowerCase();

    filteredCompanies = allCompanies.filter((company) => {
      const servicesMatch = company.services.some((service) =>
        service.toLowerCase().includes(filterText)
      );
      const locationMatch = company.location.toLowerCase().includes(searchText);
      return servicesMatch && locationMatch;
    });

    currentPage = 1;
    displayCompanies(filteredCompanies, currentPage);
  }

  function formatServices(services) {
    if (!services) return "";
    return services
      .map((service) => `<span class="service-tag">${service}</span>`)
      .join(" ");
  }

  try {
    const result = await ipcRenderer.invoke("fetch-companies");
    allCompanies = result.companies;
    filteredCompanies = [...allCompanies];
    displayCompanies(filteredCompanies, currentPage);
  } catch (error) {
    console.error("Error fetching companies:", error);
  }

  filterInput.addEventListener("input", filterAndSearch);
  searchInput.addEventListener("input", filterAndSearch);
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("external-link")) {
    event.preventDefault(); // Prevent default behavior
    const url = event.target.getAttribute("data-url");
    if (url) {
      ipcRenderer.invoke("open-external-link", url);
    }
  }
});
