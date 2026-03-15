import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";
import { SKILLS } from "./skills.js";

// ── Types ───────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  category: "root" | "skill" | "workflow" | "shared" | "agent" | "memory";
  group?: string;
  subgroup?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: "references" | "implements";
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── Constants ───────────────────────────────────────────────────

const SKILL_CATS = Object.fromEntries(
  Object.entries(SKILLS).map(([cat, items]) => [cat, items.map((s) => s.name)]),
);

const AGENT_SKILL_MAP: Record<string, string> = {
  "backend-impl": "backend-agent",
  "frontend-impl": "frontend-agent",
  "db-impl": "db-agent",
  "mobile-impl": "mobile-agent",
  "pm-planner": "pm-agent",
  "qa-reviewer": "qa-agent",
  "debug-investigator": "debug-agent",
};

// ── Helpers ─────────────────────────────────────────────────────

function findSharedRefs(content: string): string[] {
  const refs = new Set<string>();
  for (const m of content.matchAll(/_shared\/([a-z][a-z0-9_-]*)/gi)) {
    refs.add(m[1]);
  }
  return [...refs];
}

function tryRead(path: string): string {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return "";
  }
}

function tryDir(dir: string): string[] {
  try {
    return readdirSync(dir).filter((f) => !f.startsWith("."));
  } catch {
    return [];
  }
}

function tryDirEntries(dir: string) {
  try {
    return readdirSync(dir, { withFileTypes: true }).filter(
      (d) => !d.name.startsWith("."),
    );
  } catch {
    return [];
  }
}

// ── Graph Builder ───────────────────────────────────────────────

export function buildGraph(root: string): Graph {
  const nodes: GraphNode[] = [
    { id: "root", label: "oh-my-agent", category: "root" },
  ];
  const seen = new Set<string>();
  const edges: GraphEdge[] = [];

  function edge(from: string, to: string, type: "references" | "implements") {
    const k = `${from}|${to}`;
    if (seen.has(k)) return;
    seen.add(k);
    edges.push({ from, to, type });
  }

  // Skills
  const skillsBase = join(root, ".agents", "skills");
  for (const [cat, names] of Object.entries(SKILL_CATS)) {
    for (const name of names) {
      const dir = join(skillsBase, name);
      if (!existsSync(dir)) continue;
      const id = `skill:${name}`;
      nodes.push({
        id,
        label: name,
        category: "skill",
        group: "Skills",
        subgroup: cat,
      });
      const content = [
        tryRead(join(dir, "SKILL.md")),
        tryRead(join(dir, "resources", "execution-protocol.md")),
      ].join("\n");
      for (const ref of findSharedRefs(content))
        edge(id, `shared:${ref}`, "references");
    }
  }

  // Workflows
  const wfDir = join(root, ".agents", "workflows");
  for (const f of tryDir(wfDir).filter((f) => f.endsWith(".md"))) {
    const name = f.replace(".md", "");
    const id = `workflow:${name}`;
    nodes.push({ id, label: name, category: "workflow", group: "Workflows" });
    for (const ref of findSharedRefs(tryRead(join(wfDir, f))))
      edge(id, `shared:${ref}`, "references");
  }

  // Shared
  const sharedDir = join(skillsBase, "_shared");
  for (const entry of tryDirEntries(sharedDir)) {
    const name = entry.isDirectory()
      ? entry.name
      : entry.name.replace(".md", "");
    const id = `shared:${name}`;
    nodes.push({
      id,
      label: name,
      category: "shared",
      group: "Shared",
    });
    if (!entry.isDirectory() && entry.name.endsWith(".md")) {
      for (const ref of findSharedRefs(tryRead(join(sharedDir, entry.name)))) {
        if (ref !== name) edge(id, `shared:${ref}`, "references");
      }
    }
  }

  // Claude Agents
  const claudeDir = join(root, ".claude", "agents");
  for (const f of tryDir(claudeDir).filter((f) => f.endsWith(".md"))) {
    const name = f.replace(".md", "");
    const id = `agent:${name}`;
    nodes.push({
      id,
      label: name,
      category: "agent",
      group: "Claude Agents",
    });
    const skill = AGENT_SKILL_MAP[name];
    if (skill) edge(id, `skill:${skill}`, "implements");
  }

  // Serena Memories
  const memDir = join(root, ".serena", "memories");
  for (const f of tryDir(memDir).filter((f) => f.endsWith(".md"))) {
    nodes.push({
      id: `memory:${f.replace(".md", "")}`,
      label: f.replace(".md", ""),
      category: "memory",
      group: "Serena Memories",
    });
  }

  const ids = new Set(nodes.map((n) => n.id));
  return {
    nodes,
    edges: edges.filter((e) => ids.has(e.from) && ids.has(e.to)),
  };
}

