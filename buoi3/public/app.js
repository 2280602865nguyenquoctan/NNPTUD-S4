let state = {
  items: [],
  page: 1,
  limit: 5,
  title: "",
  sortKey: null,
  sortDir: "asc",
  total: -1,
  lastViewItems: []
};

const $ = (id) => document.getElementById(id);

function toast(msg, type = "info") {
  const area = $("toastArea");
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${type} border-0`;
  el.role = "alert";
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${msg}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  area.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 2500 });
  t.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

function debounce(fn, ms = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function applySort(arr) {
  if (!state.sortKey) return arr;
  const dir = state.sortDir === "asc" ? 1 : -1;

  return [...arr].sort((a, b) => {
    const va = a[state.sortKey];
    const vb = b[state.sortKey];

    if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
    return String(va ?? "").localeCompare(String(vb ?? "")) * dir;
  });
}

async function loadData() {
  $("pageNow").textContent = String(state.page);

  const params = new URLSearchParams({
    title: state.title,
    limit: String(state.limit),
    page: String(state.page),
  });

  $("meta").textContent = "Đang tải...";

  const res = await fetch(`/api/v1/products?${params.toString()}`);
  if (!res.ok) {
    $("meta").textContent = "Lỗi load";
    toast("Không load được dữ liệu", "danger");
    return;
  }

  const data = await res.json();
  state.items = data.items || [];
  state.total = data.total ?? -1;

  const viewItems = applySort(state.items);
  state.lastViewItems = viewItems;

  renderTable(viewItems);

  const totalText = state.total === -1 ? "Không rõ tổng (API)" : `Tổng sau filter: ${state.total}`;
  $("meta").textContent = `Hiển thị ${viewItems.length} item | ${totalText}`;
}

function renderTable(items) {
  const tbody = $("tbody");
  tbody.innerHTML = "";

  for (const p of items) {
    const tr = document.createElement("tr");
    tr.className = "clickable-row";
    tr.dataset.id = p.id;

    tr.setAttribute("data-bs-toggle", "tooltip");
    tr.setAttribute("data-bs-placement", "top");
    tr.setAttribute("title", p.description || "");

    const img0 = Array.isArray(p.images) && p.images.length ? p.images[0] : "";
    const categoryName = p.category?.name ?? "";

    tr.innerHTML = `
      <td class="nowrap">${p.id ?? ""}</td>
      <td>${escapeHtml(p.title ?? "")}</td>
      <td class="text-end nowrap">${p.price ?? ""}</td>
      <td class="nowrap">${escapeHtml(categoryName)}</td>
      <td class="nowrap">
        ${img0 ? `<img class="img-thumb" src="${img0}" alt="img" onerror="this.style.display='none'"/>` : ""}
      </td>
    `;

    tr.addEventListener("click", () => openDetail(p.id));
    tbody.appendChild(tr);
  }

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => new bootstrap.Tooltip(el));
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function openDetail(id) {
  const res = await fetch(`/api/v1/products/${id}`);
  if (!res.ok) return toast("Không load được detail", "danger");

  const p = await res.json();
  $("d_id").value = p.id ?? "";
  $("d_title").value = p.title ?? "";
  $("d_price").value = p.price ?? "";
  $("d_description").value = p.description ?? "";
  $("d_categoryId").value = p.category?.id ?? "";
  $("d_images").value = Array.isArray(p.images) ? p.images.join(", ") : "";

  new bootstrap.Modal(document.getElementById("detailModal")).show();
}

async function saveDetail() {
  const id = $("d_id").value;

  const payload = {
    title: $("d_title").value,
    price: Number($("d_price").value || 0),
    description: $("d_description").value,
    categoryId: Number($("d_categoryId").value || 1),
    images: $("d_images").value.split(",").map(s => s.trim()).filter(Boolean),
  };

  const res = await fetch(`/api/v1/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    return toast(`PUT lỗi: ${err}`, "danger");
  }

  toast("Cập nhật OK", "success");
  await loadData();
  bootstrap.Modal.getInstance(document.getElementById("detailModal")).hide();
}

async function createItem() {
  const payload = {
    title: $("c_title").value,
    price: Number($("c_price").value || 0),
    description: $("c_description").value,
    categoryId: Number($("c_categoryId").value || 1),
    images: $("c_images").value.split(",").map(s => s.trim()).filter(Boolean),
  };

  const res = await fetch(`/api/v1/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    return toast(`POST lỗi: ${err}`, "danger");
  }

  toast("Tạo OK", "success");
  await loadData();
  bootstrap.Modal.getInstance(document.getElementById("createModal")).hide();
}

function exportCSV() {
  const rows = state.lastViewItems || [];
  const headers = ["id", "title", "price", "category", "images"];
  const lines = [headers.join(",")];

  for (const p of rows) {
    lines.push([
      p.id ?? "",
      csvCell(p.title ?? ""),
      p.price ?? "",
      csvCell(p.category?.name ?? ""),
      csvCell(Array.isArray(p.images) ? p.images.join(" | ") : ""),
    ].join(","));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `products_page${state.page}_limit${state.limit}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(v) {
  const s = String(v).replaceAll('"', '""');
  return `"${s}"`;
}

// Events
$("pageSize").addEventListener("change", async (e) => {
  state.limit = Number(e.target.value);
  state.page = 1;
  await loadData();
});

$("btnReload").addEventListener("click", loadData);

$("prevPage").addEventListener("click", async () => {
  if (state.page > 1) {
    state.page--;
    await loadData();
  }
});

$("nextPage").addEventListener("click", async () => {
  state.page++;
  await loadData();
});

$("sortTitle").addEventListener("click", () => {
  if (state.sortKey === "title") state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
  state.sortKey = "title";
  renderTable(applySort(state.items));
});

$("sortPrice").addEventListener("click", () => {
  if (state.sortKey === "price") state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
  state.sortKey = "price";
  renderTable(applySort(state.items));
});

$("btnExport").addEventListener("click", exportCSV);
$("btnSaveDetail").addEventListener("click", saveDetail);
$("btnCreate").addEventListener("click", createItem);

$("searchTitle").addEventListener("input", debounce(async (e) => {
  state.title = e.target.value.trim();
  state.page = 1;
  await loadData();
}));

loadData();
