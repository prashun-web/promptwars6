/**
 * FIFA AI Command Center - Crowd intelligence Agent Module
 */

class CrowdAgent {
  constructor() {
    this.gates = [];
    this.sections = [];
    this.selectedGate = null;
    this.selectedSection = null;
    this.aiReportElement = null;
  }

  init() {
    // Read directly from consolidated window configurations
    this.gates = JSON.parse(JSON.stringify(window.stadiumData.gates));
    this.sections = JSON.parse(JSON.stringify(window.stadiumData.sections));

    // Set up event listeners
    window.eventBus.on('gate_clicked', (gateId) => this.selectGate(gateId));
    window.eventBus.on('section_clicked', (sectionId) => this.selectSection(sectionId));
    window.eventBus.on('tick', () => this.simulateFlows());
    window.eventBus.on('emergency_triggered', (incident) => this.handleEmergency(incident));
    window.eventBus.on('emergency_cleared', () => this.clearEmergency());

    this.aiReportElement = document.getElementById('crowd-ai-report');
    this.updateUI();
    this.runAgentReasoning();
  }

  // Simulate crowd fluctuations
  simulateFlows() {
    this.gates.forEach(gate => {
      // Fluctuate densities slightly
      let noise = (Math.random() - 0.5) * 0.05;
      
      // If there is an emergency, alter crowd dynamics
      if (window.simState.activeEmergency) {
        if (window.simState.activeEmergency.type === 'panic' && gate.id === 'F') {
          gate.density = Math.min(1.0, gate.density + 0.04);
        } else if (window.simState.activeEmergency.type === 'fire' && gate.id === 'C') {
          gate.density = Math.min(1.0, gate.density + 0.03); // evacuation exit
        }
      }
      
      gate.density = Math.max(0.1, Math.min(0.99, gate.density + noise));
      
      // Update status string
      if (gate.density > 0.9) gate.status = 'critical';
      else if (gate.density > 0.75) gate.status = 'congested';
      else if (gate.density > 0.5) gate.status = 'moderate';
      else gate.status = 'nominal';
    });

    this.sections.forEach(sec => {
      let noise = (Math.random() - 0.5) * 0.02;
      sec.occupancy = Math.max(0.2, Math.min(1.0, sec.occupancy + noise));
    });

    // Update global dashboard KPIs
    const densities = this.gates.map(g => g.density);
    const avgDensity = Math.round((densities.reduce((a, b) => a + b, 0) / densities.length) * 100);
    window.simState.kpis.crowdDensity = avgDensity;

    this.updateUI();
    this.runAgentReasoning();
  }

  selectGate(gateId) {
    this.selectedGate = this.gates.find(g => g.id === gateId);
    this.selectedSection = null;
    window.logOperation("Crowd Agent", `Telemetry requested for Gate ${gateId}`);
    this.updateUI();
    this.runAgentReasoning();
    window.eventBus.emit('agent_focus_change', { agent: 'crowd', context: `Gate ${gateId}` });
  }

  selectSection(sectionId) {
    this.selectedSection = this.sections.find(s => s.id === sectionId);
    this.selectedGate = null;
    window.logOperation("Crowd Agent", `Telemetry requested for Section ${sectionId}`);
    this.updateUI();
    this.runAgentReasoning();
    window.eventBus.emit('agent_focus_change', { agent: 'crowd', context: `Section ${sectionId}` });
  }

  handleEmergency(incident) {
    if (incident.type === 'panic') {
      window.logOperation("Crowd Agent", "Alert: Evacuation bottlenecks detected near Gate F exits.");
    }
    this.updateUI();
    this.runAgentReasoning();
  }

  clearEmergency() {
    this.updateUI();
    this.runAgentReasoning();
  }

