/**
 * ==========================================================================
 * KERNEL MASTER: OS Theory Knowledge Hub & Interactive Reference
 * Comprehensive educational summaries with interactive tabs & diagrams.
 * ==========================================================================
 */

const OS_THEORY_TOPICS = {
  bankers: {
    title: "Banker's Algorithm & Safe State Evaluation",
    content: `
      <h2>🛡️ Dijkstra's Banker's Algorithm</h2>
      <p>
        The <strong>Banker's Algorithm</strong> is a classic deadlock avoidance algorithm developed by Edsger Dijkstra. 
        It is named after banking systems that never allocate cash unless they can satisfy the cash demands of all their customers in some sequence.
      </p>

      <h3>1. The Core Data Structures</h3>
      <ul>
        <li><strong>Available Vector ($m$):</strong> If <code>Available[j] = k</code>, there are $k$ units of resource type $R_j$ currently unallocated.</li>
        <li><strong>Max Matrix ($n \times m$):</strong> If <code>Max[i][j] = k</code>, process $P_i$ may request at most $k$ units of resource $R_j$.</li>
        <li><strong>Allocation Matrix ($n \times m$):</strong> If <code>Allocation[i][j] = k</code>, process $P_i$ is currently allocated $k$ units of $R_j$.</li>
        <li><strong>Need Matrix ($n \times m$):</strong> <code>Need[i][j] = Max[i][j] - Allocation[i][j]</code>. Indicates remaining resources $P_i$ may need to finish.</li>
      </ul>

      <div class="theory-diagram-card">
Need[i][j] = Max[i][j] - Allocation[i][j]
Work = Available
Finish[i] = false for all i
If Need[i] <= Work:
    Work = Work + Allocation[i]
    Finish[i] = true
      </div>

      <h3>2. Safe State Definition</h3>
      <p>
        A system state is <strong>SAFE</strong> if there exists a sequence $\langle P_1, P_2, \dots, P_n \rangle$ of ALL processes in the system such that for each $P_i$, the resources that $P_i$ can still request can be satisfied by the currently available resources plus the resources already held by all preceding processes $P_j$ ($j < i$).
      </p>
    `
  },

  deadlock: {
    title: "The 4 Coffman Deadlock Conditions",
    content: `
      <h2>⚠️ The 4 Coffman Conditions for Deadlock</h2>
      <p>
        In 1971, Edward G. Coffman Jr. proved that a deadlock can arise <strong>if and only if</strong> all four of the following conditions hold simultaneously in a system:
      </p>

      <h3>1. Mutual Exclusion</h3>
      <p>At least one resource must be held in a non-shareable mode (only one process can use the resource at any given time).</p>

      <h3>2. Hold and Wait</h3>
      <p>A process must be currently holding at least one resource and actively waiting to acquire additional resources that are held by other processes.</p>

      <h3>3. No Preemption</h3>
      <p>Resources cannot be forcibly confiscated from a process; a resource can be released only voluntarily by the process holding it after completing its task.</p>

      <h3>4. Circular Wait</h3>
      <p>
        A closed chain of processes exists: $\{P_0, P_1, \dots, P_n\}$ such that $P_0$ is waiting for a resource held by $P_1$, $P_1$ is waiting for $P_2$, ..., and $P_n$ is waiting for $P_0$.
      </p>

      <div class="theory-diagram-card">
[ P0 ] --holds--> ( R0 ) <--waits-- [ P1 ]
  |                                   ^
  +---waits---> ( R1 ) <--holds-------+
  CIRCULAR DEPENDENCY = DEADLOCK!
      </div>
    `
  },

  prevention: {
    title: "Deadlock Handling Strategies: Prevention vs Avoidance vs Detection",
    content: `
      <h2>🛡️ Deadlock Handling Strategies</h2>
      <table class="cyber-table" style="margin: 16px 0;">
        <thead>
          <tr>
            <th>Strategy</th>
            <th>How It Works</th>
            <th>Pros / Cons</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Deadlock Prevention</strong></td>
            <td>Ensure at design time that at least one of the 4 Coffman conditions can never hold.</td>
            <td>High resource underutilization and low throughput.</td>
          </tr>
          <tr>
            <td><strong>Deadlock Avoidance</strong></td>
            <td>OS dynamically inspects every request (Banker's Algo) and only grants if state remains Safe.</td>
            <td>Optimal safety, but processes must declare maximum claim in advance.</td>
          </tr>
          <tr>
            <td><strong>Deadlock Detection & Recovery</strong></td>
            <td>Allow deadlocks to occur, periodically run detection algorithms, then recover via process termination or preemption.</td>
            <td>High throughput during normal execution, but recovery cost is high.</td>
          </tr>
        </tbody>
      </table>

      <h3>Prevention Techniques</h3>
      <ul>
        <li><strong>Eliminate Hold & Wait:</strong> Require processes to request all resources at once before starting execution.</li>
        <li><strong>Eliminate No Preemption:</strong> If a process holding resources requests a resource that is unavailable, all its current resources are preempted.</li>
        <li><strong>Eliminate Circular Wait (Resource Ordering):</strong> Impose a total global order on all resource types $F: R \to \mathbb{N}$. Processes can only request resources in strictly increasing order $F(R_i) < F(R_j)$.</li>
      </ul>
    `
  },

  rag: {
    title: "Resource Allocation Graphs (RAG)",
    content: `
      <h2>🕸️ Resource Allocation Graph (RAG)</h2>
      <p>
        A <strong>Resource Allocation Graph</strong> is a directed graph $G = (V, E)$ used to visually describe system state and detect deadlocks.
      </p>

      <h3>Graph Vertices ($V$):</h3>
      <ul>
        <li><strong>Process Nodes ($P$):</strong> Represented as Circles ($P_1, P_2, \dots$).</li>
        <li><strong>Resource Nodes ($R$):</strong> Represented as Rectangles ($R_1, R_2, \dots$) containing dots for individual resource units/instances.</li>
      </ul>

      <h3>Graph Edges ($E$):</h3>
      <ul>
        <li><strong>Request Edge ($P_i \to R_j$):</strong> Directed from Process to Resource, meaning $P_i$ has requested an instance of $R_j$ and is currently waiting.</li>
        <li><strong>Allocation Edge ($R_j \to P_i$):</strong> Directed from an instance dot inside Resource to Process, meaning an instance of $R_j$ has been granted to $P_i$.</li>
      </ul>

      <div class="theory-diagram-card">
Single-Unit Resources:  CYCLE  ===>  DEADLOCK GUARANTEED
Multi-Unit Resources:   CYCLE  ===>  DEADLOCK POSSIBLE (Candidate)
      </div>
    `
  },

  fcfs: {
    title: "FCFS (First-Come, First-Served) & The Convoy Effect",
    content: `
      <h2>⏱️ First-Come, First-Served (FCFS)</h2>
      <p>
        The simplest CPU scheduling algorithm. Processes are dispatched strictly in the order of their arrival in the Ready Queue (FIFO queue).
      </p>
      <ul>
        <li><strong>Type:</strong> Non-preemptive.</li>
        <li><strong>Pros:</strong> Simple, minimal overhead, zero starvation.</li>
        <li><strong>Cons:</strong> Highly sensitive to arrival order. Average Waiting Time is often very high.</li>
      </ul>

      <h3>The Convoy Effect</h3>
      <p>
        When a CPU-bound process with a huge burst time (e.g., 30ms) arrives first, all subsequent short I/O-bound processes (e.g., 2ms) get stuck waiting behind it. This drags down system throughput and CPU utilization.
      </p>
    `
  },

  sjf: {
    title: "SJF & SRTF (Shortest Job First / Shortest Remaining Time First)",
    content: `
      <h2>⚡ Shortest Job First (SJF) & SRTF</h2>
      <p>
        Associates with each process the length of its next CPU burst. When the CPU is free, it is assigned to the process with the smallest burst time.
      </p>

      <h3>Key Characteristics</h3>
      <ul>
        <li><strong>SJF (Non-Preemptive):</strong> Once the CPU is allocated to a process, it cannot be preempted until its burst is finished.</li>
        <li><strong>SRTF (Preemptive SJF):</strong> If a new process arrives with a CPU burst length shorter than the remaining time of the currently executing process, the current process is <em>preempted</em>.</li>
        <li><strong>Provable Optimality:</strong> SJF/SRTF is mathematically provable to yield the <strong>minimum Average Waiting Time (AWT)</strong> for any given set of processes!</li>
        <li><strong>Major Drawback:</strong> Long processes can suffer from <strong>Starvation (Indefinite Blocking)</strong> if short processes continuously arrive.</li>
      </ul>
    `
  },

  priority: {
    title: "Priority Scheduling & Starvation Solutions",
    content: `
      <h2>🎯 Priority Scheduling</h2>
      <p>
        A priority number (integer) is associated with each process. The CPU is allocated to the process with the highest priority (commonly, lowest numerical integer = highest priority).
      </p>

      <h3>The Starvation Problem & Aging</h3>
      <p>
        A major problem with priority scheduling is <strong>Starvation</strong>: low-priority processes may wait indefinitely if there is a steady stream of higher-priority processes.
      </p>
      <p>
        <strong>The Solution: AGING.</strong> The OS gradually increases the priority of processes that wait in the system for a long time (e.g., increase priority by 1 every 10 seconds). Eventually, even the lowest priority process becomes the highest priority and executes!
      </p>
    `
  },

  roundrobin: {
    title: "Round Robin (RR) & Time Quantum Trade-offs",
    content: `
      <h2>🔄 Round Robin (RR) Scheduling</h2>
      <p>
        Designed especially for time-sharing systems. A small unit of time, called a <strong>Time Quantum ($q$)</strong> or time slice (usually 10 to 100 milliseconds), is defined. The Ready Queue is treated as a circular FIFO queue.
      </p>

      <h3>The Quantum Trade-Off Dilemma</h3>
      <ul>
        <li><strong>If $q$ is extremely large:</strong> Round Robin degenerates into standard FCFS policy.</li>
        <li><strong>If $q$ is extremely small:</strong> The scheduling policy is called <em>processor sharing</em>, but creates huge <strong>Context Switch Overhead</strong>, wasting CPU cycles.</li>
        <li><strong>Rule of Thumb:</strong> About <strong>80% of CPU bursts</strong> should be shorter than the time quantum $q$.</li>
      </ul>
    `
  },

  formulas: {
    title: "Formulas & Metrics Cheat-Sheet",
    content: `
      <h2>📐 OS Performance Formulas Cheat-Sheet</h2>
      
      <div class="theory-diagram-card">
1. Turnaround Time (TAT):
   TAT = Completion Time - Arrival Time
   (Total time elapsed from process submission to completion)

2. Waiting Time (WT):
   WT = Turnaround Time - Burst Time
   (Total time process spent waiting in Ready Queue)

3. Response Time (RT):
   RT = Time of First CPU Allocation - Arrival Time

4. Average Waiting Time (AWT):
   AWT = (Sum of all WT) / (Number of Processes)

5. Average Turnaround Time (ATAT):
   ATAT = (Sum of all TAT) / (Number of Processes)

6. CPU Utilization (%):
   Utilization = (CPU Busy Time / Total Simulation Time) * 100

7. Banker's Need Equation:
   Need[i][j] = Max[i][j] - Allocation[i][j]
      </div>
    `
  }
};

class TheoryHub {
  constructor() {
    this.contentEl = document.getElementById('theoryContentBody');
    this.init();
  }

  init() {
    document.querySelectorAll('.theory-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.theory-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const topicKey = btn.dataset.topic;
        this.renderTopic(topicKey);
      });
    });

    this.renderTopic('bankers');
  }

  renderTopic(topicKey) {
    if (!this.contentEl) return;
    const topic = OS_THEORY_TOPICS[topicKey] || OS_THEORY_TOPICS.bankers;
    this.contentEl.innerHTML = topic.content;
  }
}

window.TheoryHub = TheoryHub;
