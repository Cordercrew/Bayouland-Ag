/* ---------------------------------------------------------------
   Bayouland Ag — shared interactions
   --------------------------------------------------------------- */
(function () {
  "use strict";

  /* ---- mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- header shrink on scroll ---- */
  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () {
      head.classList.toggle("shrink", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- scroll reveals ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && !reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* -------------------------------------------------------------
     ORDER CART
     Products declare data-product / data-unit on their quantity
     steppers. The cart lives in memory and renders into the
     summary + a hidden field that gets submitted with the form.
     ------------------------------------------------------------- */
  var cart = {};   // key -> { name, unit, qty }

  function money(v) { return v == null ? "" : v; }

  function renderCart() {
    var list = document.getElementById("summary-list");
    var hidden = document.getElementById("order-items");
    if (!list) return;

    var keys = Object.keys(cart).filter(function (k) { return cart[k].qty > 0; });
    if (!keys.length) {
      list.innerHTML = '<li class="empty">No items yet — add a jar or two above.</li>';
      if (hidden) hidden.value = "";
      return;
    }
    var html = "";
    var lines = [];
    keys.forEach(function (k) {
      var it = cart[k];
      var label = it.qty + " × " + it.name + (it.unit ? " (" + it.unit + ")" : "");
      html +=
        '<li><span>' + label + "</span>" +
        '<span class="x" data-remove="' + k + '" title="Remove" role="button" tabindex="0">✕</span></li>';
      lines.push(label);
    });
    list.innerHTML = html;
    if (hidden) hidden.value = lines.join("\n");

    list.querySelectorAll("[data-remove]").forEach(function (el) {
      var handler = function () {
        var key = el.getAttribute("data-remove");
        if (cart[key]) {
          cart[key].qty = 0;
          var input = document.querySelector('[data-product="' + key + '"] input');
          if (input) input.value = 0;
        }
        renderCart();
      };
      el.addEventListener("click", handler);
      el.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); handler(); }
      });
    });
  }

  function setQty(wrap, val) {
    var key = wrap.getAttribute("data-product");
    var name = wrap.getAttribute("data-name") || key;
    var unit = wrap.getAttribute("data-unit") || "";
    val = Math.max(0, Math.min(99, val | 0));
    var input = wrap.querySelector("input");
    if (input) input.value = val;
    cart[key] = { name: name, unit: unit, qty: val };
    renderCart();
  }

  document.querySelectorAll(".qty[data-product]").forEach(function (wrap) {
    var input = wrap.querySelector("input");
    wrap.querySelector('[data-act="minus"]').addEventListener("click", function () {
      setQty(wrap, (parseInt(input.value, 10) || 0) - 1);
    });
    wrap.querySelector('[data-act="plus"]').addEventListener("click", function () {
      setQty(wrap, (parseInt(input.value, 10) || 0) + 1);
    });
    input.addEventListener("change", function () {
      setQty(wrap, parseInt(input.value, 10) || 0);
    });
  });

  // "Order this" buttons on product cards jump to the form + ensure >=1
  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var key = btn.getAttribute("data-add");
      var wrap = document.querySelector('.qty[data-product="' + key + '"]');
      if (wrap) {
        var cur = parseInt(wrap.querySelector("input").value, 10) || 0;
        if (cur < 1) setQty(wrap, 1);
      }
    });
  });

  renderCart();

  /* -------------------------------------------------------------
     ORDER FORM SUBMISSION
     Uses a Formspree-style endpoint set in data-endpoint on the
     <form>. If it's still the placeholder, we fall back to a
     prefilled mailto: so nothing breaks before setup.
     ------------------------------------------------------------- */
  var form = document.getElementById("order-form");
  if (form) {
    var statusEl = document.getElementById("form-status");
    var setStatus = function (msg, cls) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = "form-status " + (cls || "");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var endpoint = form.getAttribute("data-endpoint") || "";
      var items = (document.getElementById("order-items") || {}).value || "";
      if (!items.trim()) {
        setStatus("Add at least one product above before sending your order.", "err");
        return;
      }

      var isPlaceholder = !endpoint || endpoint.indexOf("YOUR_FORM_ID") !== -1;
      if (isPlaceholder) {
        // graceful fallback: open email client with the order prefilled
        var fd = new FormData(form);
        var body =
          "New order request from the website\n\n" +
          "Name: " + (fd.get("name") || "") + "\n" +
          "Email: " + (fd.get("email") || "") + "\n" +
          "Phone: " + (fd.get("phone") || "") + "\n" +
          "Fulfillment: " + (fd.get("fulfillment") || "") + "\n\n" +
          "Items:\n" + items + "\n\n" +
          "Notes:\n" + (fd.get("notes") || "");
        var mail = form.getAttribute("data-fallback-email") || "orders@example.com";
        window.location.href =
          "mailto:" + mail +
          "?subject=" + encodeURIComponent("Website order — " + (fd.get("name") || "")) +
          "&body=" + encodeURIComponent(body);
        setStatus("Opening your email app to send the order… (Set up the form endpoint to send it automatically — see README.)", "ok");
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; }
      setStatus("Sending your order…", "");

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (r) {
          if (r.ok) {
            form.reset();
            Object.keys(cart).forEach(function (k) { cart[k].qty = 0; });
            document.querySelectorAll('.qty[data-product] input').forEach(function (i) { i.value = 0; });
            renderCart();
            setStatus("Order received — thank you! We'll be in touch shortly to confirm.", "ok");
          } else {
            setStatus("Something went wrong. Please email us directly and we'll sort it out.", "err");
          }
        })
        .catch(function () {
          setStatus("Couldn't reach the server. Please email us directly and we'll sort it out.", "err");
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Send order request"; }
        });
    });
  }

  /* footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
