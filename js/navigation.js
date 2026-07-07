/**
 * FIFA AI Command Center - Smart Navigation Agent Module
 */

class NavigationAgent {
  constructor() {
    this.pois = [];
    this.gates = [];
    this.sections = [];
    this.startPointId = 'Gate A';
    this.endPointId = 'wc_north';
    this.accessibleOnly = false;
    this.emergencyEgress = false;
    
    this.stadiumCenter = { x: 300, y: 300 };
    this.pitchRadius = 110;
  }

  init() {
    // Read directly from window stadium configuration
    this.pois = window.stadiumData.pois;
    this.gates = window.stadiumData.gates;
    this.sections = window.stadiumData.sections;

    window.eventBus.on('emergency_triggered', (incident) => this.handleEmergency(incident));
    window.eventBus.on('emergency_cleared', () => this.clearEmergency());

    this.populateSelectors();
    this.updatePathfinding();
  }

  // Fill HTML select items dynamically
  populateSelectors() {
    const startSelect = document.getElementById('nav-start-select');
    const endSelect = document.getElementById('nav-end-select');

    if (!startSelect || !endSelect) return;

    startSelect.innerHTML = '';
    endSelect.innerHTML = '';

    // Add gates
    this.gates.forEach(gate => {
      startSelect.add(new Option(`Gate ${gate.id} - ${gate.name}`, `gate_${gate.id}`));
    });

    // Add sections
    this.sections.forEach(sec => {
      startSelect.add(new Option(`Section ${sec.id}`, `sec_${sec.id}`));
      endSelect.add(new Option(`Section ${sec.id}`, `sec_${sec.id}`));
    });

    // Add POIs to destination selector
    this.pois.forEach(poi => {
      endSelect.add(new Option(`${poi.name} (${poi.type})`, `poi_${poi.id}`));
    });

    // Select defaults
    startSelect.value = `gate_A`;
    endSelect.value = `poi_wc_north`;

    startSelect.addEventListener('change', (e) => {
      this.startPointId = e.target.value;
      this.updatePathfinding();
    });

    endSelect.addEventListener('change', (e) => {
      this.endPointId = e.target.value;
      this.updatePathfinding();
    });

    const accessToggle = document.getElementById('nav-access-toggle');
    if (accessToggle) {
      accessToggle.addEventListener('change', (e) => {
        this.accessibleOnly = e.target.checked;
        window.logOperation("Navigation Agent", `Accessible Routing: ${this.accessibleOnly ? 'ENABLED' : 'DISABLED'}`);
        this.updatePathfinding();
      });
    }
  }

  handleEmergency(incident) {
    this.emergencyEgress = true;
    window.logOperation("Navigation Agent", `Active emergency: Route priority shifted to EMERGENCY EXITS.`);
    
    // Automatically set destination to emergency exits
    const endSelect = document.getElementById('nav-end-select');
    if (endSelect) {
      const bestExit = incident.exit.includes('Gate C') ? 'poi_exit_south' : 'poi_exit_north';
      endSelect.value = bestExit;
      this.endPointId = bestExit;
    }
    this.updatePathfinding();
  }

  clearEmergency() {
    this.emergencyEgress = false;
    this.updatePathfinding();
  }

  // Parse location ID to node coordinates
  getNodeCoords(id) {
    if (!id) return { x: 300, y: 100 };
    
    const parts = id.split('_');
    const type = parts[0];
    const key = parts[1];

    if (type === 'gate') {
      const g = this.gates.find(item => item.id === key);
      return g ? { x: g.x, y: g.y, name: g.name } : null;
    }
    if (type === 'sec') {
      const s = this.sections.find(item => item.id === key);
      return s ? { x: s.x, y: s.y, name: s.name } : null;
    }
    if (type === 'poi') {
      const p = this.pois.find(item => item.id === key);
      return p ? { x: p.x, y: p.y, name: p.name } : null;
    }
    return null;
  }

