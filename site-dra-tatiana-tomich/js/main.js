(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};

  function whatsappUrl(message) {
    return "https://wa.me/" + config.whatsapp + "?text=" + encodeURIComponent(message);
  }

  /* Links de contato a partir da configuração ------------------------------ */
  function applyConfig() {
    if (config.whatsapp) {
      document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
        a.href = whatsappUrl(config.whatsappGreeting || "");
      });
    }
    var links = { "[data-instagram]": config.instagram, "[data-reviews]": config.googleReviews, "[data-maps]": config.mapsUrl, "[data-waze]": config.wazeUrl };
    Object.keys(links).forEach(function (selector) {
      if (!links[selector]) return;
      document.querySelectorAll(selector).forEach(function (a) { a.href = links[selector]; });
    });

    if (config.email) {
      document.querySelectorAll("[data-email-item]").forEach(function (li) {
        var a = li.querySelector("[data-email]");
        a.href = "mailto:" + config.email;
        a.textContent = config.email;
        li.hidden = false;
      });
    }

    var registry = [config.crm && "CRM " + config.crm, config.rqe && "RQE " + config.rqe].filter(Boolean).join(" · ");
    if (registry) {
      document.querySelectorAll("[data-registry]").forEach(function (el) {
        el.textContent = registry;
        el.hidden = false;
      });
    }

    var year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* Header e barra móvel ---------------------------------------------------- */
  function initScrollState() {
    var header = document.querySelector("[data-header]");
    var bar = document.querySelector("[data-mobile-bar]");
    var hero = document.querySelector(".hero");
    var cta = document.querySelector("#agendar");
    var ctaVisible = false;

    function update() {
      var y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 12);
      if (bar && hero) {
        var pastHero = y > hero.offsetHeight * 0.75;
        bar.classList.toggle("is-visible", pastHero && !ctaVisible);
      }
    }

    // Esconde a barra quando o formulário final já está na tela
    if ("IntersectionObserver" in window && cta) {
      new IntersectionObserver(function (entries) {
        ctaVisible = entries[0].isIntersecting;
        update();
      }, { threshold: 0.15 }).observe(cta);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* Menu móvel --------------------------------------------------------------- */
  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav]");
    var header = document.querySelector("[data-header]");
    var label = toggle.querySelector(".sr-only");
    var mobileQuery = window.matchMedia("(max-width: 960px)");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      label.textContent = open ? "Fechar menu" : "Abrir menu";
      nav.classList.toggle("is-open", open);
      header.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    mobileQuery.addEventListener("change", function (e) { if (!e.matches) setOpen(false); });
  }

  /* Entrada suave dos elementos -------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* Formulário de pré-agendamento → WhatsApp ------------------------------- */
  function initBookingForm() {
    var form = document.querySelector("[data-booking-form]");
    if (!form) return;
    var status = form.querySelector("[data-form-status]");
    var submit = form.querySelector("button[type=submit]");
    var submitLabel = form.querySelector("[data-submit-label]");

    var rules = {
      nome: function (el) {
        var value = el.value.trim();
        if (!value) return "Informe o seu nome.";
        if (value.length < 3) return "O nome precisa ter pelo menos 3 letras.";
        return "";
      },
      motivo: function (el) { return el.value ? "" : "Selecione o motivo da consulta."; },
      consentimento: function (el) { return el.checked ? "" : "É preciso concordar para enviar os dados."; },
    };

    function validateField(name) {
      var el = form.elements[name];
      var message = rules[name](el);
      var error = document.getElementById(name + "-erro");
      error.textContent = message;
      el.setAttribute("aria-invalid", message ? "true" : "false");
      return !message;
    }

    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "blur", function () {
        if (el.getAttribute("aria-invalid") !== null || el.value) validateField(name);
      });
    });

    function setStatus(text, type, link) {
      status.className = "form-status" + (type ? " is-" + type : "");
      status.textContent = text;
      if (link) {
        status.appendChild(document.createTextNode(" "));
        var a = document.createElement("a");
        a.href = link;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Abrir o WhatsApp";
        status.appendChild(a);
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      setStatus("");

      var invalid = Object.keys(rules).filter(function (name) { return !validateField(name); });
      if (invalid.length) {
        form.elements[invalid[0]].focus();
        setStatus("Revise os campos destacados.", "error");
        return;
      }

      if (!config.whatsapp) {
        setStatus("O agendamento online está indisponível no momento. Tente novamente mais tarde.", "error");
        return;
      }

      var data = new FormData(form);
      var message =
        "Olá! Vim pelo site e gostaria de agendar uma consulta com a Dra. Tatiana Tomich.\n\n" +
        "Nome: " + data.get("nome").trim() + "\n" +
        "Motivo: " + data.get("motivo") + "\n" +
        "Melhor período: " + data.get("periodo");
      var url = whatsappUrl(message);

      submit.disabled = true;
      submitLabel.textContent = "Abrindo o WhatsApp…";

      // Com "noopener" o navegador não informa se a janela abriu,
      // por isso o link manual fica sempre disponível.
      window.open(url, "_blank", "noopener");
      setStatus("Mensagem pronta! Revise e envie no WhatsApp. Se ele não abriu,", "success", url);

      setTimeout(function () {
        submit.disabled = false;
        submitLabel.textContent = "Enviar pelo WhatsApp";
      }, 1500);
    });
  }

  applyConfig();
  initScrollState();
  initMenu();
  initReveal();
  initBookingForm();
})();
