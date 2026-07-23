(() => {
	"use strict";

	history.scrollRestoration = "manual";

	const STORAGE_KEY = "projectsLayout";

	// Centralized, silently-failing storage access — used in one place only.
	const storage = {
		get(key) {
			try {
				return localStorage.getItem(key);
			} catch {
				return null;
			}
		},
		set(key, value) {
			try {
				localStorage.setItem(key, value);
			} catch {
				/* storage unavailable (private mode, quota, etc.) — ignore */
			}
		},
	};

	function initHamburgerNav() {
		const hamburger = document.getElementById("hamburger");
		const navLinks = document.getElementById("nav-links");
		const nav = document.getElementById("nav");

		if (!hamburger || !navLinks || !nav) return;

		const isOpen = () => navLinks.classList.contains("open");

		const setOpen = (open) => {
			hamburger.classList.toggle("open", open);
			navLinks.classList.toggle("open", open);
			hamburger.setAttribute("aria-expanded", String(open));
		};

		hamburger.addEventListener("click", () => setOpen(!isOpen()));

		// Close on outside click, or when a nav link is clicked.
		document.addEventListener("click", (event) => {
			if (!isOpen()) return;

			const target = event.target;
			if (nav.contains(target)) {
				if (target.closest("#nav-links a")) setOpen(false);
				return;
			}
			setOpen(false);
		});

		// Close on Escape — standard expected behavior for dismissible menus.
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && isOpen()) setOpen(false);
		});
	}

	function initProjectsLayout() {
		const btnGrid = document.getElementById("btn-grid");
		const btnList = document.getElementById("btn-list");
		const projects = document.getElementById("projects-container");

		if (!projects) return;

		const setLayout = (layout) => {
			const isGrid = layout !== "list";
			projects.classList.toggle("grid-layout", isGrid);
			projects.classList.toggle("list-layout", !isGrid);
			btnGrid?.classList.toggle("active", isGrid);
			btnList?.classList.toggle("active", !isGrid);
			storage.set(STORAGE_KEY, isGrid ? "grid" : "list");
		};

		btnGrid?.addEventListener("click", () => setLayout("grid"));
		btnList?.addEventListener("click", () => setLayout("list"));

		const saved = storage.get(STORAGE_KEY);
		setLayout(saved === "list" ? "list" : "grid");
	}

	function initProjectTabs() {
		document.querySelectorAll(".proj-tabs").forEach((group) => {
			const panels = group.querySelectorAll(".proj-tab-panel");
			if (!panels.length) return;

			const activate = (id, { updateHash = true } = {}) => {
				const input = group.querySelector(`#${CSS.escape(id)}`);
				if (!input) return false;

				input.checked = true;
				panels.forEach((panel) => {
					panel.classList.toggle("is-active", panel.dataset.tab === id);
				});

				if (updateHash) history.replaceState(null, "", `#${id}`);
				return true;
			};

			group.querySelectorAll(".proj-tab-input").forEach((input) => {
				input.addEventListener("change", () => activate(input.id));
			});

			const applyHash = () => {
				const hashId = decodeURIComponent(location.hash.replace(/^#/, ""));
				if (!hashId || !activate(hashId, { updateHash: false })) {
					const checked = group.querySelector(".proj-tab-input:checked");
					if (checked) activate(checked.id, { updateHash: false });
				}
			};

			applyHash();
			window.addEventListener("hashchange", applyHash);
		});
	}

	document.addEventListener("DOMContentLoaded", () => {
		initHamburgerNav();
		initProjectsLayout();
		initProjectTabs();
	});
})();