  updatePathfinding() {
    const startNode = this.getNodeCoords(this.startPointId);
    const endNode = this.getNodeCoords(this.endPointId);

    if (!startNode || !endNode) return;

    // Check accessibility restriction
    let isAccessible = this.accessibleOnly;
    if (this.accessibleOnly) {
      // If we are looking for a restroom, ensure it's accessible
      if (this.endPointId.startsWith('poi_')) {
        const poiId = this.endPointId.split('_')[1];
        const poiObj = this.pois.find(p => p.id === poiId);
        if (poiObj && poiObj.type === 'restroom' && !poiObj.accessible) {
          // Force select accessible restroom
          const accessibleRestroom = this.pois.find(p => p.type === 'restroom' && p.accessible);
          if (accessibleRestroom) {
            const endSelect = document.getElementById('nav-end-select');
            if (endSelect) {
              endSelect.value = `poi_${accessibleRestroom.id}`;
              this.endPointId = `poi_${accessibleRestroom.id}`;
              this.updatePathfinding();
              return;
            }
          }
        }
      }
    }

    // Path calculation
    // Generate curved path around the soccer pitch (center: 300, 300)
    const pathString = this.calculateCircumferentialPath(startNode, endNode);
    
    // Calculate estimated walking distance and time
    const directDist = Math.hypot(endNode.x - startNode.x, endNode.y - startNode.y);
    const pathLength = directDist * (pathString.includes('A') ? 1.25 : 1.05); // Curve path overhead
    
    // Distance in meters = pathLength * 0.6;
    const distanceMeters = Math.round(pathLength * 0.6);
    let walkSpeed = 1.3; // m/s
    if (isAccessible) walkSpeed = 0.9; // Wheelchair/slow pace
    if (this.emergencyEgress) walkSpeed = 2.5; // Hurried evac pace
    
    const durationSeconds = distanceMeters / walkSpeed;
    const durationMins = Math.ceil(durationSeconds / 60);

    // Draw route overlay
    this.drawPathOnMap(pathString, isAccessible);

    // Update Navigation UI dashboard box
    const summaryPanel = document.getElementById('nav-summary-panel');
    if (summaryPanel) {
      let routeClass = isAccessible ? 'priority-tag low' : 'priority-tag medium';
      let routeLabel = isAccessible ? 'ACCESSIBLE PATH (NO STAIRS)' : 'STANDARD STADIUM PATHWAY';
      
      if (this.emergencyEgress) {
        routeClass = 'priority-tag critical';
        routeLabel = 'EMERGENCY EVACUATION ROUTE';
      }

      summaryPanel.innerHTML = `
        <div style="margin-bottom: 8px;">
          <span class="${routeClass}">${routeLabel}</span>
        </div>
        <p style="font-size:0.9rem; margin-bottom: 6px;">From: <strong>${startNode.name || startNode.id}</strong></p>
        <p style="font-size:0.9rem; margin-bottom: 12px;">To: <strong>${endNode.name || endNode.id}</strong></p>
        <div class="stats-grid">
          <div class="kpi-card">
            <div class="kpi-title">Est. Distance</div>
            <div class="kpi-value ok">${distanceMeters} m</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Estd. Walk Time</div>
            <div class="kpi-value">${durationMins} min${durationMins > 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="action-box" style="margin-top:12px; font-size:0.8rem;">
          <strong>AI Nav Agent Guidance:</strong> 
          ${this.emergencyEgress 
            ? 'Follow strobe lighting signals along the green route. Volunteers are opening exit corridors.' 
            : `Path is fully cleared of blockages. ${isAccessible ? 'Uses ramps and elevators exclusively.' : 'Includes standard stair accesses.'}`
          }
        </div>
      `;
    }
  }

  // Custom route generator to detour the pitch
  calculateCircumferentialPath(p1, p2) {
    const x0 = this.stadiumCenter.x;
    const y0 = this.stadiumCenter.y;
    
    // Check projection of circle center onto line segment
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    
    let t = ((x0 - p1.x) * dx + (y0 - p1.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    
    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;
    const distToCenter = Math.hypot(projX - x0, projY - y0);

    // If it crosses/too close to center, calculate curved path
    if (distToCenter < this.pitchRadius) {
      const angle1 = Math.atan2(p1.y - y0, p1.x - x0);
      const angle2 = Math.atan2(p2.y - y0, p2.x - x0);
      
      let midAngle = (angle1 + angle2) / 2;
      if (Math.abs(angle1 - angle2) > Math.PI) {
        midAngle += Math.PI;
      }

      const detourRadius = this.pitchRadius + 20;
      const ctrlX = x0 + Math.cos(midAngle) * detourRadius;
      const ctrlY = y0 + Math.sin(midAngle) * detourRadius;

      return `M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`;
    }

    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
  }

  drawPathOnMap(pathString, isAccessible) {
    let pathElement = document.getElementById('svg-nav-path');
    const svg = document.querySelector('.stadium-svg');
    
    if (!svg) return;

    if (!pathElement) {
      pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('id', 'svg-nav-path');
      svg.appendChild(pathElement);
    }

    pathElement.setAttribute('d', pathString);
    pathElement.className.baseVal = `navigation-path ${isAccessible ? 'accessible' : ''} ${this.emergencyEgress ? 'emergency' : ''}`;
    
    const color = this.emergencyEgress ? 'var(--neon-red)' : (isAccessible ? 'var(--neon-green)' : 'var(--neon-blue)');
    pathElement.setAttribute('style', `filter: drop-shadow(0 0 8px ${color})`);
  }
}

// Make globally accessible
window.NavigationAgent = NavigationAgent;
