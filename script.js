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

	function initTabScrollFades() {
		document.querySelectorAll(".proj-tab-scroll").forEach((scrollContainer) => {
			const list = scrollContainer.querySelector(".proj-tab-list");
			if (!list) return;

			const updateFadeState = () => {
				const maxScrollLeft = list.scrollWidth - list.clientWidth;
				const canScrollLeft = list.scrollLeft > 1;
				const canScrollRight = maxScrollLeft > 1 && list.scrollLeft < maxScrollLeft - 1;

				scrollContainer.classList.toggle("is-scrollable-left", canScrollLeft);
				scrollContainer.classList.toggle("is-scrollable-right", canScrollRight);
			};

			updateFadeState();
			list.addEventListener("scroll", updateFadeState, { passive: true });
			window.addEventListener("resize", updateFadeState);
		});
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

	function initGalleryLightbox() {
		const thumbs = document.querySelectorAll(".proj-gallery-item img");
		if (!thumbs.length) return;

		const lightbox = document.createElement("div");
		lightbox.className = "lightbox";
		lightbox.setAttribute("role", "dialog");
		lightbox.setAttribute("aria-modal", "true");
		lightbox.setAttribute("aria-hidden", "true");
		lightbox.innerHTML = `
			<button class="lightbox-close" aria-label="Close image">&times;</button>
			<img class="lightbox-img" alt="" />
			<p class="lightbox-caption"></p>
		`;
		document.body.append(lightbox);

		const closeBtn = lightbox.querySelector(".lightbox-close");
		const img = lightbox.querySelector(".lightbox-img");
		const caption = lightbox.querySelector(".lightbox-caption");
		let activeThumb = null;

		// FLIP: measure the thumbnail, drop the full image in place, invert it
		// onto the thumbnail's rect, then transition that inversion away.
		const open = (thumb) => {
			activeThumb = thumb;
			const first = thumb.getBoundingClientRect();
			const captionText =
				thumb.closest(".proj-gallery-item")?.querySelector(".proj-gallery-caption")
					?.textContent ?? "";

			img.src = thumb.currentSrc || thumb.src;
			img.alt = thumb.alt;
			caption.textContent = captionText;
			lightbox.classList.add("is-open");
			lightbox.setAttribute("aria-hidden", "false");
			document.body.style.overflow = "hidden";

			const runFlip = () => {
				const last = img.getBoundingClientRect();
				const dx = first.left - last.left;
				const dy = first.top - last.top;
				const scale = first.width / last.width;

				img.style.transition = "none";
				img.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
				img.getBoundingClientRect(); // force the start position to commit

				requestAnimationFrame(() => {
					lightbox.classList.add("is-visible");
					img.style.transition = "transform .35s cubic-bezier(.2,.8,.2,1)";
					img.style.transform = "";
				});
			};

			// currentSrc may already be cached — only wait on `load` if it isn't.
			if (img.complete) {
				requestAnimationFrame(runFlip);
			} else {
				img.addEventListener("load", () => requestAnimationFrame(runFlip), { once: true });
			}

			closeBtn.focus();
		};

		const close = () => {
			if (!activeThumb) return;
			const first = activeThumb.getBoundingClientRect();
			const last = img.getBoundingClientRect();
			const dx = first.left - last.left;
			const dy = first.top - last.top;
			const scale = first.width / last.width;

			lightbox.classList.remove("is-visible");
			lightbox.setAttribute("aria-hidden", "true");
			img.style.transition = "transform .3s ease";
			img.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;

			const thumbRef = activeThumb;
			activeThumb = null;

			img.addEventListener(
				"transitionend",
				function done() {
					lightbox.classList.remove("is-open");
					img.style.transform = "";
					img.removeAttribute("src");
					document.body.style.overflow = "";
					thumbRef.focus();
				},
				{ once: true }
			);
		};

		document.addEventListener("click", (event) => {
			const thumb = event.target.closest(".proj-gallery-item img");
			if (thumb) {
				open(thumb);
				return;
			}
			if (event.target === lightbox || event.target === closeBtn) close();
		});

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && lightbox.classList.contains("is-open")) close();
		});
	}

	document.addEventListener("DOMContentLoaded", () => {
		initHamburgerNav();
		initProjectsLayout();
		initTabScrollFades();
		initProjectTabs();
		initGalleryLightbox();
	});
})();