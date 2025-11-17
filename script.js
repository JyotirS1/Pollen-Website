// =================== CONSTANTS & STATE ===================

const USER_KEY = "pollen_user";
const LOGGED_IN_KEY = "pollen_logged_in_email";

let currentUser = null;

// Demo services
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

// Demo sessions
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
        },
        {
            id: 3,
            serviceTitle: "Behavioral Interview Coaching",
            mentor: "Sofia M.",
            date: "2025-10-15",
            time: "11:00"
        }
    ]
};

// =================== HELPERS ===================

function $(selector) {
    return document.querySelector(selector);
}

function createElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
}

function smoothScrollTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// =================== AUTH STORAGE ===================

function loadUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
        return null;
    }
}

function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function setLoggedInEmail(email) {
    if (email) {
        localStorage.setItem(LOGGED_IN_KEY, email);
    } else {
        localStorage.removeItem(LOGGED_IN_KEY);
    }
}

// =================== AUTH VIEW TOGGLING ===================

function showLoginPage() {
    $("#login-page").classList.remove("hidden");
    $("#register-page").classList.add("hidden");
    $("#app").classList.add("hidden");
    $("#login-error").textContent = "";
}

function showRegisterPage() {
    $("#register-page").classList.remove("hidden");
    $("#login-page").classList.add("hidden");
    $("#app").classList.add("hidden");
    $("#register-error").textContent = "";
}

function showApp() {
    $("#app").classList.remove("hidden");
    $("#login-page").classList.add("hidden");
    $("#register-page").classList.add("hidden");
}

// =================== PROFILE POPULATION ===================

function populateProfile(user) {
    if (!user) return;
    $("#profile-name").textContent = user.name || "";
    $("#profile-occupation").textContent = user.occupation || "";
    $("#profile-bio").textContent = user.bio || "";

    const initials =
        user.name
            ?.split(" ")
            .filter(Boolean)
            .map((n) => n[0].toUpperCase())
            .join("") || "?";
    $("#profile-avatar").textContent = initials;
}

// Past services on profile (ONLY previous sessions)
function populateProfileSessions() {
    const list = $("#profile-services");
    list.innerHTML = "";

    const uniqueTitles = [
        ...new Set(sessions.past.map((s) => s.serviceTitle))
    ];

    if (!uniqueTitles.length) {
        list.appendChild(createElement("li", null, "No past sessions yet."));
        return;
    }

    uniqueTitles.forEach((title) => {
        list.appendChild(createElement("li", null, title));
    });
}

// Simple editing via prompts (name/bio/occupation only)
function handleEditProfile() {
    if (!currentUser) return;

    const newName = prompt("Update your name:", currentUser.name || "");
    if (newName === null) return;

    const newBio = prompt("Update your bio:", currentUser.bio || "");
    if (newBio === null) return;

    const newOcc = prompt(
        "Update your occupation/status:",
        currentUser.occupation || ""
    );
    if (newOcc === null) return;

    currentUser = {
        ...currentUser,
        name: newName.trim(),
        bio: newBio.trim(),
        occupation: newOcc.trim()
    };

    saveUser(currentUser);
    populateProfile(currentUser);
}

// =================== SERVICES RENDERING ===================

