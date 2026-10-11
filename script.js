/**
 * script.js — Sales Analytics Dashboard
 * Vanilla JavaScript · Chart.js 4 · No frameworks
 *
 * Architecture:
 *  1. Fetch & parse sales_data.json
 *  2. Populate filter dropdowns dynamically from data
 *  3. On any filter change → applyFilters() → re-render all KPIs & charts
 *  4. All chart instances are stored in CHARTS{} for .destroy() before re-draw
 */

"use strict";

/* ============================================================
   CONSTANTS — color palette (consistent across all charts)
   ============================================================ */
const PALETTE = {
  indigo:  "#4f46e5",
  violet:  "#7c3aed",
  emerald: "#059669",
  amber:   "#d97706",
  rose:    "#e11d48",
  sky:     "#0284c7",
  teal:    "#0d9488",
  fuchsia: "#a21caf",
  orange:  "#ea580c",
  lime:    "#65a30d",
};

/** Ordered palette array used to assign colours to chart series */
const COLOR_LIST = Object.values(PALETTE);

/** Returns a color from the palette array, cycling if needed */
function getColor(index) {
  return COLOR_LIST[index % COLOR_LIST.length];
}

/** Hex → RGBA with alpha (for backgrounds) */
function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ============================================================
   STATE
   ============================================================ */
let RAW_DATA = [];       // full dataset from JSON
let FILTERED = [];       // after applying filters
const CHARTS = {};       // { chartId: Chart instance }

/* ============================================================
   CHART.JS GLOBAL DEFAULTS
   ============================================================ */
Chart.defaults.font.family = "-apple-system, 'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size   = 11;
Chart.defaults.color       = "#6b7280";
Chart.defaults.plugins.legend.labels.boxWidth  = 10;
Chart.defaults.plugins.legend.labels.padding   = 14;
Chart.defaults.plugins.tooltip.cornerRadius    = 8;
Chart.defaults.plugins.tooltip.padding         = 10;

/* ============================================================
   ENTRY POINT — fetch JSON then bootstrap dashboard
   ============================================================ */
