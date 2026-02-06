const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static
app.use("/public", express.static(path.join(__dirname, "public")));

// view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const port = 3000;
const BASE_URL = "https://api.escuelajs.co/api/v1/products";

// helper fetch
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) return { ok: false, status: res.status, data };
  return { ok: true, status: res.status, data };
}

// ====== View ======
app.get("/", (req, res) => {
  res.render("index");
});

// ====== API Proxy ======
// GET list: ?title=...&limit=5&page=1
app.get("/api/v1/products", async (req, res) => {
  const titleQ = req.query.title ? String(req.query.title).trim() : "";
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  const page = req.query.page ? Number(req.query.page) : 1;
  const offset = (page - 1) * limit;

  // Nếu có search title -> fetch 200 item rồi filter + paginate
  if (titleQ) {
    const bigUrl = `${BASE_URL}?offset=0&limit=200`;
    const r = await fetchJSON(bigUrl);
    if (!r.ok) return res.status(r.status).send(r.data);

    const filtered = (r.data || []).filter((p) =>
      (p.title || "").toLowerCase().includes(titleQ.toLowerCase())
    );

    const total = filtered.length;
    const pageItems = filtered.slice(offset, offset + limit);
    return res.send({ items: pageItems, total });
  }

  // Không search -> lấy đúng trang
  const url = `${BASE_URL}?offset=${offset}&limit=${limit}`;
  const r = await fetchJSON(url);
  if (!r.ok) return res.status(r.status).send(r.data);

  // total không rõ (API không trả total)
  return res.send({ items: r.data, total: -1 });
});

// GET detail
app.get("/api/v1/products/:id", async (req, res) => {
  const id = req.params.id;
  const r = await fetchJSON(`${BASE_URL}/${id}`);
  if (!r.ok) return res.status(r.status).send(r.data);
  res.send(r.data);
});

// POST create
app.post("/api/v1/products", async (req, res) => {
  const r = await fetchJSON(`${BASE_URL}/`, {
    method: "POST",
    body: JSON.stringify(req.body),
  });
  if (!r.ok) return res.status(r.status).send(r.data);
  res.send(r.data);
});

// PUT update
app.put("/api/v1/products/:id", async (req, res) => {
  const id = req.params.id;
  const r = await fetchJSON(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(req.body),
  });
  if (!r.ok) return res.status(r.status).send(r.data);
  res.send(r.data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
