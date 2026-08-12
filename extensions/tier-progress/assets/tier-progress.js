(() => {
  let timer = null;

  const money = (amount) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: window.Shopify?.currency?.active || "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (e) {
      return `$${Math.round(amount)}`;
    }
  };

  const pct = (current, target) => {
    if (!target || target <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
  };

  const setBar = (fill, progress, complete) => {
    if (!fill) return;
    fill.style.width = `${progress}%`;
    fill.classList.toggle("is-complete", complete);
    if (fill.parentElement) {
      fill.parentElement.setAttribute("aria-valuenow", String(progress));
    }
  };

  const render = (root, total) => {
    if (root.dataset.hasRules !== "true") return;

    const threshold = Number(root.dataset.threshold || 0);
    const giftAt = Number(root.dataset.giftThreshold || 0);
    const percent = Number(root.dataset.discountPct || 0);
    const discountDone = total >= threshold && threshold > 0;
    const giftDone = total >= giftAt && giftAt > 0;

    const label = root.querySelector("[data-label-discount]");
    const statusDiscount = root.querySelector("[data-status-discount]");
    const statusGift = root.querySelector("[data-status-gift]");

    if (label) label.textContent = `Discount ${Math.round(percent)}%`;
    setBar(root.querySelector("[data-fill-discount]"), pct(total, threshold), discountDone);
    setBar(root.querySelector("[data-fill-gift]"), pct(total, giftAt), giftDone);

    if (statusDiscount) {
      statusDiscount.textContent = discountDone
        ? "Unlocked"
        : `${money(Math.max(0, threshold - total))} to go`;
      statusDiscount.classList.toggle("is-complete", discountDone);
    }
    if (statusGift) {
      statusGift.textContent = giftDone
        ? "Unlocked"
        : `${money(Math.max(0, giftAt - total))} to go`;
      statusGift.classList.toggle("is-complete", giftDone);
    }
  };

  const renderAll = (total) => {
    document.querySelectorAll(".tier-progress").forEach((root) => {
      render(root, total);
    });
  };

  const cartAmount = (cart) => {
    // Pre-discount subtotal (matches Functions thresholds).
    if (typeof cart.items_subtotal_price === "number") {
      return cart.items_subtotal_price / 100;
    }
    if (typeof cart.original_total_price === "number") {
      return cart.original_total_price / 100;
    }
    if (typeof cart.total_price === "number") {
      return cart.total_price / 100;
    }
    return 0;
  };

  const refresh = async () => {
    try {
      const res = await fetch("/cart.js", { credentials: "same-origin" });
      const cart = res.ok ? await res.json() : null;
      if (cart) {
        renderAll(cartAmount(cart));
      }
    } catch {
      // ignore cart refresh errors
    }
  };

  const scheduleRefresh = () => {
    clearTimeout(timer);
    // Drawer often updates after /cart/* returns
    timer = setTimeout(refresh, 150);
    setTimeout(refresh, 500);
    setTimeout(refresh, 1200);
  };

  const cartUrl = (url) => {
    try {
      return /\/cart(\/|$)/.test(new URL(url, location.origin).pathname);
    } catch (e) {
      return /\/cart(\/|$)/.test(String(url));
    }
  };

  const isCartWrite = (url, method) => {
    if (!cartUrl(url)) return false;
    let path = "";
    try {
      path = new URL(url, location.origin).pathname;
    } catch (e) {
      path = String(url);
    }
    if ((path === "/cart.js" || path === "/cart.json") && method === "GET") return false;
    return method !== "GET" && method !== "HEAD"
      ? true
      : /\/cart\/(add|change|update|clear)/.test(path);
  };

  // fetch()
  if (!window.__tierProgressFetchPatched) {
    window.__tierProgressFetchPatched = true;
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : (input && input.url) || "";
      const method = String(
        (init && init.method) || (input && input.method) || "GET",
      ).toUpperCase();
      const watch = isCartWrite(url, method);

      return nativeFetch(input, init).then((response) => {
        if (watch) scheduleRefresh();
        return response;
      });
    };
  }

  // XMLHttpRequest (older themes / some cart drawers)
  // Keep `function` here for `this` + `arguments` on the prototype.
  if (!window.__tierProgressXhrPatched && window.XMLHttpRequest) {
    window.__tierProgressXhrPatched = true;
    const xo = XMLHttpRequest.prototype.open;
    const xs = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) {
      this.__tierCartWatch = {
        method: String(method || "GET").toUpperCase(),
        url: String(url || ""),
      };
      return xo.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function () {
      const req = this;
      if (
        req.__tierCartWatch &&
        isCartWrite(req.__tierCartWatch.url, req.__tierCartWatch.method)
      ) {
        req.addEventListener("loadend", scheduleRefresh);
      }
      return xs.apply(this, arguments);
    };
  }

  // Non-AJAX form posts to /cart/add
  if (!window.__tierProgressSubmitPatched) {
    window.__tierProgressSubmitPatched = true;
    document.addEventListener(
      "submit",
      (event) => {
        const form = event.target;
        if (!form || !form.getAttribute) return;
        const action = form.getAttribute("action") || form.action || "";
        if (cartUrl(action)) scheduleRefresh();
      },
      true,
    );
  }

  // Common theme custom events
  if (!window.__tierProgressEventsPatched) {
    window.__tierProgressEventsPatched = true;
    [
      "cart:updated",
      "cart:change",
      "cart:refresh",
      "theme:cart:change",
      "ajaxProduct:added",
      "product-ajax:added",
    ].forEach((name) => {
      document.addEventListener(name, scheduleRefresh);
    });
  }

  const boot = () => {
    document.querySelectorAll(".tier-progress").forEach((root) => {
      render(root, Number(root.dataset.cartTotal || 0));
    });
    refresh();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refresh();
  });
})();
