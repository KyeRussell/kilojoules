(() => {
  const STORAGE_KEY = "kilojoules.comparisons";

  const kjInput = document.getElementById("kj");
  const list = document.getElementById("comparisons");
  const empty = document.getElementById("empty");
  const editToggle = document.getElementById("edit-toggle");
  const addForm = document.getElementById("add-form");

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

        const name = document.createElement("div");
        name.className = "comparison-name";
        name.textContent = item.name;

        const kj = document.createElement("div");
        kj.className = "comparison-kj";
        kj.textContent = `${numberFormat.format(item.kj)} kJ each`;

        info.append(name, kj);

        const count = document.createElement("div");
        count.className = "comparison-count";
        if (burned === null) {
          count.classList.add("is-empty");
          count.textContent = "–";
        } else {
          count.textContent = `× ${formatCount(burned / item.kj)}`;
        }

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete-button";
        remove.textContent = "×";
        remove.setAttribute("aria-label", `Remove ${item.name}`);
        remove.addEventListener("click", () => {
          if (!confirm(`Remove "${item.name}"?`)) return;
          comparisons = comparisons.filter((c) => c.id !== item.id);
          saveComparisons(comparisons);
          render();
        });

        li.append(info, count, remove);
        return li;
      })
    );

    empty.hidden = comparisons.length > 0;
    editToggle.hidden = comparisons.length === 0;
    if (comparisons.length === 0) setEditing(false);
  }

  function setEditing(on) {
    list.classList.toggle("is-editing", on);
    editToggle.setAttribute("aria-pressed", String(on));
    editToggle.textContent = on ? "Done" : "Edit";
  }

  kjInput.addEventListener("input", render);

  editToggle.addEventListener("click", () => {
    setEditing(!list.classList.contains("is-editing"));
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

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
