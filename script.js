function getHamburgerElements() {
	return {
		hamburger: document.getElementById("hamburger"),
		navLinks: document.getElementById("nav-links"),
		nav: document.getElementById("nav"),
	};
}

function setHamburgerOpen(isOpen) {
	const { hamburger, navLinks } = getHamburgerElements();
	if (!hamburger || !navLinks) return;
	hamburger.classList.toggle("open", isOpen);
	navLinks.classList.toggle("open", isOpen);
}

function toggleHamburger() {
	const { navLinks } = getHamburgerElements();
	if (!navLinks) return;
	setHamburgerOpen(!navLinks.classList.contains("open"));
}

function closeHamburger() {
	setHamburgerOpen(false);
}

document.addEventListener("DOMContentLoaded", () => {
	const { hamburger } = getHamburgerElements();
	if (hamburger) {
		hamburger.addEventListener("click", toggleHamburger);
	}
});

document.addEventListener("click", (event) => {
	const { nav, navLinks } = getHamburgerElements();
	if (!nav || !navLinks) return;
	if (!navLinks.classList.contains("open")) return;

	const target = event.target;
	if (nav.contains(target)) {
		if (target.closest("#nav-links a")) {
			closeHamburger();
		}
		return;
	}

	closeHamburger();
});

const btnGrid = document.getElementById("btn-grid");
const btnList = document.getElementById("btn-list");
const projects = document.getElementById("projects-container");

function setProjectsLayout(layout) {
	if (!projects) return;
	if (layout === "grid") {
		projects.classList.remove("list-layout");
		projects.classList.add("grid-layout");
		if (btnGrid) btnGrid.classList.add("active");
		if (btnList) btnList.classList.remove("active");
	} else {
		projects.classList.remove("grid-layout");
		projects.classList.add("list-layout");
		if (btnGrid) btnGrid.classList.remove("active");
		if (btnList) btnList.classList.add("active");
	}
	try {
		localStorage.setItem("projectsLayout", layout);
	} catch (e) {}
}

const saved = (() => {
	try {
		return localStorage.getItem("projectsLayout");
	} catch (e) {
		return null;
	}
})();
if (saved === "list" || saved === "grid") setLayout(saved);