async function init() {
  try {
    const response = await fetch("sales_data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    RAW_DATA = await response.json();

    populateFilters();
    applyFilters();           // initial render with all data
    setupFilterListeners();
    updateMeta();

  } catch (err) {
    console.error("Failed to load sales_data.json:", err);
    document.querySelector("main").innerHTML =
      `<div class="text-center py-20 text-red-500 font-semibold">
         ⚠️ Could not load data. Please ensure sales_data.json is present.<br>
         <span class="text-sm font-normal text-gray-400">${err.message}</span>
       </div>`;
  }
}

/* ============================================================
   META — update header badges
   ============================================================ */
function updateMeta() {
  document.getElementById("lastUpdated").textContent = new Date().toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

/* ============================================================
   FILTER HELPERS
   ============================================================ */

/** Build unique sorted values for a field and populate a <select> */
function populateSelect(selectId, field) {
  const sel = document.getElementById(selectId);
  const values = [...new Set(RAW_DATA.map(d => d[field]))].sort();
  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
}

function populateFilters() {
  populateSelect("filterRegion",       "Region");
  populateSelect("filterCategory",     "Product_Category");
  populateSelect("filterCustomerType", "Customer_Type");
  populateSelect("filterChannel",      "Sales_Channel");
}

/** Read current filter values and return the filtered dataset */
function getFilteredData() {
  const region   = document.getElementById("filterRegion").value;
  const category = document.getElementById("filterCategory").value;
  const custType = document.getElementById("filterCustomerType").value;
  const channel  = document.getElementById("filterChannel").value;

  return RAW_DATA.filter(d =>
    (region   === "All" || d.Region           === region)   &&
    (category === "All" || d.Product_Category === category) &&
    (custType === "All" || d.Customer_Type    === custType) &&
    (channel  === "All" || d.Sales_Channel    === channel)
  );
}

function setupFilterListeners() {
  ["filterRegion","filterCategory","filterCustomerType","filterChannel"].forEach(id => {
    document.getElementById(id).addEventListener("change", applyFilters);
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    ["filterRegion","filterCategory","filterCustomerType","filterChannel"].forEach(id => {
      document.getElementById(id).value = "All";
    });
    applyFilters();
  });
}

/* ============================================================
   MAIN RENDER — called on every filter change
   ============================================================ */
function applyFilters() {
  FILTERED = getFilteredData();

  // Update record badge
  document.getElementById("recordBadge").textContent =
    `${FILTERED.length.toLocaleString("id-ID")} records`;

  renderKPIs();
  renderSalesTrend();
  renderRegion();
  renderCategory();
  renderSalesRep();
  renderCustomerType();
  renderPayment();
  renderChannel();
  renderScatter();
  renderTop10();
  renderQtyCategory();
}

/* ============================================================
   UTILITY — destroy existing chart before creating a new one
   ============================================================ */
function destroyChart(id) {
  if (CHARTS[id]) {
    CHARTS[id].destroy();
    delete CHARTS[id];
  }
}

/* ============================================================
   KPI CARDS
   ============================================================ */
function renderKPIs() {
  const n = FILTERED.length;

  // Total Revenue
  const totalRevenue = FILTERED.reduce((sum, d) => sum + d.Sales_Amount, 0);
  document.getElementById("kpiRevenue").textContent =
    "Rp " + formatNumber(totalRevenue);
  document.getElementById("kpiRevenueSub").textContent =
    `Avg Rp ${formatNumber(n ? totalRevenue / n : 0)} per transaction`;

  // Total Transactions
  document.getElementById("kpiTransactions").textContent = n.toLocaleString("id-ID");
  document.getElementById("kpiTransactionsSub").textContent =
    `${((n / RAW_DATA.length) * 100).toFixed(1)}% of total dataset`;

  // Total Quantity Sold
  const totalQty = FILTERED.reduce((sum, d) => sum + d.Quantity_Sold, 0);
  document.getElementById("kpiQty").textContent = totalQty.toLocaleString("id-ID");
  document.getElementById("kpiQtySub").textContent =
    `Avg ${n ? (totalQty / n).toFixed(1) : 0} units per transaction`;

  // Average Discount
  const avgDiscount = n ? FILTERED.reduce((sum, d) => sum + d.Discount, 0) / n : 0;
  document.getElementById("kpiDiscount").textContent =
    (avgDiscount * 100).toFixed(1) + "%";
  document.getElementById("kpiDiscountSub").textContent =
    `Min ${(Math.min(...FILTERED.map(d => d.Discount)) * 100).toFixed(0)}% · Max ${(Math.max(...FILTERED.map(d => d.Discount)) * 100).toFixed(0)}%`;
}

/** Compact number formatter: 1,234,567 → "1.23 Jt" */
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + " Jt";
  if (num >= 1_000)     return (num / 1_000).toFixed(1)     + " Rb";
  return num.toFixed(0);
}

/* ============================================================
   CHART 1 — Sales Trend (Line chart by month)
   ============================================================ */
function renderSalesTrend() {
  destroyChart("salesTrend");

  // Aggregate by "YYYY-MM" month
  const byMonth = {};
  FILTERED.forEach(d => {
    const month = d.Sale_Date.slice(0, 7); // "2023-01"
    byMonth[month] = (byMonth[month] || 0) + d.Sales_Amount;
  });

  const labels  = Object.keys(byMonth).sort();
  const values  = labels.map(k => byMonth[k]);
  // Format label to "Jan '23"
  const display = labels.map(l => {
    const [y, m] = l.split("-");
    return new Date(+y, +m - 1).toLocaleString("en-US", { month: "short" }) + " '" + y.slice(2);
  });

  const ctx = document.getElementById("chartSalesTrend").getContext("2d");

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, 280);
  grad.addColorStop(0, hexAlpha(PALETTE.indigo, 0.35));
  grad.addColorStop(1, hexAlpha(PALETTE.indigo, 0.01));

  CHARTS.salesTrend = new Chart(ctx, {
    type: "line",
    data: {
      labels: display,
      datasets: [{
        label: "Revenue",
        data: values,
        borderColor: PALETTE.indigo,
        backgroundColor: grad,
        borderWidth: 2.5,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderColor: PALETTE.indigo,
        pointBorderWidth: 2,
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => " Rp " + formatNumber(ctx.raw)
          }
        }
      },
      scales: {
        x: { grid: { color: "#f3f4f6" }, ticks: { maxRotation: 30 } },
        y: {
          grid: { color: "#f3f4f6" },
          ticks: { callback: v => "Rp " + formatNumber(v) }
        }
      }
    }
  });
}