  updateUI() {
    // 1. Render Gate fills on the SVG stadium map
    this.gates.forEach(gate => {
      const element = document.getElementById(`svg-gate-${gate.id}`);
      if (element) {
        let color = 'var(--neon-green)';
        if (gate.status === 'critical') color = 'var(--neon-red)';
        else if (gate.status === 'congested') color = 'var(--neon-orange)';
        else if (gate.status === 'moderate') color = 'var(--neon-yellow)';
        element.setAttribute('fill', color);
        element.setAttribute('style', `filter: drop-shadow(0 0 6px ${color})`);
      }

      // Update gate lists in the Crowd Intelligence Tab if it exists
      const queueBadge = document.getElementById(`gate-badge-${gate.id}`);
      if (queueBadge) {
        queueBadge.textContent = `${Math.round(gate.density * 12)}m wait`;
        queueBadge.className = `priority-tag ${gate.status}`;
      }
    });

    // 2. Render details panel inside Crowd Intelligence Tab
    const detailPanel = document.getElementById('crowd-detail-panel');
    if (detailPanel) {
      if (this.selectedGate) {
        detailPanel.innerHTML = `
          <div class="kpi-title">Selected Gate</div>
          <h4 style="margin-bottom:8px; color:var(--neon-blue);">${this.selectedGate.name}</h4>
          <div class="stats-grid" style="margin-top:12px;">
            <div class="kpi-card">
              <div class="kpi-title">Density</div>
              <div class="kpi-value ${this.selectedGate.status}">${window.formatPercentage(this.selectedGate.density * 100)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Queue Est.</div>
              <div class="kpi-value">${Math.round(this.selectedGate.density * 15)} mins</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Active Flow</div>
              <div class="kpi-value">${Math.round(this.selectedGate.density * 80)} / min</div>
            </div>
          </div>
          <div class="action-box">
            <div>Gate control mode: <strong>AUTOMATED FEEDBACK</strong></div>
            <button onclick="window.dispatchReroute('${this.selectedGate.id}')">Trigger Reroute Instruction</button>
          </div>
        `;
      } else if (this.selectedSection) {
        detailPanel.innerHTML = `
          <div class="kpi-title">Selected Seating Area</div>
          <h4 style="margin-bottom:8px; color:var(--neon-blue);">${this.selectedSection.name}</h4>
          <div class="stats-grid" style="margin-top:12px;">
            <div class="kpi-card">
              <div class="kpi-title">Occupancy</div>
              <div class="kpi-value">${window.formatPercentage(this.selectedSection.occupancy * 100)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Est. Seats</div>
              <div class="kpi-value">${Math.round(this.selectedSection.occupancy * 8500)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Stair Flow</div>
              <div class="kpi-value ok">Optimal</div>
            </div>
          </div>
        `;
      } else {
        detailPanel.innerHTML = `<div class="kpi-title" style="text-align:center; padding: 20px 0;">Select a gate or section on the map to analyze.</div>`;
      }
    }
  }

  // AI Reasoning system
  runAgentReasoning() {
    if (!this.aiReportElement) return;

    let html = '';
    
    if (window.simState.activeEmergency) {
      if (window.simState.activeEmergency.type === 'panic') {
        html = `
          <p style="color:var(--neon-red); font-weight:600; margin-bottom:8px;">CRITICAL BOTTLENECK ALERT - GATE F</p>
          <p>Gate F density has spiked to 92%+ due to crowd panic. Specators exits are blocked at NW corridors. <strong>Crowd Agent Recommendation:</strong> Immediately dispatch Crowd Marshalls to redirect Section 104 routes toward Gate A. Field-play entry barriers must be locked.</p>
        `;
      } else if (window.simState.activeEmergency.type === 'fire') {
        html = `
          <p style="color:var(--neon-red); font-weight:600; margin-bottom:8px;">EVACUATION FLOW ROUTING - SECTIONS 202</p>
          <p>Concession area fire at Section 202 requires evacuation. Spectators are venting towards Gate C. Gate C queue flow is increasing. <strong>Crowd Agent Recommendation:</strong> Keep Gate C wide open. Open all auxiliary exit turnstiles. Display evacuation instructions on digital screens.</p>
        `;
      } else {
        html = `
          <p style="color:var(--neon-orange); font-weight:600; margin-bottom:8px;">EMERGENCY OPS OVERLAY IN EFFECT</p>
          <p>An emergency event (${window.simState.activeEmergency.type}) is drawing operator focus. Spectator egress routes remain under observation. No severe crowd bottlenecks currently detected.</p>
        `;
      }
    } else {
      // Standard intelligence calculations
      const highlyCongestedGates = this.gates.filter(g => g.density > 0.8);
      if (highlyCongestedGates.length > 0) {
        const gateList = highlyCongestedGates.map(g => g.id).join(' & ');
        html = `
          <p style="color:var(--neon-orange); font-weight:600; margin-bottom:8px;">CONGESTION WARNING: GATE ${gateList}</p>
          <p>Gate B and F are experiencing high ingress loads. Bottlenecks are forming due to incoming shuttle buses and high metro frequencies. 
          Queue wait times have exceeded 15 minutes. <strong>Crowd Agent Action Plan:</strong> Triggering electronic banners in Section 201 directing arrivals to Gate A. Open auxiliary gate checkpoints 3 and 4.</p>
        `;
      } else {
        html = `
          <p style="color:var(--neon-green); font-weight:600; margin-bottom:8px;">STADIUM INGRESS/EGRESS: NOMINAL</p>
          <p>All entrances are operating at safe flow rates. Average gate queue time is 4.5 minutes. Ingress rate is matched to turnstile throughput. AI predictive analysis indicates no capacity exceedances in the next 30 minutes.</p>
        `;
      }
    }

    this.aiReportElement.innerHTML = html;
  }
}

// Make globally accessible
window.CrowdAgent = CrowdAgent;
