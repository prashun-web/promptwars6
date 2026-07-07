/**
 * FIFA AI Command Center - Emergency Operations Agent Module
 */

class EmergencyAgent {
  constructor() {
    this.templates = {};
    this.activeIncident = null;
    this.activeType = null;
  }

  init() {
    // Read directly from consolidated window configurations
    this.templates = window.incidentTemplatesData;
    this.setupEventListeners();
    this.updateUI();
  }

  setupEventListeners() {
    const buttons = document.querySelectorAll('.emergency-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-incident');
        this.triggerEmergency(type);
      });
    });

    const clearBtn = document.getElementById('emergency-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearEmergency();
      });
    }
  }

  triggerEmergency(type) {
    const template = this.templates[type];
    if (!template) return;

    this.activeType = type;
    this.activeIncident = {
      type: type,
      priority: template.priority,
      summary: template.summary,
      actionPlan: [...template.actionPlan],
      volunteerInstructions: [...template.volunteerInstructions],
      paScript: template.paScript,
      exit: template.exit
    };

    // Update global state
    window.simState.activeEmergency = this.activeIncident;
    window.simState.kpis.securityStatus = template.priority;
    if (type === 'medical') {
      window.simState.kpis.medicalAlerts = 1;
    }

    // Set simulator buttons visual states
    const buttons = document.querySelectorAll('.emergency-btn');
    buttons.forEach(btn => {
      const btnType = btn.getAttribute('data-incident');
      if (btnType === type) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    // Alert operator
    window.logOperation("Emergency Agent", `[CRITICAL ALERT] Simulated Incident Triggered: ${type.toUpperCase()}`, 'critical');

    // Trigger full system overlay and emit
    const overlay = document.getElementById('alarm-overlay');
    if (overlay) overlay.classList.add('active');

    window.eventBus.emit('emergency_triggered', this.activeIncident);
    window.eventBus.emit('agent_focus_change', { agent: 'emergency', context: `Incident: ${type}` });

    this.updateUI();
  }

  clearEmergency() {
    if (!this.activeIncident) return;

    window.logOperation("Emergency Agent", "Alarms deactivated. Incident resolved. Switching back to NOMINAL.", 'success');
    
    // Reset global metrics
    window.simState.activeEmergency = null;
    window.simState.kpis.securityStatus = "Nominal";
    window.simState.kpis.medicalAlerts = 0;

    // Reset simulator buttons visual states
    const buttons = document.querySelectorAll('.emergency-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const overlay = document.getElementById('alarm-overlay');
    if (overlay) overlay.classList.remove('active');

    this.activeIncident = null;
    this.activeType = null;

    window.eventBus.emit('emergency_cleared', null);
    
    this.updateUI();
  }

  updateUI() {
    const statusPanel = document.getElementById('emergency-incident-status');
    const actionPlanPanel = document.getElementById('emergency-action-plan');
    const paPanel = document.getElementById('emergency-pa-script');

    if (!this.activeIncident) {
      if (statusPanel) {
        statusPanel.innerHTML = `
          <div style="text-align: center; padding: 30px 0; color: var(--text-muted);">
            <p><strong>System Status: NOMINAL</strong></p>
            <p style="font-size: 0.8rem; margin-top: 6px;">Trigger an emergency simulation above to test real-time AI generation protocols.</p>
          </div>
        `;
      }
      if (actionPlanPanel) actionPlanPanel.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">No active tactical operation plan.</p>`;
      if (paPanel) paPanel.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">Standby for public announcement scripts.</p>`;
      return;
    }

    // Render active incident details
    let priorityClass = this.activeIncident.priority === 'CRITICAL' ? 'critical' : 'warning';
    
    if (statusPanel) {
      statusPanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="color:var(--neon-red); text-transform:uppercase;">${this.activeType.replace('_', ' ')} Incident</h4>
          <span class="priority-tag ${priorityClass}">${this.activeIncident.priority}</span>
        </div>
        <p style="font-size:0.9rem; line-height:1.4; color:#fff; margin-bottom:8px;">${this.activeIncident.summary}</p>
        <p style="font-size:0.8rem; color:var(--text-muted);">Primary Evac exit node: <strong>${this.activeIncident.exit}</strong></p>
      `;
    }

    if (actionPlanPanel) {
      let checklistHtml = '<ul style="list-style:none; display:flex; flex-direction:column; gap:8px;">';
      this.activeIncident.actionPlan.forEach((step, idx) => {
        checklistHtml += `
          <li style="font-size:0.85rem; display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="action-step-${idx}" checked style="accent-color:var(--neon-blue);">
            <label for="action-step-${idx}" style="cursor:pointer;">${step}</label>
          </li>
        `;
      });
      checklistHtml += '</ul>';
      actionPlanPanel.innerHTML = checklistHtml;
    }

    if (paPanel) {
      paPanel.innerHTML = `
        <div style="background:rgba(255,0,85,0.05); border:1px solid rgba(255,0,85,0.15); padding:10px; border-radius:6px; font-size:0.85rem; line-height:1.4; margin-bottom:10px;">
          <strong>[PA Draft]</strong>: "${this.activeIncident.paScript}"
        </div>
        <div class="action-box">
          <div>Send draft to translation engine:</div>
          <button onclick="window.sendPAToTranslation()">Push to Translation Hub</button>
        </div>
      `;
    }
  }
}

// Make globally accessible
window.EmergencyAgent = EmergencyAgent;