// ── ASCII Renderer ──────────────────────────────────────────────

const CC: Record<string, (s: string) => string> = {
  root: (s) => pc.bold(pc.white(s)),
  skill: pc.green,
  workflow: pc.blue,
  shared: pc.yellow,
  agent: pc.magenta,
  memory: pc.cyan,
};

function col(text: string, cat: string) {
  return (CC[cat] ?? pc.white)(text);
}

// Place colored text at exact display positions
function placeLine(
  ...segments: [pos: number, text: string, displayWidth: number][]
): string {
  const sorted = segments.sort((a, b) => a[0] - b[0]);
  let result = "";
  let cursor = 0;
  for (const [pos, text, width] of sorted) {
    if (pos > cursor) result += " ".repeat(pos - cursor);
    result += text;
    cursor = pos + width;
  }
  return result;
}

function renderOverview(graph: Graph): string[] {
  const o: string[] = [];

  const nSk = graph.nodes.filter((n) => n.category === "skill").length;
  const nWf = graph.nodes.filter((n) => n.category === "workflow").length;
  const nSh = graph.nodes.filter((n) => n.category === "shared").length;
  const nAg = graph.nodes.filter((n) => n.category === "agent").length;
  const nMe = graph.nodes.filter((n) => n.category === "memory").length;

  const skRef = graph.edges.filter(
    (e) => e.from.startsWith("skill:") && e.to.startsWith("shared:"),
  ).length;
  const wfRef = graph.edges.filter(
    (e) => e.from.startsWith("workflow:") && e.to.startsWith("shared:"),
  ).length;
  const agImpl = graph.edges.filter((e) => e.type === "implements").length;
  const shSelf = graph.edges.filter(
    (e) => e.from.startsWith("shared:") && e.to.startsWith("shared:"),
  ).length;

  const skL = `Skills (${nSk})`;
  const wfL = `Workflows (${nWf})`;
  const shL = `Shared (${nSh})`;
  const agL = `Agents (${nAg})`;
  const meL = `Memories (${nMe})`;

  // Column centers
  const C1 = 10;
  const C2 = 29;
  const C3 = 48;
  const MID = 19;

  // Root
  o.push(placeLine([C2 - 5, col("oh-my-agent", "root"), 11]));
  o.push(placeLine([C2, "│", 1]));

  // Branch ┌─────┼─────┐
  const bch: string[] = Array(C3 + 1).fill(" ");
  bch[C1] = "┌";
  bch[C2] = "┼";
  bch[C3] = "┐";
  for (let i = C1 + 1; i < C3; i++) if (i !== C2) bch[i] = "─";
  o.push(bch.join(""));

  // ▼ markers
  o.push(placeLine([C1, "▼", 1], [C2, "▼", 1], [C3, "▼", 1]));

  // Group labels
  o.push(
    placeLine(
      [C1 - (skL.length >> 1), col(skL, "skill"), skL.length],
      [C2 - (wfL.length >> 1), col(wfL, "workflow"), wfL.length],
      [C3 - (meL.length >> 1), col(meL, "memory"), meL.length],
    ),
  );

  // │ down from Skills & Workflows
  o.push(placeLine([C1, "│", 1], [C2, "│", 1]));

  // Ref counts
  const skRefL = `${skRef} refs`;
  const wfRefL = `${wfRef} refs`;
  o.push(
    placeLine(
      [C1 - (skRefL.length >> 1), pc.dim(skRefL), skRefL.length],
      [C2 - (wfRefL.length >> 1), pc.dim(wfRefL), wfRefL.length],
    ),
  );

  o.push(placeLine([C1, "│", 1], [C2, "│", 1]));

  // Merge └───┬───┘
  const mch: string[] = Array(C2 + 1).fill(" ");
  mch[C1] = "└";
  mch[MID] = "┬";
  mch[C2] = "┘";
  for (let i = C1 + 1; i < C2; i++) if (i !== MID) mch[i] = "─";
  o.push(mch.join(""));

  o.push(placeLine([MID, "▼", 1]));

  // Shared
  const shStart = MID - (shL.length >> 1);
  let shLine = placeLine([shStart, col(shL, "shared"), shL.length]);
  if (shSelf > 0) shLine += `  ${pc.dim(`◂── ${shSelf} internal`)}`;
  o.push(shLine);

  o.push("");

  // Agents → Skills
  const agStart = C1 - (agL.length >> 1);
  const implL = `──[${agImpl} implements]──▸`;
  o.push(
    placeLine([agStart, col(agL, "agent"), agL.length]) +
      ` ${pc.dim(implL)} ${col("Skills", "skill")}`,
  );

  return o;
}