/* ============================================================
   CHART 2 — Revenue per Region (Polar Area)
   ============================================================ */
function renderRegion() {
  destroyChart("region");

  const byRegion = groupSum(FILTERED, "Region", "Sales_Amount");
  const labels   = Object.keys(byRegion);
  const values   = Object.values(byRegion);

  CHARTS.region = new Chart(
    document.getElementById("chartRegion").getContext("2d"),
    {
      type: "polarArea",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map((_, i) => hexAlpha(getColor(i), 0.72)),
          borderColor:     labels.map((_, i) => getColor(i)),
          borderWidth: 2,
          hoverBackgroundColor: labels.map((_, i) => hexAlpha(getColor(i), 0.90)),
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: Rp ${formatNumber(ctx.raw)}`
            }
          }
        },
        scales: {
          r: {
            grid: { color: "#f3f4f6" },
            ticks: {
              display: false,        // hide radial tick labels for cleaner look
              backdropColor: "transparent",
            },
            pointLabels: { display: false },
          }
        }
      }
    }
  );
}

/* ============================================================
   CHART 3 — Revenue per Product Category (Horizontal Bar)
   ============================================================ */
function renderCategory() {
  destroyChart("category");

  const byCat  = groupSum(FILTERED, "Product_Category", "Sales_Amount");
  const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(e => e[0]);
  const values = sorted.map(e => e[1]);

  CHARTS.category = new Chart(
    document.getElementById("chartCategory").getContext("2d"),
    {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Revenue",
          data: values,
          backgroundColor: labels.map((_, i) => hexAlpha(getColor(i + 2), 0.85)),
          borderColor:     labels.map((_, i) => getColor(i + 2)),
          borderWidth: 1.5,
          borderRadius: 5,
        }]
      },
      options: {
        indexAxis: "y",          // horizontal bar
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => " Rp " + formatNumber(ctx.raw) }
          }
        },
        scales: {
          x: {
            grid: { color: "#f3f4f6" },
            ticks: { callback: v => "Rp " + formatNumber(v) }
          },
          y: { grid: { display: false } }
        }
      }
    }
  );
}

/* ============================================================
   CHART 4 — Sales per Sales Representative (Vertical Bar)
   ============================================================ */
function renderSalesRep() {
  destroyChart("salesRep");

  const byRep  = groupSum(FILTERED, "Sales_Rep", "Sales_Amount");
  const sorted = Object.entries(byRep).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(e => e[0]);
  const values = sorted.map(e => e[1]);

  CHARTS.salesRep = new Chart(
    document.getElementById("chartSalesRep").getContext("2d"),
    {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Revenue",
          data: values,
          backgroundColor: labels.map((_, i) => hexAlpha(getColor(i + 1), 0.8)),
          borderColor:     labels.map((_, i) => getColor(i + 1)),
          borderWidth: 1.5,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => " Rp " + formatNumber(ctx.raw) }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: "#f3f4f6" },
            ticks: { callback: v => "Rp " + formatNumber(v) }
          }
        }
      }
    }
  );
}

/* ============================================================
   CHART 5 — Customer Type Distribution (Pie)
   ============================================================ */
function renderCustomerType() {
  destroyChart("customerType");

  const data = groupCount(FILTERED, "Customer_Type");
  renderDonut("chartCustomerType", "customerType", data, [PALETTE.indigo, PALETTE.emerald]);
}

/* ============================================================
   CHART 6 — Payment Method Usage (Pie)
   ============================================================ */
function renderPayment() {
  destroyChart("payment");

  const data = groupCount(FILTERED, "Payment_Method");
  renderDonut("chartPayment", "payment", data,
    [PALETTE.sky, PALETTE.violet, PALETTE.amber]);
}

/* ============================================================
   CHART 7 — Sales Channel Distribution (Pie)
   ============================================================ */
function renderChannel() {
  destroyChart("channel");

  const data = groupCount(FILTERED, "Sales_Channel");
  renderDonut("chartChannel", "channel", data,
    [PALETTE.teal, PALETTE.rose]);
}

/** Shared donut renderer used by charts 5–7 */
function renderDonut(canvasId, chartKey, groupedData, colors) {
  const labels = Object.keys(groupedData);
  const values = Object.values(groupedData);

  CHARTS[chartKey] = new Chart(
    document.getElementById(canvasId).getContext("2d"),
    {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          hoverOffset: 6,
          borderWidth: 2,
          borderColor: "#fff",
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { padding: 10, boxWidth: 9 }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.raw / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
              }
            }
          }
        }
      }
    }
  );
}

/* ============================================================
   CHART 8 — Discount vs Sales Scatter Plot
   ============================================================ */
function renderScatter() {
  destroyChart("scatter");

  // Each point: { x: Discount %, y: Sales_Amount }
  const points = FILTERED.map(d => ({
    x: +(d.Discount * 100).toFixed(1),
    y: +d.Sales_Amount.toFixed(2),
  }));

  CHARTS.scatter = new Chart(
    document.getElementById("chartScatter").getContext("2d"),
    {
      type: "scatter",
      data: {
        datasets: [{
          label: "Transaction",
          data: points,
          backgroundColor: hexAlpha(PALETTE.indigo, 0.45),
          borderColor:     hexAlpha(PALETTE.indigo, 0.7),
          borderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx =>
                ` Discount ${ctx.parsed.x}% · Revenue Rp ${formatNumber(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Discount (%)", color: "#9ca3af" },
            grid: { color: "#f3f4f6" },
          },
          y: {
            title: { display: true, text: "Revenue (Rp)", color: "#9ca3af" },
            grid: { color: "#f3f4f6" },
            ticks: { callback: v => formatNumber(v) }
          }
        }
      }
    }
  );
}

