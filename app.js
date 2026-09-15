(() => {
  const STORAGE_KEY = "kilojoules.comparisons";

  const kjInput = document.getElementById("kj");
  const results = document.getElementById("results");
  const list = document.getElementById("comparisons");
  const empty = document.getElementById("empty");
  const editToggle = document.getElementById("edit-toggle");
  const addForm = document.getElementById("add-form");
  const clearButton = document.getElementById("clear");

  const numberFormat = new Intl.NumberFormat("en-AU");

  function loadComparisons() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveComparisons(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function parseKj(value) {
    const cleaned = String(value).replace(/[^0-9.]/g, "");
    const number = parseFloat(cleaned);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function formatCount(count) {
    let decimals = 0;
    if (count < 1) decimals = 2;
    else if (count < 10) decimals = 1;
    return count.toLocaleString("en-AU", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  let comparisons = loadComparisons();

  function render() {
    const burned = parseKj(kjInput.value);
    const sorted = [...comparisons].sort((a, b) => a.kj - b.kj);

    list.replaceChildren(
      ...sorted.map((item) => {
        const li = document.createElement("li");
        li.dataset.id = item.id;

        const info = document.createElement("div");
        info.className = "comparison-info";

        const count = document.createElement("span");
        count.className = "comparison-count";
        count.hidden = burned === null;

        const name = document.createElement("span");
        name.className = "comparison-name";

        name.textContent = item.name;
        if (burned !== null) {
          count.textContent = `${formatCount(burned / item.kj)} ×`;
        }

        info.append(count, " ", name);

        const kj = document.createElement("div");
        kj.className = "comparison-kj";
        kj.textContent = `${numberFormat.format(item.kj)} kJ`;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete-button";
        remove.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
        remove.setAttribute("aria-label", `Remove ${item.name}`);
        remove.addEventListener("click", () => {
          if (!confirm(`Remove "${item.name}"?`)) return;
          comparisons = comparisons.filter((c) => c.id !== item.id);
          saveComparisons(comparisons);
          render();
        });

        li.append(info, kj, remove);
        return li;
      })
    );

    clearButton.hidden = kjInput.value === "";
    const editing = results.classList.contains("is-editing");
    results.hidden = burned === null && comparisons.length > 0 && !editing;
    empty.hidden = comparisons.length > 0;
    editToggle.hidden = comparisons.length === 0;
    if (comparisons.length === 0) setEditing(true);
  }

  function setEditing(on) {
    results.classList.toggle("is-editing", on);
    editToggle.setAttribute("aria-pressed", String(on));
    editToggle.textContent = on ? "Done" : "Edit";
  }

  kjInput.addEventListener("input", render);

  clearButton.addEventListener("click", () => {
    kjInput.value = "";
    render();
  });

  editToggle.addEventListener("click", () => {
    setEditing(!results.classList.contains("is-editing"));
    render();
  });

  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = addForm.elements.name.value.trim();
    const kj = parseKj(addForm.elements.kj.value);
    if (!name || kj === null) {
      addForm.elements.kj.focus();
      return;
    }
    comparisons.push({
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      name,
      kj,
    });
    saveComparisons(comparisons);
    addForm.reset();
    addForm.elements.name.blur();
    render();
  });

  render();

  // iOS has no install prompt API, so explain how to install when running
  // in Safari on an iPhone or iPad rather than from the home screen.
  const installDialog = document.getElementById("install-dialog");
  const installNever = document.getElementById("install-never");
  const HINT_KEY = "kilojoules.installHintDismissed";
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = navigator.standalone === true ||
    matchMedia("(display-mode: standalone)").matches;
  if (isIOS && !isStandalone && !localStorage.getItem(HINT_KEY) && installDialog.showModal) {
    installDialog.showModal();
  }
  installNever.addEventListener("change", () => {
    if (installNever.checked) localStorage.setItem(HINT_KEY, "1");
    else localStorage.removeItem(HINT_KEY);
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