export function renderAscii(graph: Graph): string {
  const o: string[] = [];

  // Graph overview
  o.push(...renderOverview(graph));
  o.push("");
  o.push(pc.dim("─".repeat(56)));
  o.push("");

  // Build outgoing edge map + incoming ref counts
  const outMap = new Map<string, GraphEdge[]>();
  const inCount = new Map<string, number>();
  for (const e of graph.edges) {
    if (!outMap.has(e.from)) outMap.set(e.from, []);
    outMap.get(e.from)?.push(e);
    if (e.to.startsWith("shared:"))
      inCount.set(e.to, (inCount.get(e.to) ?? 0) + 1);
  }

  function refs(id: string): string {
    const r = outMap.get(id);
    if (!r?.length) return "";
    const names = r.map(
      (e) =>
        graph.nodes.find((n) => n.id === e.to)?.label.replace(/\.md$/, "") ??
        e.to.split(":")[1],
    );
    const txt =
      names.length > 4
        ? `${names.slice(0, 3).join(", ")} +${names.length - 3}`
        : names.join(", ");
    return ` ${pc.dim("──▸")} ${pc.dim(txt)}`;
  }

  // Detail: Skills
  const skills = graph.nodes.filter((n) => n.category === "skill");
  const subs = Object.keys(SKILL_CATS);
  o.push(pc.bold(`Skills (${skills.length})`));
  for (let gi = 0; gi < subs.length; gi++) {
    const sg = subs[gi];
    const items = skills.filter((s) => s.subgroup === sg);
    if (!items.length) continue;
    const last = gi === subs.length - 1;
    o.push(`${last ? "└─" : "├─"} ${pc.dim(sg)}`);
    const pre = last ? "   " : "│  ";
    for (let i = 0; i < items.length; i++) {
      const c = i === items.length - 1 ? "└─" : "├─";
      o.push(`${pre}${c} ${col(items[i].label, "skill")}${refs(items[i].id)}`);
    }
  }
  o.push("");

  // Detail: Workflows
  const wfs = graph.nodes.filter((n) => n.category === "workflow");
  o.push(pc.bold(`Workflows (${wfs.length})`));
  for (let i = 0; i < wfs.length; i++) {
    const c = i === wfs.length - 1 ? "└─" : "├─";
    o.push(`${c} ${col(wfs[i].label, "workflow")}${refs(wfs[i].id)}`);
  }
  o.push("");

  // Detail: Shared (sorted by incoming refs desc)
  const sh = [...graph.nodes.filter((n) => n.category === "shared")].sort(
    (a, b) => (inCount.get(b.id) ?? 0) - (inCount.get(a.id) ?? 0),
  );
  o.push(pc.bold(`Shared (${sh.length})`));
  for (let i = 0; i < sh.length; i++) {
    const c = i === sh.length - 1 ? "└─" : "├─";
    const cnt = inCount.get(sh[i].id) ?? 0;
    const badge = cnt > 0 ? pc.dim(` (${cnt} refs)`) : "";
    o.push(`${c} ${col(sh[i].label, "shared")}${badge}${refs(sh[i].id)}`);
  }
  o.push("");

  // Detail: Claude Agents
  const ags = graph.nodes.filter((n) => n.category === "agent");
  o.push(pc.bold(`Claude Agents (${ags.length})`));
  for (let i = 0; i < ags.length; i++) {
    const c = i === ags.length - 1 ? "└─" : "├─";
    const impl = graph.edges.find(
      (e) => e.from === ags[i].id && e.type === "implements",
    );
    const tag = impl
      ? ` ${pc.dim("──▸")} ${col(impl.to.split(":")[1], "skill")}`
      : "";
    o.push(`${c} ${col(ags[i].label, "agent")}${tag}`);
  }
  o.push("");

  // Detail: Serena Memories
  const mems = graph.nodes.filter((n) => n.category === "memory");
  o.push(pc.bold(`Serena Memories (${mems.length})`));
  if (!mems.length) {
    o.push(`└─ ${pc.dim("(none)")}`);
  } else {
    for (let i = 0; i < mems.length; i++) {
      const c = i === mems.length - 1 ? "└─" : "├─";
      o.push(`${c} ${col(mems[i].label, "memory")}`);
    }
  }

  return o.join("\n");
}

