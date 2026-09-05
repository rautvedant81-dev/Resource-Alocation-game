/**
 * ==========================================================================
 * KERNEL MASTER: Resource Allocation Graph (RAG) Visualizer & Cycle Detector
 * Interactive HTML5 Canvas graph showing Process nodes (circles),
 * Resource nodes (boxes with unit dots), Request & Allocation directed edges,
 * and live cycle detection with red glow highlighting.
 * ==========================================================================
 */

class RAGVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.nodes = []; // { id, type: 'process'|'resource', name, x, y, radius/w/h, units: 1, allocatedUnits: 0 }
    this.edges = []; // { fromId, toId, type: 'request'|'allocation', units: 1, isCycle: false }

    this.draggingNode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.selectedNode = null;

    this.hasCycle = false;
    this.cycleNodes = new Set();
    this.cycleEdges = new Set();

    if (this.canvas) {
      this.initEvents();
      this.render();
    }
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.onMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  findNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      if (n.type === 'process') {
        const dx = x - n.x;
        const dy = y - n.y;
        if (Math.sqrt(dx * dx + dy * dy) <= (n.radius || 24)) return n;
      } else {
        const w = n.w || 54;
        const h = n.h || 44;
        if (x >= n.x - w / 2 && x <= n.x + w / 2 && y >= n.y - h / 2 && y <= n.y + h / 2) return n;
      }
    }
    return null;
  }

  onMouseDown(e) {
    const pos = this.getMousePos(e);
    const hit = this.findNodeAt(pos.x, pos.y);

    if (hit) {
      this.draggingNode = hit;
      this.dragOffset = { x: pos.x - hit.x, y: pos.y - hit.y };

      // Node connection logic if clicked sequentially
      if (this.selectedNode && this.selectedNode !== hit) {
        // Create edge
        if (this.selectedNode.type === 'process' && hit.type === 'resource') {
          // Process requests Resource (Request Edge)
          this.addEdge(this.selectedNode.id, hit.id, 'request');
        } else if (this.selectedNode.type === 'resource' && hit.type === 'process') {
          // Resource allocated to Process (Allocation Edge)
          this.addEdge(this.selectedNode.id, hit.id, 'allocation');
        }
        this.selectedNode = null;
      } else {
        this.selectedNode = hit;
      }
    } else {
      this.selectedNode = null;
    }
    this.render();
  }

  onMouseMove(e) {
    if (this.draggingNode) {
      const pos = this.getMousePos(e);
      this.draggingNode.x = Math.max(30, Math.min(this.canvas.width - 30, pos.x - this.dragOffset.x));
      this.draggingNode.y = Math.max(30, Math.min(this.canvas.height - 30, pos.y - this.dragOffset.y));
      this.render();
    }
  }

  onMouseUp() {
    this.draggingNode = null;
    this.detectCycles();
    this.render();
  }

  addEdge(fromId, toId, type = 'request', units = 1) {
    // Check if edge already exists
    const exists = this.edges.find(e => e.fromId === fromId && e.toId === toId);
    if (!exists) {
      this.edges.push({ fromId, toId, type, units, isCycle: false });
      if (window.soundFx) window.soundFx.playAllocate(1.2);
    }
    this.detectCycles();
    this.render();
  }

  clear() {
    this.nodes = [];
    this.edges = [];
    this.hasCycle = false;
    this.cycleNodes.clear();
    this.cycleEdges.clear();
    this.render();
    this.updateStatusBadge();
  }

  syncFromBanker(level, allocMatrix, needMatrix, availableVector) {
    this.clear();
    if (!level) return;

    const procCount = level.processes.length;
    const resCount = level.resources.length;

    // Layout processes on left, resources on right
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;

    const procSpacingY = canvasH / (procCount + 1);
    const resSpacingY = canvasH / (resCount + 1);

    // Create Process Nodes
    level.processes.forEach((p, idx) => {
      this.nodes.push({
        id: `proc_${idx}`,
        type: 'process',
        name: p.name,
        x: canvasW * 0.28,
        y: procSpacingY * (idx + 1),
        radius: 24
      });
    });

    // Create Resource Nodes
    level.resources.forEach((rName, idx) => {
      const totalUnits = (allocMatrix ? allocMatrix.reduce((sum, row) => sum + row[idx], 0) : 0) + (availableVector ? availableVector[idx] : 0);
      this.nodes.push({
        id: `res_${idx}`,
        type: 'resource',
        name: rName,
        x: canvasW * 0.72,
        y: resSpacingY * (idx + 1),
        w: 60,
        h: 46,
        units: Math.max(1, totalUnits || level.totalInstances[idx] || 1)
      });
    });

    // Create Allocation Edges (Resource -> Process)
    if (allocMatrix) {
      for (let i = 0; i < procCount; i++) {
        for (let j = 0; j < resCount; j++) {
          const allocCount = allocMatrix[i][j];
          if (allocCount > 0) {
            this.edges.push({
              fromId: `res_${j}`,
              toId: `proc_${i}`,
              type: 'allocation',
              units: allocCount,
              isCycle: false
            });
          }
        }
      }
    }

    // Create Request Edges (Process -> Resource) based on Need
    if (needMatrix) {
      for (let i = 0; i < procCount; i++) {
        for (let j = 0; j < resCount; j++) {
          const needCount = needMatrix[i][j];
          if (needCount > 0) {
            this.edges.push({
              fromId: `proc_${i}`,
              toId: `res_${j}`,
              type: 'request',
              units: needCount,
              isCycle: false
            });
          }
        }
      }
    }

    this.detectCycles();
    this.render();
  }

  injectDeadlockCycle() {
    this.clear();
    // Classic 2-process, 2-resource deadlock cycle (P0 holds R0, requests R1; P1 holds R1, requests R0)
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.nodes.push(
      { id: 'proc_0', type: 'process', name: 'P0', x: cx - 140, y: cy - 90, radius: 24 },
      { id: 'proc_1', type: 'process', name: 'P1', x: cx + 140, y: cy + 90, radius: 24 },
      { id: 'res_0', type: 'resource', name: 'RAM (R0)', x: cx - 140, y: cy + 90, w: 70, h: 48, units: 1 },
      { id: 'res_1', type: 'resource', name: 'Disk (R1)', x: cx + 140, y: cy - 90, w: 70, h: 48, units: 1 }
    );

    this.edges.push(
      { fromId: 'res_0', toId: 'proc_0', type: 'allocation', units: 1, isCycle: false },
      { fromId: 'proc_0', toId: 'res_1', type: 'request', units: 1, isCycle: false },
      { fromId: 'res_1', toId: 'proc_1', type: 'allocation', units: 1, isCycle: false },
      { fromId: 'proc_1', toId: 'res_0', type: 'request', units: 1, isCycle: false }
    );

    if (window.soundFx) window.soundFx.playDeadlockAlarm();
    this.detectCycles();
    this.render();
  }

  /**
   * Cycle Detection using DFS
   */
  detectCycles() {
    this.hasCycle = false;
    this.cycleNodes.clear();
    this.cycleEdges.clear();

    const adj = new Map();
    this.nodes.forEach(n => adj.set(n.id, []));
    this.edges.forEach(e => {
      if (adj.has(e.fromId)) {
        adj.get(e.fromId).push({ to: e.toId, edge: e });
      }
    });

    const visited = new Set();
    const recStack = new Set();
    const parentEdge = new Map();

    const dfs = (nodeId, path) => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const { to, edge } of neighbors) {
        if (!visited.has(to)) {
          parentEdge.set(to, { from: nodeId, edge });
          if (dfs(to, [...path, nodeId])) return true;
        } else if (recStack.has(to)) {
          // Cycle found!
          this.hasCycle = true;
          this.cycleNodes.add(to);
          this.cycleNodes.add(nodeId);
          this.cycleEdges.add(edge);
          edge.isCycle = true;

          // Backtrack along path to collect cycle nodes
          let curr = nodeId;
          while (curr !== to && parentEdge.has(curr)) {
            const p = parentEdge.get(curr);
            this.cycleNodes.add(p.from);
            this.cycleEdges.add(p.edge);
            p.edge.isCycle = true;
            curr = p.from;
          }
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    this.edges.forEach(e => { e.isCycle = false; });
    for (const node of this.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id, [])) break;
      }
    }

    this.updateStatusBadge();
  }

  updateStatusBadge() {
    const badge = document.getElementById('ragCycleBadge');
    const text = document.getElementById('ragCycleStatus');
    if (!badge || !text) return;

    if (this.hasCycle) {
      badge.className = 'safety-badge deadlock';
      text.textContent = '⚠️ DEADLOCK CYCLE DETECTED (Circular Wait!)';
    } else {
      badge.className = 'safety-badge safe';
      text.textContent = '🟢 NO CYCLE DETECTED (System Safe)';
    }
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Edges
    this.edges.forEach(e => {
      const fromNode = this.nodes.find(n => n.id === e.fromId);
      const toNode = this.nodes.find(n => n.id === e.toId);
      if (fromNode && toNode) {
        this.drawArrow(fromNode, toNode, e);
      }
    });

    // Draw Nodes
    this.nodes.forEach(n => {
      if (n.type === 'process') {
        this.drawProcessNode(n);
      } else {
        this.drawResourceNode(n);
      }
    });
  }

  drawArrow(from, to, edge) {
    const ctx = this.ctx;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;

    // Offset to edge of circle / box
    const startX = from.x + nx * (from.type === 'process' ? from.radius : 26);
    const startY = from.y + ny * (from.type === 'process' ? from.radius : 20);
    const endX = to.x - nx * (to.type === 'process' ? to.radius + 6 : 28);
    const endY = to.y - ny * (to.type === 'process' ? to.radius + 6 : 22);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

    if (edge.isCycle) {
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 10;
    } else if (edge.type === 'request') {
      ctx.strokeStyle = '#ffb830';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(255, 184, 48, 0.4)';
      ctx.shadowBlur = 6;
    } else {
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 255, 204, 0.4)';
      ctx.shadowBlur = 6;
    }
    ctx.stroke();

    // Draw Arrowhead
    const headLen = 10;
    const angle = Math.atan2(endY - startY, endX - startX);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Edge Units Label
    if (edge.units > 1) {
      const midX = (startX + endX) / 2 + ny * 10;
      const midY = (startY + endY) / 2 - nx * 10;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText(`×${edge.units}`, midX - 6, midY + 4);
    }
    ctx.restore();
  }

  drawProcessNode(node) {
    const ctx = this.ctx;
    const isCycle = this.cycleNodes.has(node.id);
    const isSelected = this.selectedNode === node;

    ctx.save();
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

    ctx.fillStyle = '#0d172e';
    ctx.fill();

    ctx.lineWidth = isSelected ? 3 : 2;
    if (isCycle) {
      ctx.strokeStyle = '#ff3366';
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 12;
    } else if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 12;
    } else {
      ctx.strokeStyle = '#00ffcc';
      ctx.shadowColor = 'rgba(0, 255, 204, 0.4)';
      ctx.shadowBlur = 6;
    }
    ctx.stroke();

    // Label
    ctx.fillStyle = isCycle ? '#ff99aa' : '#ffffff';
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.name, node.x, node.y);

    ctx.restore();
  }

  drawResourceNode(node) {
    const ctx = this.ctx;
    const w = node.w || 60;
    const h = node.h || 46;
    const isCycle = this.cycleNodes.has(node.id);
    const isSelected = this.selectedNode === node;

    ctx.save();
    ctx.fillStyle = '#161233';
    ctx.fillRect(node.x - w / 2, node.y - h / 2, w, h);

    ctx.lineWidth = isSelected ? 3 : 2;
    if (isCycle) {
      ctx.strokeStyle = '#ff3366';
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 12;
    } else if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
    } else {
      ctx.strokeStyle = '#a855f7';
      ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';
      ctx.shadowBlur = 6;
    }
    ctx.strokeRect(node.x - w / 2, node.y - h / 2, w, h);

    // Label
    ctx.fillStyle = isCycle ? '#ff99aa' : '#e9d5ff';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(node.name, node.x, node.y - h / 2 + 12);

    // Resource Unit Dots
    const units = Math.min(6, node.units || 1);
    const dotRadius = 3;
    const dotSpacing = 10;
    const startX = node.x - ((units - 1) * dotSpacing) / 2;
    const dotY = node.y + 8;

    for (let i = 0; i < units; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * dotSpacing, dotY, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.fill();
    }

    ctx.restore();
  }
}

window.RAGVisualizer = RAGVisualizer;
