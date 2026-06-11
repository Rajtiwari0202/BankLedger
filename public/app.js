const state = {
  token: localStorage.getItem("bankledger_token"),
  user: null,
  accounts: [],
  transactions: [],
  activeView: "dashboard",
};

const API_BASE_URL = (window.BANKLEDGER_CONFIG?.API_BASE_URL || "").replace(/\/$/, "");

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const els = {
  authGate: document.getElementById("authGate"),
  appPanel: document.getElementById("appPanel"),
  sessionName: document.getElementById("sessionName"),
  sessionEmail: document.getElementById("sessionEmail"),
  toast: document.getElementById("toast"),
  viewTitle: document.getElementById("viewTitle"),
};

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.add("hidden"), 3500);
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function api(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function shortId(id) {
  return id ? `${id.slice(0, 8)}...${id.slice(-6)}` : "Unknown";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "-";
}

function isOwnAccount(accountOrId) {
  const id = typeof accountOrId === "string" ? accountOrId : accountOrId?._id;
  return state.accounts.some((account) => account._id === id);
}

function transactionDirection(transaction) {
  return isOwnAccount(transaction.toAccount) ? "Credit" : "Debit";
}

function counterparty(transaction) {
  const cp = transactionDirection(transaction) === "Credit" ? transaction.fromAccount : transaction.toAccount;
  return cp?.user?.name || cp?.user?.email || shortId(cp?._id);
}

function setAuthed(isAuthed) {
  els.authGate.classList.toggle("hidden", isAuthed);
  els.appPanel.classList.toggle("hidden", !isAuthed);
  document.getElementById("logoutBtn").disabled = !isAuthed;
  document.getElementById("createAccountBtn").disabled = !isAuthed;
  document.getElementById("refreshBtn").disabled = !isAuthed;
}

function populateAccountSelects() {
  const options = state.accounts
    .map((account) => `<option value="${account._id}">${shortId(account._id)} - ${money.format(account.balance)} - ${account.status}</option>`)
    .join("");

  document.querySelector("#transferForm select[name='fromAccount']").innerHTML = options;
  document.querySelector("#statementForm select[name='accountId']").innerHTML = options;
  document.getElementById("ledgerAccountFilter").innerHTML = options;
  document.getElementById("historyAccountFilter").innerHTML = `<option value="">All accounts</option>${options}`;
}

function renderDashboard() {
  const totalBalance = state.accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
  const activeAccounts = state.accounts.filter((account) => account.status === "ACTIVE").length;
  const riskFlags = state.accounts.filter((account) => account.status !== "ACTIVE").length;

  document.getElementById("metricBalance").textContent = money.format(totalBalance);
  document.getElementById("metricAccounts").textContent = String(activeAccounts);
  document.getElementById("metricTransactions").textContent = String(state.transactions.length);
  document.getElementById("metricRisk").textContent = String(riskFlags);

  const maxBalance = Math.max(...state.accounts.map((account) => Math.abs(account.balance || 0)), 1);
  document.getElementById("balanceBars").innerHTML = state.accounts.length
    ? state.accounts
        .map((account) => {
          const width = Math.max((Math.abs(account.balance || 0) / maxBalance) * 100, 4);
          return `
            <div class="bar-row">
              <div class="bar-meta">
                <strong>${shortId(account._id)}</strong>
                <span>${money.format(account.balance || 0)}</span>
              </div>
              <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
            </div>
          `;
        })
        .join("")
    : `<p class="muted">No accounts yet.</p>`;

  document.getElementById("recentList").innerHTML = state.transactions.slice(0, 5).length
    ? state.transactions
        .slice(0, 5)
        .map((transaction) => `
          <div class="activity-item">
            <div>
              <strong>${transactionDirection(transaction)}</strong>
              <div class="muted">${counterparty(transaction)} - ${formatDate(transaction.createdAt)}</div>
            </div>
            <span>${money.format(transaction.amount)}</span>
          </div>
        `)
        .join("")
    : `<p class="muted">No transaction activity yet.</p>`;
}

function renderAccounts() {
  document.getElementById("accountGrid").innerHTML = state.accounts.length
    ? state.accounts
        .map((account) => `
          <article class="account-card">
            <div class="panel-head">
              <h2>${account.currency} account</h2>
              <span class="status ${account.status}">${account.status}</span>
            </div>
            <strong class="balance">${money.format(account.balance || 0)}</strong>
            <code title="${account._id}">${account._id}</code>
            <div class="card-actions">
              <button class="ghost" data-status="ACTIVE" data-account="${account._id}">Activate</button>
              <button class="ghost" data-status="FROZEN" data-account="${account._id}">Freeze</button>
              <button class="ghost" data-status="CLOSED" data-account="${account._id}">Close</button>
            </div>
          </article>
        `)
        .join("")
    : `<section class="panel"><h2>No accounts found</h2><p class="muted">Create an account to start ledger-backed banking operations.</p></section>`;
}

function renderTransactions() {
  const rows = state.transactions.map((transaction) => `
    <tr>
      <td>${formatDate(transaction.createdAt)}</td>
      <td>${transactionDirection(transaction)}</td>
      <td>${money.format(transaction.amount)}</td>
      <td><span class="status ${transaction.status}">${transaction.status}</span></td>
      <td>${counterparty(transaction)}</td>
      <td title="${transaction.idempotencyKey}">${shortId(transaction.idempotencyKey)}</td>
    </tr>
  `);

  document.getElementById("transactionRows").innerHTML = rows.join("") || `
    <tr><td colspan="6" class="muted">No transactions found.</td></tr>
  `;
}

async function renderLedger(accountId = document.getElementById("ledgerAccountFilter").value) {
  const target = document.getElementById("ledgerRows");

  if (!accountId) {
    target.innerHTML = `<p class="muted">Create an account to inspect ledger entries.</p>`;
    return;
  }

  const data = await api(`/api/accounts/${accountId}/ledger?limit=50`);
  target.innerHTML = data.entries.length
    ? data.entries
        .map((entry) => `
          <div class="ledger-item">
            <div>
              <strong>${entry.type}</strong>
              <div class="muted">${formatDate(entry.createdAt)} - Tx ${shortId(entry.transaction?._id || entry.transaction)}</div>
            </div>
            <span>${money.format(entry.amount)}</span>
          </div>
        `)
        .join("")
    : `<p class="muted">No ledger entries for this account.</p>`;
}

function renderAll() {
  populateAccountSelects();
  renderDashboard();
  renderAccounts();
  renderTransactions();
  renderLedger().catch((error) => showToast(error.message));
}

async function loadApp() {
  if (!state.token) {
    setAuthed(false);
    return;
  }

  try {
    const [me, accounts, transactions] = await Promise.all([
      api("/api/auth/me"),
      api("/api/accounts"),
      api("/api/transactions?limit=50"),
    ]);

    state.user = me.user;
    state.accounts = accounts.accounts || [];
    state.transactions = transactions.transactions || [];

    els.sessionName.textContent = state.user.name;
    els.sessionEmail.textContent = state.user.email;
    setAuthed(true);
    renderAll();
  } catch (error) {
    localStorage.removeItem("bankledger_token");
    state.token = null;
    setAuthed(false);
    showToast(error.message);
  }
}

async function handleAuth(path, form) {
  const data = await api(path, {
    method: "POST",
    body: JSON.stringify(formData(form)),
  });

  state.token = data.token;
  localStorage.setItem("bankledger_token", data.token);
  form.reset();
  await loadApp();
  showToast(data.message);
}

function switchView(view) {
  state.activeView = view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((panel) => {
    panel.classList.toggle("active", panel.id === view);
  });
  els.viewTitle.textContent = document.querySelector(`[data-view="${view}"]`).textContent;
}

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await handleAuth("/api/auth/login", event.currentTarget);
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await handleAuth("/api/auth/register", event.currentTarget);
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch (error) {
    showToast(error.message);
  } finally {
    localStorage.removeItem("bankledger_token");
    state.token = null;
    state.user = null;
    state.accounts = [];
    state.transactions = [];
    els.sessionName.textContent = "Guest";
    els.sessionEmail.textContent = "Not authenticated";
    setAuthed(false);
  }
});