// ── SVG Renderer (Column Layout + Edges) ────────────────────────

const NODE_COLORS: Record<string, string> = {
  root: "#1e293b",
  skill: "#059669",
  workflow: "#2563eb",
  shared: "#d97706",
  agent: "#7c3aed",
  memory: "#0891b2",
};

const GROUP_HDR: Record<string, string> = {
  Skills: "#059669",
  Workflows: "#2563eb",
  Shared: "#d97706",
  "Claude Agents": "#7c3aed",
  "Serena Memories": "#0891b2",
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderSvg(graph: Graph): string {
  const COL = 240;
  const NW = 190;
  const NH = 30;
  const GAP = 10;
  const SUBGAP = 20;
  const PAD = 50;
  const ROOT_Y = 50;
  const GRP_Y = 130;
  const START_Y = GRP_Y + 45;
  const GROUPS = [
    "Shared",
    "Skills",
    "Workflows",
    "Claude Agents",
    "Serena Memories",
  ];

  const items: Record<string, GraphNode[]> = {};
  for (const g of GROUPS) items[g] = graph.nodes.filter((n) => n.group === g);

  const W = GROUPS.length * COL + PAD * 2;
  const pos = new Map<string, { x: number; y: number }>();
  pos.set("root", { x: W / 2, y: ROOT_Y });

  let maxY = START_Y;
  for (let ci = 0; ci < GROUPS.length; ci++) {
    const cx = PAD + ci * COL + COL / 2;
    let y = START_Y;
    const gName = GROUPS[ci];

    if (gName === "Skills") {
      let prevSub = "";
      for (const node of items.Skills) {
        if (node.subgroup && node.subgroup !== prevSub) {
          if (prevSub) y += SUBGAP;
          prevSub = node.subgroup;
        }
        pos.set(node.id, { x: cx, y });
        y += NH + GAP;
      }
    } else {
      for (const node of items[gName]) {
        pos.set(node.id, { x: cx, y });
        y += NH + GAP;
      }
    }
    maxY = Math.max(maxY, y);
  }

  const H = maxY + PAD + 40;
  const s: string[] = [];

  s.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter,'SF Pro',system-ui,sans-serif">`,
  );
  s.push(`<defs>`);
  for (const [cat, color] of Object.entries(NODE_COLORS)) {
    s.push(
      `<marker id="a-${cat}" viewBox="0 0 10 8" refX="10" refY="4" markerWidth="7" markerHeight="5" orient="auto"><path d="M0,0L10,4L0,8Z" fill="${color}"/></marker>`,
    );
  }
  s.push(
    `<filter id="ds"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity=".12"/></filter>`,
  );
  s.push(`</defs>`);
  s.push(`<title>oh-my-agent dependency graph</title>`);
  s.push(`<rect width="100%" height="100%" fill="#ffffff"/>`);

  // Root → group lines
  const rp = pos.get("root")!;
  for (let i = 0; i < GROUPS.length; i++) {
    const cx = PAD + i * COL + COL / 2;
    s.push(
      `<line x1="${rp.x}" y1="${rp.y + 20}" x2="${cx}" y2="${GRP_Y - 8}" stroke="#cbd5e1" stroke-width="1.5"/>`,
    );
  }

  // Reference edges (curved, colored by target node)
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  s.push(`<g fill="none" stroke-width="1.2">`);
  for (const e of graph.edges) {
    const f = pos.get(e.from);
    const t = pos.get(e.to);
    if (!f || !t) continue;
    const target = nodeById.get(e.to);
    const targetCat = target?.category ?? "root";
    const color = NODE_COLORS[targetCat] ?? "#94a3b8";
    const op = ".45";
    const marker = `url(#a-${targetCat})`;
    if (Math.abs(f.x - t.x) < 10) {
      const off = 60;
      const my = (f.y + t.y) / 2;
      s.push(
        `<path d="M${f.x},${f.y} C${f.x + off},${my} ${t.x + off},${my} ${t.x},${t.y}" stroke="${color}" opacity="${op}" marker-end="${marker}"/>`,
      );
    } else {
      const dx = t.x - f.x;
      const dy = t.y - f.y;
      s.push(
        `<path d="M${f.x},${f.y} C${f.x + dx * 0.4},${f.y + dy * 0.15} ${t.x - dx * 0.4},${t.y - dy * 0.15} ${t.x},${t.y}" stroke="${color}" opacity="${op}" marker-end="${marker}"/>`,
      );
    }
  }
  s.push(`</g>`);

  // Group headers
  for (let i = 0; i < GROUPS.length; i++) {
    const cx = PAD + i * COL + COL / 2;
    const g = GROUPS[i];
    const cnt = items[g].length;
    const hc = GROUP_HDR[g] ?? "#475569";
    s.push(
      `<text x="${cx}" y="${GRP_Y}" text-anchor="middle" font-size="14" font-weight="600" fill="${hc}">${esc(g)} (${cnt})</text>`,
    );
  }

  // Subgroup labels for Skills
  let prevSub = "";
  for (const node of items.Skills ?? []) {
    if (node.subgroup && node.subgroup !== prevSub) {
      prevSub = node.subgroup;
      const p = pos.get(node.id);
      if (p) {
        s.push(
          `<text x="${p.x - NW / 2 + 6}" y="${p.y - NH / 2 - 4}" font-size="10" font-style="italic" fill="#94a3b8">${esc(prevSub)}</text>`,
        );
      }
    }
  }

  // Root node
  s.push(
    `<rect x="${rp.x - 110}" y="${rp.y - 20}" width="220" height="40" rx="8" fill="${NODE_COLORS.root}" filter="url(#ds)"/>`,
  );
  s.push(
    `<text x="${rp.x}" y="${rp.y + 6}" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">oh-my-agent</text>`,
  );

  // Item nodes
  for (const [id, p] of pos) {
    if (id === "root") continue;
    const node = graph.nodes.find((n) => n.id === id);
    if (!node) continue;
    const bg = NODE_COLORS[node.category] ?? "#6b7280";
    s.push(
      `<rect x="${p.x - NW / 2}" y="${p.y - NH / 2}" width="${NW}" height="${NH}" rx="${NH / 2}" fill="${bg}" filter="url(#ds)"/>`,
    );
    s.push(
      `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" font-weight="500" fill="#fff">${esc(node.label)}</text>`,
    );
  }

  // Legend
  const cats: [string, string][] = [
    ["Skill", NODE_COLORS.skill],
    ["Workflow", NODE_COLORS.workflow],
    ["Shared", NODE_COLORS.shared],
    ["Agent", NODE_COLORS.agent],
    ["Memory", NODE_COLORS.memory],
  ];
  const lx0 = W / 2 - (cats.length * 100) / 2;
  const ly = H - 25;
  for (let i = 0; i < cats.length; i++) {
    const lx = lx0 + i * 100;
    s.push(`<circle cx="${lx + 6}" cy="${ly}" r="5" fill="${cats[i][1]}"/>`);
    s.push(
      `<text x="${lx + 16}" y="${ly + 4}" font-size="11" fill="#475569">${cats[i][0]}</text>`,
    );
  }

  s.push(`</svg>`);
  return s.join("\n");
}
