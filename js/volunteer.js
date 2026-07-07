/**
 * FIFA AI Command Center - Volunteer logistics Hub Module
 */

class VolunteerAgent {
  constructor() {
    this.volunteers = [];
    this.tasks = [];
    this.equipment = [];
    this.troubleGuides = {};
  }

  init() {
    // Read directly from consolidated window configurations
    this.volunteers = JSON.parse(JSON.stringify(window.volunteersData.volunteers));
    this.tasks = JSON.parse(JSON.stringify(window.volunteersData.tasks));
    this.equipment = JSON.parse(JSON.stringify(window.volunteersData.equipment));
    this.troubleGuides = window.volunteersData.troubleshooter;

    window.eventBus.on('emergency_triggered', (incident) => this.handleEmergency(incident));
    window.eventBus.on('emergency_cleared', () => this.clearEmergency());

    this.setupTroubleshooter();
    this.updateUI();
  }

  setupTroubleshooter() {
    const input = document.getElementById('vol-trouble-input');
    const form = document.getElementById('vol-trouble-form');
    const resultPanel = document.getElementById('vol-trouble-result');

    if (form && input && resultPanel) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = window.sanitizeHTML(input.value.trim().toLowerCase());
        if (!text) return;

        window.logOperation("Volunteer Agent", `Troubleshooting request: "${text}"`);
        window.eventBus.emit('agent_focus_change', { agent: 'volunteer', context: `Troubleshoot: ${text}` });

        let solution = '';

        if (text.includes('scanner') || text.includes('laser') || text.includes('offline') || text.includes('ticket')) {
          if (text.includes('reboot') || text.includes('turn on') || text.includes('boot')) {
            solution = `<strong>Reboot Guide:</strong> ${this.troubleGuides.scanners.reboot}`;
          } else if (text.includes('offline') || text.includes('network') || text.includes('wifi')) {
            solution = `<strong>Network Guide:</strong> ${this.troubleGuides.scanners.offline}`;
          } else {
            solution = `<strong>Laser/Window Guide:</strong> ${this.troubleGuides.scanners.laser}<br><br><em>Alternative check:</em> ${this.troubleGuides.scanners.offline}`;
          }
        } else if (text.includes('radio') || text.includes('static') || text.includes('mic') || text.includes('channel')) {
          if (text.includes('static') || text.includes('channel') || text.includes('hear')) {
            solution = `<strong>Signal/Static Guide:</strong> ${this.troubleGuides.radios.static}`;
          } else {
            solution = `<strong>Battery Swap Guide:</strong> ${this.troubleGuides.radios.battery}`;
          }
        } else if (text.includes('aed') || text.includes('defibrillator') || text.includes('medical')) {
          solution = `<strong>AED Guide:</strong> AED units are self-calibrating. Green flashing light indicates nominal operational capacity. If red light is present, contact the Main Medical Command trailer for a immediate swap.`;
        } else {
          solution = `<strong>Generic Equipment Guide:</strong> Consult the operational manual at the Volunteer Kiosk or locate your Team Lead. If it is a software fault, please reboot the device.`;
        }

        resultPanel.innerHTML = `
          <div style="background:rgba(0, 240, 255, 0.04); border:1px solid rgba(0, 240, 255, 0.12); padding:10px; border-radius:6px; font-size:0.85rem; line-height:1.4;">
            <p>${solution}</p>
          </div>
        `;
        input.value = '';
      });
    }
  }

  handleEmergency(incident) {
    // Alter task priority list: Inject emergency responder tasks
    this.tasks = this.tasks.filter(t => t.priority === 'High' || t.priority === 'Critical' || t.status === 'In Progress');

    incident.volunteerInstructions.forEach((instruction, idx) => {
      const parts = instruction.split(' to ');
      const assigneeName = parts[0] || "Steward Squad";
      const actionText = parts[1] || instruction;
      
      this.tasks.unshift({
        id: `EMG-${100 + idx}`,
        title: actionText,
        assignedTo: assigneeName,
        priority: "Critical",
        status: "Pending",
        due: "IMMEDIATE"
      });
    });

    window.logOperation("Volunteer Agent", `Re-prioritized volunteer task board. Injected emergency duties.`);
    this.updateUI();
  }

  clearEmergency() {
    this.init();
  }

  updateUI() {
    // Render Tasks Board
    const taskContainer = document.getElementById('volunteer-task-list');
    if (taskContainer) {
      taskContainer.innerHTML = '';
      
      if (this.tasks.length === 0) {
        taskContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:15px; text-align:center;">No active tasks assigned.</div>';
      } else {
        this.tasks.forEach(task => {
          const card = document.createElement('div');
          card.className = 'task-card';
          
          let priorityClass = task.priority.toLowerCase();
          
          card.innerHTML = `
            <div class="task-details">
              <div class="task-title">${task.title}</div>
              <div class="task-assignee">Assignee: <strong>${task.assignedTo}</strong> • Due: ${task.due}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="priority-tag ${priorityClass}">${task.priority}</span>
              <button class="lang-btn" onclick="window.toggleTaskStatus('${task.id}')" style="padding:4px 8px; font-size:0.7rem;">
                ${task.status === 'Completed' ? '✓' : (task.status === 'In Progress' ? '⌛' : '⚙')}
              </button>
            </div>
          `;
          taskContainer.appendChild(card);
        });
      }
    }

    // Render Volunteer Staff Roster
    const staffContainer = document.getElementById('volunteer-roster');
    if (staffContainer) {
      staffContainer.innerHTML = '';
      this.volunteers.forEach(vol => {
        const row = document.createElement('div');
        row.className = 'volunteer-card';
        
        let statusColor = 'var(--neon-green)';
        if (vol.status === 'On Break') statusColor = 'var(--neon-yellow)';
        else if (vol.status === 'Offline') statusColor = 'var(--text-muted)';
        else if (vol.status === 'Transit') statusColor = 'var(--neon-blue)';

        row.innerHTML = `
          <div>
            <strong>${vol.name}</strong> (${vol.role})
            <div style="color:var(--text-muted); font-size:0.7rem;">Battery: ${vol.battery}% • Radio: ${vol.radioStatus}</div>
          </div>
          <span style="color:${statusColor}; font-size:0.75rem; font-weight:600;">● ${vol.status}</span>
        `;
        staffContainer.appendChild(row);
      });
    }

    // Render Equipment Panel
    const equipContainer = document.getElementById('volunteer-equipment');
    if (equipContainer) {
      equipContainer.innerHTML = '';
      this.equipment.forEach(eq => {
        const div = document.createElement('div');
        div.style.marginBottom = '12px';
        div.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
        div.style.paddingBottom = '8px';
        
        let warningText = '';
        if (eq.faulty > 0) {
          warningText = `<div style="color:var(--neon-orange); font-size:0.7rem; margin-top:4px;">⚠️ Fault detected on ${eq.faulty} unit(s). Check troubleshooter guidance.</div>`;
        }

        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600;">
            <span>${eq.name}</span>
            <span style="font-family:var(--font-mono); color:var(--neon-blue);">${eq.active}/${eq.total} Online</span>
          </div>
          ${warningText}
        `;
        equipContainer.appendChild(div);
      });
    }
  }

  // Allow clicking checklist to toggle state in demo
  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'Pending') {
      task.status = 'In Progress';
      window.logOperation("Volunteer Agent", `Task ${taskId} status shifted to: IN PROGRESS`);
    } else if (task.status === 'In Progress') {
      task.status = 'Completed';
      window.logOperation("Volunteer Agent", `Task ${taskId} status shifted to: COMPLETED`);
    } else {
      task.status = 'Pending';
      window.logOperation("Volunteer Agent", `Task ${taskId} status shifted to: PENDING`);
    }

    this.updateUI();
  }
}

// Make globally accessible
window.VolunteerAgent = VolunteerAgent;