/* ============================================================
   CHART 9 — Top 10 Highest Sales (Horizontal Bar)
   ============================================================ */
function renderTop10() {
  destroyChart("top10");

  // Sort by Sales_Amount descending, take top 10
  const top10 = [...FILTERED]
    .sort((a, b) => b.Sales_Amount - a.Sales_Amount)
    .slice(0, 10);

  // Label: "ProductID · Rep"
  const labels = top10.map(d => `#${d.Product_ID} · ${d.Sales_Rep}`);
  const values = top10.map(d => d.Sales_Amount);

  CHARTS.top10 = new Chart(
    document.getElementById("chartTop10").getContext("2d"),
    {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Revenue",
          data: values,
          backgroundColor: values.map((_, i) =>
            i === 0 ? hexAlpha(PALETTE.amber, 0.9) : hexAlpha(PALETTE.indigo, 0.7)
          ),
          borderColor: values.map((_, i) =>
            i === 0 ? PALETTE.amber : PALETTE.indigo
          ),
          borderWidth: 1.5,
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => " Rp " + formatNumber(ctx.raw) }
          }
        },
        scales: {
          x: {
            grid: { color: "#f3f4f6" },
            ticks: { callback: v => "Rp " + formatNumber(v) }
          },
          y: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    }
  );
}

/* ============================================================
   CHART 10 — Quantity Sold per Category (Polar Area)
   ============================================================ */
function renderQtyCategory() {
  destroyChart("qtyCategory");

  const byQty  = groupSum(FILTERED, "Product_Category", "Quantity_Sold");
  const labels = Object.keys(byQty);
  const values = Object.values(byQty);

  CHARTS.qtyCategory = new Chart(
    document.getElementById("chartQtyCategory").getContext("2d"),
    {
      type: "polarArea",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map((_, i) => hexAlpha(getColor(i + 4), 0.72)),
          borderColor:     labels.map((_, i) => getColor(i + 4)),
          borderWidth: 1.5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString("id-ID")} units`
            }
          }
        },
        scales: {
          r: { grid: { color: "#f3f4f6" }, ticks: { display: false } }
        }
      }
    }
  );
}

/* ============================================================
   AGGREGATE HELPERS
   ============================================================ */

/**
 * Groups an array of records by `groupField`, summing `valueField`.
 * Returns { label: total, ... }
 */
function groupSum(data, groupField, valueField) {
  return data.reduce((acc, d) => {
    const key = d[groupField];
    acc[key] = (acc[key] || 0) + d[valueField];
    return acc;
  }, {});
}

/**
 * Groups an array of records by `groupField`, counting occurrences.
 * Returns { label: count, ... }
 */
function groupCount(data, groupField) {
  return data.reduce((acc, d) => {
    const key = d[groupField];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/* ============================================================
   BOOTSTRAP
   ============================================================ */
document.addEventListener("DOMContentLoaded", init);