function renderServices() {
    const featuredGrid = $("#featured-grid");
    const exploreGrid = $("#explore-grid");

    if (!featuredGrid || !exploreGrid) return;

    featuredGrid.innerHTML = "";
    exploreGrid.innerHTML = "";

    const searchQuery = ($("#search-input")?.value || "").trim().toLowerCase();
    const filterCategory = $("#filter-category")?.value || "all";
    const sortValue = $("#sort-services")?.value || "featured";

    let filtered = services.filter((s) => {
        const matchesSearch =
            s.title.toLowerCase().includes(searchQuery) ||
            s.mentor.toLowerCase().includes(searchQuery) ||
            s.category.toLowerCase().includes(searchQuery);
        const matchesCategory =
            filterCategory === "all" || s.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Sort
    if (sortValue === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortValue === "rating-desc") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortValue === "featured") {
        filtered.sort((a, b) =>
            a.featured === b.featured ? 0 : a.featured ? -1 : 1
        );
    }

    filtered.forEach((service) => {
        const card = buildServiceCard(service);
        exploreGrid.appendChild(card);

        if (service.featured) {
            const featuredCard = buildServiceCard(service);
            featuredGrid.appendChild(featuredCard);
        }
    });

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
    header.appendChild(createElement("h3", null, service.title));
    header.appendChild(createElement("p", null, `by ${service.mentor}`));

    const meta = createElement("div", "card-meta");
    if (service.rating !== undefined) {
        meta.appendChild(createElement("span", null, `⭐ ${service.rating.toFixed(1)}`));
    }
    meta.appendChild(createElement("span", null, service.category));

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

// =================== SERVICE DETAIL & BOOKING ===================

let currentDetailServiceId = null;

function openServiceDetail(id) {
    const service = services.find((s) => s.id === id);
    if (!service) return;

    currentDetailServiceId = service.id;

    $("#detail-title").textContent = service.title;
    $("#detail-mentor").textContent = service.mentor;
    $("#detail-category").textContent = service.category;
    if (service.rating !== undefined) {
        $("#detail-rating").textContent = service.rating.toFixed(1);
    } else {
        $("#detail-rating").textContent = "—";
    }
    $("#detail-price").textContent = `$${service.price}`;
    $("#detail-description").textContent = service.description;

    $("#service-detail").classList.remove("hidden");
    smoothScrollTo("service-detail");
}

function closeServiceDetail() {
    $("#service-detail").classList.add("hidden");
    currentDetailServiceId = null;
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
    alert("Session added to 'My Sessions'!");
}

// =================== SESSIONS RENDERING ===================

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

function renderSessions() {
    const upcomingList = $("#upcoming-sessions");
    const pastList = $("#past-sessions");

    if (!upcomingList || !pastList) return;

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

    // Also refresh profile's past services list
    populateProfileSessions();
}

// =================== POST SERVICE ===================

function handlePostService(e) {
    e.preventDefault();

    const title = $("#service-title").value.trim();
    const mentor = $("#service-mentor").value.trim();
    const category = $("#service-category").value;
    const price = Number($("#service-price").value);
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
        price,
        description,
        featured
    };

    services.push(newService);
    renderServices();
    $("#post-service-form").reset();
    alert("Your service has been created and added to Explore!");
}

// =================== AUTH HANDLERS ===================

function handleLogin(e) {
    e.preventDefault();

    const email = $("#login-email").value.trim();
    const password = $("#login-password").value;

    const stored = loadUser();

    if (!stored || stored.email !== email || stored.password !== password) {
        $("#login-error").textContent = "Email or password is incorrect.";
        return;
    }

    $("#login-error").textContent = "";
    currentUser = stored;
    setLoggedInEmail(email);
    showApp();
    populateProfile(currentUser);
    renderServices();
    renderSessions();
    $("#year").textContent = new Date().getFullYear();
    smoothScrollTo("home");
}

function handleRegister(e) {
    e.preventDefault();

    const name = $("#reg-name").value.trim();
    const email = $("#reg-email").value.trim();
    const password = $("#reg-password").value;
    const passwordConfirm = $("#reg-password-confirm").value;
    const occSelect = $("#reg-occupation").value;
    const customOcc = $("#reg-occupation-custom").value.trim();
    const bio = $("#reg-bio").value.trim();

    const errorEl = $("#register-error");
    errorEl.textContent = "";

    if (password !== passwordConfirm) {
        errorEl.textContent = "Passwords do not match.";
        return;
    }

    const existing = loadUser();
    if (existing && existing.email === email) {
        errorEl.textContent = "An account already exists for this email. Please log in.";
        return;
    }

    const finalOccupation =
        occSelect === "Other" ? customOcc || "Other" : occSelect;

    const user = {
        name,
        email,
        password, // NOTE: localStorage only, not real security
        occupation: finalOccupation,
        bio
    };

    saveUser(user);
    setLoggedInEmail(email);
    currentUser = user;

    showApp();
    populateProfile(currentUser);
    renderServices();
    renderSessions();
    $("#year").textContent = new Date().getFullYear();
    smoothScrollTo("home");
}

function handleLogout() {
    currentUser = null;
    setLoggedInEmail(null);
    showLoginPage();
    $("#login-form").reset();
    $("#login-error").textContent = "";
}

// =================== INITIALIZATION ===================

document.addEventListener("DOMContentLoaded", () => {
    // Occupation custom field toggle on registration
    const occSelect = $("#reg-occupation");
    const customOccWrapper = $("#custom-occupation-wrapper");
    if (occSelect && customOccWrapper) {
        occSelect.addEventListener("change", () => {
            if (occSelect.value === "Other") {
                customOccWrapper.classList.remove("hidden");
            } else {
                customOccWrapper.classList.add("hidden");
            }
        });
    }

    // Login / Register toggle
    $("#go-to-register").addEventListener("click", showRegisterPage);
    $("#go-to-login").addEventListener("click", showLoginPage);

    // Auth form submissions
    $("#login-form").addEventListener("submit", handleLogin);
    $("#register-form").addEventListener("submit", handleRegister);

    // Logout
    $("#logout-btn").addEventListener("click", handleLogout);

    // Edit profile
    $("#edit-profile-btn").addEventListener("click", handleEditProfile);

    // Search and filters
    $("#search-form").addEventListener("submit", (e) => {
        e.preventDefault();
        renderServices();
        smoothScrollTo("explore");
    });
    $("#search-input").addEventListener("input", renderServices);
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

    // Service detail events
    $("#close-detail").addEventListener("click", closeServiceDetail);
    $("#book-session-btn").addEventListener("click", bookSessionFromDetail);

    // Post service form
    $("#post-service-form").addEventListener("submit", handlePostService);

    // Navbar in-page smooth scroll
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const href = link.getAttribute("href");
            if (!href || !href.startsWith("#")) return;
            const id = href.slice(1);
            smoothScrollTo(id);
        });
    });

    // Footer year
    const yearEl = $("#year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // On load: check if user is already logged in
    const stored = loadUser();
    const loggedEmail = localStorage.getItem(LOGGED_IN_KEY);

    if (stored && loggedEmail && stored.email === loggedEmail) {
        currentUser = stored;
        showApp();
        populateProfile(currentUser);
        renderServices();
        renderSessions();
    } else {
        showLoginPage();
    }
});
