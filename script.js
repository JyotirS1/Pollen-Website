// Basic data model for services and sessions
const services = [
    {
      id: 1,
      title: "Amazon Interview Prep",
      mentor: "Emily R.",
      category: "Interview Prep",
      rating: 4.9,
      price: 25,
      description:
        "Walk through Amazon-style behavioral questions, leadership principles, and mock questions tailored to your experience.",
      featured: true
    },
    {
      id: 2,
      title: "Tech Resume Review",
      mentor: "Ryan P.",
      category: "Resume Review",
      rating: 4.7,
      price: 20,
      description:
        "Line-by-line feedback on your resume, focusing on impact, metrics, and tailoring to software roles.",
      featured: true
    },
    {
      id: 3,
      title: "Behavioral Interview Coaching",
      mentor: "Sofia M.",
      category: "Mock Interview",
      rating: 5.0,
      price: 30,
      description:
        "Practice behavioral interviews using STAR stories and get detailed feedback on delivery and structure.",
      featured: true
    },
    {
      id: 4,
      title: "Early Career Planning Session",
      mentor: "Alex G.",
      category: "Career Guidance",
      rating: 4.8,
      price: 18,
      description:
        "Plan your next few semesters, internships, and side projects with a GT student who has gone through it.",
      featured: false
    }
  ];
  
  let nextServiceId = services.length + 1;
  
  const sessions = {
    upcoming: [
      {
        id: 1,
        serviceTitle: "Tech Resume Review",
        mentor: "Ryan P.",
        date: "2025-11-20",
        time: "16:00"
      }
    ],
    past: [
      {
        id: 2,
        serviceTitle: "Amazon Interview Prep",
        mentor: "Emily R.",
        date: "2025-11-01",
        time: "14:00"
      }
    ]
  };
  
  // DOM HELPERS
  function $(selector) {
    return document.querySelector(selector);
  }
  
  function createElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  
  // RENDERING SERVICES
  function renderServices() {
    const featuredGrid = $("#featured-grid");
    const exploreGrid = $("#explore-grid");
  
    featuredGrid.innerHTML = "";
    exploreGrid.innerHTML = "";
  
    const searchQuery = ($("#search-input").value || "").trim().toLowerCase();
    const filterCategory = $("#filter-category").value;
    const sortValue = $("#sort-services").value;
  
    let filtered = services.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery) ||
        s.mentor.toLowerCase().includes(searchQuery) ||
        s.category.toLowerCase().includes(searchQuery);
      const matchesCategory =
        filterCategory === "all" || s.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  
    // Apply sorting
    if (sortValue === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortValue === "rating-desc") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortValue === "featured") {
      filtered.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
    }
  
    // Create cards
    filtered.forEach((service) => {
      const card = buildServiceCard(service);
      exploreGrid.appendChild(card);
  
      if (service.featured) {
        const featuredCard = buildServiceCard(service);
        featuredGrid.appendChild(featuredCard);
      }
    });
  
    // If no matches
    if (!exploreGrid.children.length) {
      exploreGrid.appendChild(
        createElement(
          "p",
          "empty-state",
          "No services match your search yet. Try a different keyword or category."
        )
      );
    }
  }
  
  function buildServiceCard(service) {
    const card = createElement("article", "card");
    card.dataset.id = service.id;
  
    const header = createElement("div", "card-header");
    const title = createElement("h3", null, service.title);
    const mentor = createElement("p", null, `by ${service.mentor}`);
    header.appendChild(title);
    header.appendChild(mentor);
  
    const meta = createElement("div", "card-meta");
    const rating = createElement("span", null, `⭐ ${service.rating.toFixed(1)}`);
    const category = createElement("span", null, service.category);
    meta.appendChild(rating);
    meta.appendChild(category);
  
    const price = createElement(
      "div",
      "card-price",
      service.price ? `$${service.price}` : "Free"
    );
  
    const footer = createElement("div", "card-footer");
    const btn = createElement("button", "btn btn-primary", "View Service");
    btn.addEventListener("click", () => openServiceDetail(service.id));
    footer.appendChild(btn);
  
    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(price);
    card.appendChild(footer);
  
    return card;
  }
  
  // SERVICE DETAIL
  let currentDetailServiceId = null;
  
  function openServiceDetail(id) {
    const service = services.find((s) => s.id === id);
    if (!service) return;
  
    currentDetailServiceId = service.id;
  
    $("#detail-title").textContent = service.title;
    $("#detail-mentor").textContent = service.mentor;
    $("#detail-category").textContent = service.category;
    $("#detail-rating").textContent = service.rating.toFixed(1);
    $("#detail-price").textContent = `$${service.price}`;
    $("#detail-description").textContent = service.description;
  
    $("#service-detail").classList.remove("hidden");
    // scroll into view
    document.getElementById("service-detail").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
  
  function closeServiceDetail() {
    $("#service-detail").classList.add("hidden");
    currentDetailServiceId = null;
  }
  
  // SESSIONS
  function renderSessions() {
    const upcomingList = $("#upcoming-sessions");
    const pastList = $("#past-sessions");
  
    upcomingList.innerHTML = "";
    pastList.innerHTML = "";
  
    sessions.upcoming.forEach((s) => {
      upcomingList.appendChild(buildSessionItem(s));
    });
  
    sessions.past.forEach((s) => {
      pastList.appendChild(buildSessionItem(s));
    });
  
    if (!upcomingList.children.length) {
      upcomingList.appendChild(
        createElement(
          "li",
          "session-item",
          "No upcoming sessions yet. Book a service to get started."
        )
      );
    }
  
    if (!pastList.children.length) {
      pastList.appendChild(
        createElement("li", "session-item", "You don’t have any past sessions yet.")
      );
    }
  }
  
  function buildSessionItem(session) {
    const li = createElement("li", "session-item");
    const title = createElement(
      "div",
      "session-item-title",
      session.serviceTitle
    );
    const meta = createElement(
      "div",
      "session-item-meta",
      `with ${session.mentor} · ${session.date} ${session.time || ""}`
    );
    li.appendChild(title);
    li.appendChild(meta);
    return li;
  }
  
  function bookSessionFromDetail() {
    if (!currentDetailServiceId) return;
  
    const service = services.find((s) => s.id === currentDetailServiceId);
    if (!service) return;
  
    const date = $("#detail-date").value || "TBD";
    const time = $("#detail-time").value || "TBD";
  
    const newSession = {
      id: Date.now(),
      serviceTitle: service.title,
      mentor: service.mentor,
      date,
      time
    };
  
    sessions.upcoming.push(newSession);
    renderSessions();
  
    // Quick feedback
    alert("Session added to 'My Sessions'!");
  }
  
  // POST SERVICE FORM
  function handlePostService(event) {
    event.preventDefault();
  
    const title = $("#service-title").value.trim();
    const mentor = $("#service-mentor").value.trim();
    const category = $("#service-category").value;
    const price = Number($("#service-price").value);
    const ratingRaw = $("#service-rating").value;
    const rating = ratingRaw ? Number(ratingRaw) : 5.0;
    const description = $("#service-description").value.trim();
    const featured = $("#service-featured").checked;
  
    if (!title || !mentor || !category || !description) {
      alert("Please fill in all required fields.");
      return;
    }
  
    const newService = {
      id: nextServiceId++,
      title,
      mentor,
      category,
      rating,
      price,
      description,
      featured
    };
  
    services.push(newService);
    renderServices();
  
    // Clear form
    $("#post-service-form").reset();
  
    alert("Your service has been created and added to Explore!");
  }
  
  // NAV / SCROLL HELPERS
  function smoothScrollTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  
  // EVENT LISTENERS
  document.addEventListener("DOMContentLoaded", () => {
    // initial renders
    renderServices();
    renderSessions();
    $("#year").textContent = new Date().getFullYear();
  
    // Search
    $("#search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      renderServices();
      smoothScrollTo("explore");
    });
    $("#search-input").addEventListener("input", () => {
      renderServices();
    });
  
    // Explore filters
    $("#filter-category").addEventListener("change", renderServices);
    $("#sort-services").addEventListener("change", renderServices);
  
    // Quick category pills
    document.querySelectorAll(".quick-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.category;
        $("#filter-category").value = category;
        renderServices();
        smoothScrollTo("explore");
      });
    });
  
    // Category cards -> filter explore
    document.querySelectorAll(".category-filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const card = e.currentTarget.closest(".category-card");
        const category = card.dataset.category;
        $("#filter-category").value = category;
        renderServices();
        smoothScrollTo("explore");
      });
    });
  
    // Detail close
    $("#close-detail").addEventListener("click", closeServiceDetail);
  
    // Book session
    $("#book-session-btn").addEventListener("click", bookSessionFromDetail);
  
    // Post service
    $("#post-service-form").addEventListener("submit", handlePostService);
  
    // Nav "Post a Service" button
    $("#nav-post-service").addEventListener("click", () =>
      smoothScrollTo("post-service")
    );
  
    // In-page nav links smooth scroll (if you click from top)
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const id = href.slice(1);
        smoothScrollTo(id);
      });
    });
  });
  