document.getElementById("refreshBtn").addEventListener("click", () => {
  loadApp().then(() => showToast("Console refreshed")).catch((error) => showToast(error.message));
});

document.getElementById("createAccountBtn").addEventListener("click", async () => {
  try {
    const data = await api("/api/accounts", { method: "POST", body: "{}" });
    showToast(data.message);
    await loadApp();
  } catch (error) {
    showToast(error.message);
  }
});

document.querySelector(".nav").addEventListener("click", (event) => {
  if (event.target.matches(".nav-item")) {
    switchView(event.target.dataset.view);
  }
});

document.getElementById("accountGrid").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-status]");

  if (!button) return;

  try {
    const data = await api(`/api/accounts/${button.dataset.account}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: button.dataset.status }),
    });
    showToast(data.message);
    await loadApp();
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById("generateKeyBtn").addEventListener("click", () => {
  document.querySelector("#transferForm input[name='idempotencyKey']").value = `web-${crypto.randomUUID()}`;
});

document.getElementById("transferForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = formData(event.currentTarget);
    payload.amount = Number(payload.amount);

    const data = await api("/api/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    event.currentTarget.reset();
    showToast(data.message);
    await loadApp();
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById("historyAccountFilter").addEventListener("change", async (event) => {
  try {
    const suffix = event.target.value ? `&accountId=${event.target.value}` : "";
    const data = await api(`/api/transactions?limit=50${suffix}`);
    state.transactions = data.transactions || [];
    renderDashboard();
    renderTransactions();
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById("ledgerAccountFilter").addEventListener("change", (event) => {
  renderLedger(event.target.value).catch((error) => showToast(error.message));
});

document.getElementById("statementForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const values = formData(event.currentTarget);
    const params = new URLSearchParams();
    if (values.from) params.set("from", values.from);
    if (values.to) params.set("to", values.to);

    const data = await api(`/api/accounts/${values.accountId}/statement?${params.toString()}`);
    const summary = data.summary;

    document.getElementById("statementResult").innerHTML = `
      <section class="statement-summary">
        <article><span class="muted">Opening</span><strong>${money.format(summary.openingBalance)}</strong></article>
        <article><span class="muted">Credits</span><strong>${money.format(summary.totalCredits)}</strong></article>
        <article><span class="muted">Debits</span><strong>${money.format(summary.totalDebits)}</strong></article>
        <article><span class="muted">Closing</span><strong>${money.format(summary.closingBalance)}</strong></article>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>Statement entries</h2><span>${data.entries.length} entries</span></div>
        <div class="ledger-list">
          ${
            data.entries
              .map((entry) => `
                <div class="ledger-item">
                  <div>
                    <strong>${entry.type}</strong>
                    <div class="muted">${formatDate(entry.createdAt)} - Tx ${shortId(entry.transaction?._id || entry.transaction)}</div>
                  </div>
                  <span>${money.format(entry.amount)}</span>
                </div>
              `)
              .join("") || `<p class="muted">No entries in this period.</p>`
          }
        </div>
      </section>
    `;
  } catch (error) {
    showToast(error.message);
  }
});

setAuthed(false);
loadApp();
