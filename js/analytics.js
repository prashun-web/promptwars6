/**
 * FIFA AI Command Center - Executive Analytics Agent Module
 */

class AnalyticsAgent {
  constructor() {
    this.historyData = null;
  }

  init() {
    // Read directly from consolidated window configurations
    this.historyData = window.analyticsHistoryData;

    window.eventBus.on('tick', () => {
      this.drawCharts();
      this.writeExecutiveSummary();
    });

    window.eventBus.on('emergency_triggered', () => {
      this.writeExecutiveSummary();
    });

    window.eventBus.on('emergency_cleared', () => {
      this.writeExecutiveSummary();
    });

    this.drawCharts();
    this.writeExecutiveSummary();
  }

  drawCharts() {
    this.drawCrowdDensityChart();
    this.drawTransportChart();
    this.drawEnergyChart();
  }

  drawCrowdDensityChart() {
    const el = document.getElementById('chart-crowd-density');
    if (!el) return;

    const data = this.historyData.crowdTrend;
    let maxVal = Math.max(...data.map(d => d.density));
    let points = '';
    let xStep = 450 / (data.length - 1);

    // Build polyline points for dynamic SVG representation
    data.forEach((d, idx) => {
      let x = 30 + idx * xStep;
      let y = 160 - (d.density / maxVal) * 110;
      points += `${x},${y} `;
    });

    let labelsHtml = '';
    data.forEach((d, idx) => {
      let x = 30 + idx * xStep;
      labelsHtml += `<text x="${x}" y="185" fill="var(--text-muted)" font-size="10" text-anchor="middle">${d.time}</text>`;
    });

    el.innerHTML = `
      <svg viewBox="0 0 500 200" style="width:100%; height:100%;">
        <!-- Gridlines -->
        <line x1="30" y1="50" x2="480" y2="50" class="chart-gridline" />
        <line x1="30" y1="105" x2="480" y2="105" class="chart-gridline" />
        <line x1="30" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
        
        <!-- Graph Path -->
        <polyline points="${points}" fill="none" stroke="var(--neon-blue)" stroke-width="3" style="filter: drop-shadow(0 0 4px var(--neon-blue))" />
        
        <!-- Data Dots -->
        ${data.map((d, idx) => {
          let x = 30 + idx * xStep;
          let y = 160 - (d.density / maxVal) * 110;
          return `<circle cx="${x}" cy="${y}" r="4.5" fill="#fff" stroke="var(--neon-blue)" stroke-width="2" />`;
        }).join('')}
        
        <!-- Y-Axis Label -->
        <text x="25" y="160" fill="var(--text-muted)" font-size="9" text-anchor="end">0%</text>
        <text x="25" y="105" fill="var(--text-muted)" font-size="9" text-anchor="end">50%</text>
        <text x="25" y="50" fill="var(--text-muted)" font-size="9" text-anchor="end">100%</text>

        <!-- X-Axis Labels -->
        ${labelsHtml}
      </svg>
    `;
  }

  drawTransportChart() {
    const el = document.getElementById('chart-transport-times');
    if (!el) return;

    const data = this.historyData.transportTimes;
    let maxVal = Math.max(...data.map(d => d.queue));
    
    let barsHtml = '';
    data.forEach((d, idx) => {
      let width = (d.queue / maxVal) * 320;
      let y = 20 + idx * 38;
      let barColor = d.queue > 30 ? 'var(--neon-orange)' : 'var(--neon-blue)';
      barsHtml += `
        <text x="10" y="${y + 14}" fill="var(--text-main)" font-size="10" font-weight="500">${d.type}</text>
        <rect x="130" y="${y}" width="${width}" height="18" rx="3" fill="${barColor}" class="chart-bar" />
        <text x="${130 + width + 8}" y="${y + 13}" fill="var(--neon-blue)" font-size="10" font-family="var(--font-mono)">${d.queue} min</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 500 170" style="width:100%; height:100%;">
        <line x1="130" y1="10" x2="130" y2="160" stroke="rgba(255,255,255,0.15)" />
        ${barsHtml}
      </svg>
    `;
  }

  drawEnergyChart() {
    const el = document.getElementById('chart-energy-draw');
    if (!el) return;

    const usage = this.historyData.energyUsage;
    const total = usage.solarGenerationKw + usage.gridDrawKw;
    const solarRatio = Math.round((usage.solarGenerationKw / total) * 100);
    const gridRatio = 100 - solarRatio;

    el.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; padding:10px 0;">
        <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
          <span style="color:var(--neon-green)">● Rooftop Solar (${solarRatio}%)</span>
          <span style="color:var(--neon-blue)">● Power Grid (${gridRatio}%)</span>
        </div>
        <div style="height:24px; border-radius:12px; overflow:hidden; display:flex; border:1px solid rgba(255,255,255,0.1);">
          <div style="width:${solarRatio}%; background:linear-gradient(to right, #00b36b, var(--neon-green)); transition:var(--transition);" title="Solar"></div>
          <div style="width:${gridRatio}%; background:linear-gradient(to right, #0088cc, var(--neon-blue)); transition:var(--transition);" title="Grid"></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:6px; font-family:var(--font-mono); font-size:0.9rem;">
          <div class="kpi-card" style="text-align:left;">
            <span class="kpi-title" style="font-size:0.7rem;">Solar Supply</span>
            <div style="color:var(--neon-green); font-weight:bold;">${usage.solarGenerationKw} Kw</div>
          </div>
          <div class="kpi-card" style="text-align:left;">
            <span class="kpi-title" style="font-size:0.7rem;">Grid Draw</span>
            <div style="color:var(--neon-blue); font-weight:bold;">${usage.gridDrawKw} Kw</div>
          </div>
        </div>
      </div>
    `;
  }

  writeExecutiveSummary() {
    const summaryEl = document.getElementById('analytics-ai-report');
    if (!summaryEl) return;

    let text = '';
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    if (window.simState.activeEmergency) {
      const type = window.simState.activeEmergency.type.toUpperCase();
      text = `
        <p style="color:var(--neon-red); font-weight:600; margin-bottom:8px;">[EXECUTIVE ALERTIMENT] ACTIVE ${type} DISPATCH PROTOCOL</p>
        <p>Operations summary for ${date}. Operational security classification raised to level: <strong>${window.simState.activeEmergency.priority}</strong>. 
        Evacuation and volunteer vectors shifted to incident mitigation at exit ${window.simState.activeEmergency.exit}. Auxiliary power grids stand alert. 
        Ingress gates halted where crowd panic is possible. Action Plan checkouts are active.</p>
      `;
    } else {
      const density = window.simState.kpis.crowdDensity;
      const energyRate = Math.round((this.historyData.energyUsage.solarGenerationKw / (this.historyData.energyUsage.solarGenerationKw + this.historyData.energyUsage.gridDrawKw)) * 100);
      
      text = `
        <p style="color:var(--neon-green); font-weight:600; margin-bottom:8px;">[EXECUTIVE OVERVIEW] ALL SECTORS NOMINAL</p>
        <p>Operations summary for ${date}. Stadium occupancy has reached average density of ${density}% of safe seating configurations. 
        Eco-infrastructure reports <strong>${energyRate}% renewable offsets</strong> from photovoltaic array grids. Concession queue metrics indicate 
        moderate flows near Sections 101 and 103, with zero reports of ticketing hardware failures in the last 60 minutes. 
        Local traffic flow nominal; transit services pacing correctly.</p>
      `;
    }

    summaryEl.innerHTML = text;
  }
}

// Make globally accessible
window.AnalyticsAgent = AnalyticsAgent;
