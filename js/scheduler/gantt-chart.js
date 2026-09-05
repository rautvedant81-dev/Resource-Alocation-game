/**
 * ==========================================================================
 * KERNEL MASTER: Dynamic Gantt Chart Visualizer
 * Renders high-fidelity responsive execution timelines with time markers,
 * idle slots, context switches, and hover tooltips.
 * ==========================================================================
 */

class GanttChartRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(simulationResult) {
    if (!this.container) return;
    this.container.innerHTML = '';

    const { timeline, totalTime } = simulationResult;
    if (!timeline || timeline.length === 0 || totalTime === 0) {
      this.container.innerHTML = '<div class="gantt-empty-msg">No simulation timeline data available.</div>';
      return;
    }

    const minWidthPerUnit = 24; // pixels per ms
    const totalPixelWidth = Math.max(600, totalTime * minWidthPerUnit);

    const chartWrap = document.createElement('div');
    chartWrap.className = 'gantt-render-area';
    chartWrap.style.width = `${totalPixelWidth}px`;

    // 1. Process Timeline Track
    const track = document.createElement('div');
    track.className = 'gantt-timeline-track';

    timeline.forEach(block => {
      const blockEl = document.createElement('div');
      const widthPercent = (block.duration / totalTime) * 100;
      blockEl.className = `gantt-block ${block.isIdle ? 'idle' : ''}`;
      blockEl.style.width = `${widthPercent}%`;
      if (!block.isIdle) {
        blockEl.style.backgroundColor = block.color;
      }

      blockEl.title = `${block.processName} [${block.startTime}ms → ${block.endTime}ms] (Duration: ${block.duration}ms)`;
      blockEl.innerHTML = `
        <span class="block-label">${block.processName}</span>
        <span class="block-sub-time">${block.duration}ms</span>
      `;

      track.appendChild(blockEl);
    });

    // 2. Time Axis & Number Marks
    const axis = document.createElement('div');
    axis.className = 'gantt-time-axis';

    // Add mark at 0
    const startMark = document.createElement('div');
    startMark.className = 'gantt-time-mark';
    startMark.style.left = '0%';
    startMark.textContent = '0';
    axis.appendChild(startMark);

    timeline.forEach(block => {
      const mark = document.createElement('div');
      mark.className = 'gantt-time-mark';
      const percent = (block.endTime / totalTime) * 100;
      mark.style.left = `${percent}%`;
      mark.textContent = `${block.endTime}`;
      axis.appendChild(mark);
    });

    chartWrap.appendChild(track);
    chartWrap.appendChild(axis);
    this.container.appendChild(chartWrap);
  }
}

window.GanttChartRenderer = GanttChartRenderer;
