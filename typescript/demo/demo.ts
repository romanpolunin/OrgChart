/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 *
 * Static demo. Layout runs in the browser. Nothing is fetched.
 */

import type { BoxTree } from "../src/box-tree";
import type { ChartDataSource } from "../src/data-source";
import type * as OrgChart from "../src/browser";
import { STUDIO, PersonSource, type Person } from "./sample-org";

type DatasetId = "studio" | "s20" | "s20a" | "s200" | "s200a" | "s1000";
type StrategyId =
  | "linear"
  | "linear-left"
  | "linear-right"
  | "hanger2"
  | "hanger4"
  | "fishbone1"
  | "fishbone2"
  | "column-left"
  | "column-right"
  | "stackers"
  | "smart";

const DATASETS: { id: DatasetId; name: string; detail: string }[] = [
  { id: "studio", name: "Studio", detail: `${STUDIO.length} people` },
  { id: "s20", name: "20 people", detail: "Generated" },
  { id: "s20a", name: "20 + assistants", detail: "Generated" },
  { id: "s200", name: "200 people", detail: "Generated" },
  { id: "s200a", name: "200 + assistants", detail: "Generated" },
  { id: "s1000", name: "1,000 + assistants", detail: "Top team open" },
];

const STRATEGIES: { id: StrategyId; name: string; blurb: string }[] = [
  { id: "linear", name: "Linear", blurb: "One row of reports, with the manager in the center." },
  { id: "linear-left", name: "Linear, manager left", blurb: "One row, with the manager over the left side." },
  { id: "linear-right", name: "Linear, manager right", blurb: "One row, with the manager over the right side." },
  { id: "hanger2", name: "Hanger of 2", blurb: "Rows of two, hung from a vertical carrier." },
  { id: "hanger4", name: "Hanger of 4", blurb: "Rows of four. A compact layout for wide teams." },
  { id: "fishbone1", name: "Fishbone", blurb: "Reports alternate down the left and right of one spine." },
  { id: "fishbone2", name: "Fishbone, two spines", blurb: "Two spines side by side, for larger teams." },
  { id: "column-left", name: "Column, manager left", blurb: "A vertical list to the right of the manager." },
  { id: "column-right", name: "Column, manager right", blurb: "A vertical list to the left of the manager." },
  { id: "stackers", name: "Stacks", blurb: "Vertical stacks near the top, horizontal stacks at the leaves. No lines." },
  { id: "smart", name: "Mixed", blurb: "Each branch picks a stack, a fishbone, or a hanger from its shape." },
];

const GIVEN = ["Ava", "Noah", "Mia", "Leo", "Zoe", "Owen", "Iris", "Jude", "Nell", "Kai", "Ruth", "Seth", "Cora", "Hugh", "Willa", "Felix", "Ada", "Jonah", "Esme", "Theo"];
const FAMILY = ["Adler", "Berg", "Cho", "Doyle", "Ellis", "Farhi", "Garcia", "Holm", "Ibrahim", "Jensen", "Keller", "Lopez", "Moreau", "Nair", "Okoye", "Petrova", "Quinn", "Rahman", "Sato", "Vogel"];
const TITLES = ["Director", "Manager", "Lead", "Specialist", "Partner", "Engineer", "Coordinator", "Analyst"];

export function mount(org: typeof OrgChart): void {
  const {
    BoxContainer,
    BranchParentAlignment,
    Diagram,
    FishboneAssistantsLayoutStrategy,
    LayoutAlgorithm,
    LayoutOperation,
    LayoutState,
    LinearLayoutStrategy,
    MultiLineFishboneLayoutStrategy,
    MultiLineHangerLayoutStrategy,
    SingleColumnLayoutStrategy,
    Size,
    StackOrientation,
    StackingLayoutStrategy,
    TestDataGen,
    TestDataSource,
  } = org;

  let datasetId: DatasetId = "s200a";
  let strategyId: StrategyId = "smart";
  let multipleRoots = false;
  let keepAssistants = true;
  let branchSpacing = 48;
  let diagram: OrgChart.Diagram | null = null;
  let people = new Map<string, Person>();
  let childrenOf = new Map<string | null, string[]>();
  let strategyNames = new Map<object, string>();
  let elapsed = 0;
  let zoom = 1;
  let panX = 32;
  let panY = 32;

  const cards = new Map<number, HTMLButtonElement>();

  const app = document.querySelector<HTMLElement>("#app");
  if (app == null) {
    throw new Error("Missing #app");
  }

  app.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="brand">
          <svg class="mark" viewBox="0 0 42 42" aria-hidden="true">
            <rect x="14" y="2" width="14" height="10" rx="2" fill="#f6efe4"/>
            <rect x="2" y="28" width="14" height="10" rx="2" fill="#c4522a"/>
            <rect x="26" y="28" width="14" height="10" rx="2" fill="#f6efe4"/>
            <path d="M21 12v8M21 20H9v8M21 20h12v8" fill="none" stroke="#f6efe4" stroke-width="1.5"/>
          </svg>
          <div>
            <p class="eyebrow">TypeScript layout</p>
            <h1>Org chart studio</h1>
            <p class="lede">Same people, every layout strategy. Click anyone to collapse their team. Drag the canvas to look around.</p>
          </div>
        </div>
        <section class="panel">
          <h2>Chart</h2>
          <div class="choices" id="datasets"></div>
        </section>
        <section class="panel">
          <h2>Layout</h2>
          <div class="strategies" id="strategies"></div>
        </section>
        <section class="panel">
          <h2>Options</h2>
          <label class="toggle"><input type="checkbox" id="multiple" /> Hide the top person, so the chart has several roots</label>
          <label class="toggle"><input type="checkbox" id="assistants" checked /> Lay assistants on a fishbone</label>
          <label class="slider">Branch gap <strong id="gap-value">48</strong>
            <input type="range" id="gap" min="12" max="80" step="2" value="48" />
          </label>
        </section>
        <p class="footnote">Static page. The layout runs in this browser and does not call a server. MIT license, Roman Polunin.</p>
      </aside>
      <main class="stage-wrap">
        <div class="toolbar">
          <p class="blurb" id="blurb"></p>
          <div class="toolbar-tools">
            <span class="legend"><span><i class="swatch"></i>Reports</span><span><i class="swatch dashed"></i>Assistants</span></span>
            <span class="stats" id="stats"></span>
            <div class="chart-actions">
              <button type="button" id="expand">Expand all</button>
              <button type="button" id="collapse">Collapse all</button>
              <button type="button" id="fit">Fit</button>
            </div>
            <div class="zoom">
              <button type="button" id="zoom-out" aria-label="Zoom out">−</button>
              <span id="zoom-label">100%</span>
              <button type="button" id="zoom-in" aria-label="Zoom in">+</button>
            </div>
          </div>
        </div>
        <p class="error" id="error" hidden></p>
        <div class="viewport" id="viewport">
          <div class="stage" id="stage">
            <svg class="wires" id="wires"></svg>
          </div>
        </div>
      </main>
    </div>
  `;

  const datasetRoot = required("#datasets");
  const strategyRoot = required("#strategies");
  const blurb = required("#blurb");
  const stats = required("#stats");
  const errorBox = required("#error");
  const viewport = required("#viewport");
  const stage = required("#stage");
  const wires = requiredSvg("#wires");
  const gapValue = required("#gap-value");
  const zoomLabel = required("#zoom-label");

  for (const dataset of DATASETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.dataset.id = dataset.id;
    button.innerHTML = `<strong></strong><span></span>`;
    button.querySelector("strong")!.textContent = dataset.name;
    button.querySelector("span")!.textContent = dataset.detail;
    button.addEventListener("click", () => {
      datasetId = dataset.id;
      rebuild(dataset.id === "s1000");
    });
    datasetRoot.append(button);
  }

  for (const strategy of STRATEGIES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "strategy";
    button.dataset.id = strategy.id;
    button.innerHTML = `<strong></strong><span></span>`;
    button.querySelector("strong")!.textContent = strategy.name;
    button.querySelector("span")!.textContent = strategy.blurb;
    button.addEventListener("click", () => {
      strategyId = strategy.id;
      relayout(true);
    });
    strategyRoot.append(button);
  }

  requiredInput("#multiple").addEventListener("change", (event) => {
    multipleRoots = (event.target as HTMLInputElement).checked;
    rebuild(false);
  });

  requiredInput("#assistants").addEventListener("change", (event) => {
    keepAssistants = (event.target as HTMLInputElement).checked;
    rebuild(false);
  });

  requiredInput("#gap").addEventListener("input", (event) => {
    branchSpacing = Number((event.target as HTMLInputElement).value);
    gapValue.textContent = String(branchSpacing);
    relayout(false);
  });

  required("#expand").addEventListener("click", () => setCollapsed(false));
  required("#collapse").addEventListener("click", () => setCollapsed(true));
  required("#fit").addEventListener("click", () => {
    const bounds = currentBounds();
    if (bounds != null) {
      fit(bounds.width, bounds.height);
      applyTransform();
    }
  });
  required("#zoom-in").addEventListener("click", () => zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, 1.15));
  required("#zoom-out").addEventListener("click", () => zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, 1 / 1.15));

  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    zoomAt(event.clientX - rect.left, event.clientY - rect.top, event.deltaY < 0 ? 1.08 : 1 / 1.08);
  }, { passive: false });

  let drag: { x: number; y: number; panX: number; panY: number } | null = null;
  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || (event.target as Element).closest(".card") != null) {
      return;
    }
    event.preventDefault();
    drag = { x: event.clientX, y: event.clientY, panX, panY };
    viewport.classList.add("is-panning");
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("selectstart", (event) => {
    event.preventDefault();
  });
  viewport.addEventListener("pointermove", (event) => {
    if (drag == null) {
      return;
    }
    panX = drag.panX + event.clientX - drag.x;
    panY = drag.panY + event.clientY - drag.y;
    applyTransform();
  });
  viewport.addEventListener("pointerup", () => {
    drag = null;
    viewport.classList.remove("is-panning");
  });
  viewport.addEventListener("pointercancel", () => {
    drag = null;
    viewport.classList.remove("is-panning");
  });

  rebuild(false);

  function rebuild(collapseAll: boolean): void {
    const source = createSource();
    people = source.people;
    childrenOf = indexChildren(source.people);
    const collapsed = new Map<string, boolean>();
    if (!collapseAll && diagram != null) {
      for (const box of diagram.boxes.boxesById.values()) {
        if (box.isDataBound && box.dataId != null) {
          collapsed.set(box.dataId, box.isCollapsed);
        }
      }
    }

    const boxes = new BoxContainer(source.source);
    const openRoots = collapseAll
      ? new Set([...people.values()].filter((person) => person.parentId == null).map((person) => person.id))
      : null;
    for (const box of boxes.boxesById.values()) {
      if (!box.isDataBound || box.dataId == null) {
        continue;
      }
      // The large chart keeps the top person open so the assistant row is on screen.
      box.isCollapsed = openRoots != null ? !openRoots.has(box.dataId) : collapsed.get(box.dataId) === true;
    }

    diagram = new Diagram();
    diagram.boxes = boxes;
    registerStrategies(diagram);
    diagram.layoutSettings.branchSpacing = branchSpacing;
    clearCards();
    relayout(true);
  }

  function relayout(refit: boolean): void {
    if (diagram == null) {
      return;
    }
    paintSelection();
    blurb.textContent = STRATEGIES.find((item) => item.id === strategyId)?.blurb ?? "";
    diagram.layoutSettings.branchSpacing = branchSpacing;
    errorBox.hidden = true;

    const state = new LayoutState(diagram);
    state.layoutOptimizerFunc = chooseStrategy;
    state.boxSizeFunc = (dataId) => {
      const box = diagram!.boxes.boxesByDataId.get(dataId);
      if (box == null) {
        throw new Error(`No box for ${dataId}`);
      }
      return box.size;
    };
    state.addOperationChanged((_sender, args) => {
      if (args.state.currentOperation === LayoutOperation.PreprocessVisualTree) {
        syncCards();
      }
    });

    try {
      const started = performance.now();
      LayoutAlgorithm.apply(state);
      elapsed = performance.now() - started;
      position(refit);
    } catch (error) {
      errorBox.hidden = false;
      errorBox.textContent = error instanceof Error ? error.message : String(error);
    }
  }

  function chooseStrategy(node: BoxTree.Node): string | null {
    if (node.isAssistantRoot) {
      return null;
    }
    if (strategyId === "smart") {
      return smartStrategy(node);
    }
    if (strategyId === "stackers") {
      if (node.level === 0) {
        return "vstackTop";
      }
      if (node.level === 1) {
        return "vstackMiddle";
      }
      return "hstack";
    }
    return strategyId;
  }

  function smartStrategy(node: BoxTree.Node): string {
    const childCount = node.childCount;
    if (childCount <= 1) {
      return "vstack";
    }
    let nonLeaf = 0;
    const children = node.children ?? [];
    for (let i = 0; i < childCount; i++) {
      if (children[i]!.childCount > 0) {
        nonLeaf++;
      }
    }
    if (nonLeaf <= 1) {
      if (childCount <= 4) {
        return "vstack";
      }
      if (childCount <= 8) {
        return "fishbone1";
      }
      return "fishbone2";
    }
    return "hanger4";
  }

  function syncCards(): void {
    const tree = diagram?.visualTree;
    if (tree == null) {
      return;
    }
    tree.iterateParentFirst((node) => {
      const box = node.element;
      if (!box.isDataBound || box.dataId == null) {
        return true;
      }
      let card = cards.get(box.id);
      if (node.state.isHidden) {
        card?.classList.add("is-hidden");
        return true;
      }
      if (card == null) {
        card = createCard(box.dataId, box.id);
        cards.set(box.id, card);
        stage.append(card);
      }
      card.classList.remove("is-hidden");
      const depth = Math.min(Math.max(node.level, 1), 4);
      const showStrategy = strategyId === "smart" || strategyId === "stackers";
      card.className = `card depth-${depth}${box.isAssistant ? " is-assistant" : ""}${box.isCollapsed ? " is-collapsed" : ""}${showStrategy ? " show-strategy" : ""}`;
      const tag = card.querySelector(".strategy-tag");
      if (tag instanceof HTMLElement) {
        tag.hidden = !showStrategy;
        if (showStrategy && tag.textContent === "") {
          tag.textContent = "\u00a0";
        }
      }
      const reports = descendantCount(box.dataId);
      const fold = card.querySelector(".fold");
      if (fold instanceof HTMLElement) {
        fold.hidden = reports === 0;
        const label = fold.querySelector("b");
        if (label != null) {
          label.textContent = box.isCollapsed ? String(reports) : "";
        }
      }
      // Measure after the label and the fold, and include the fold where it hangs past the card.
      box.size = measuredCardSize(card);
      return true;
    });
  }

  /**
   * Border box of the card, plus the fold button when it hangs below the border.
   * `getBoundingClientRect` follows the canvas zoom, so the result is divided back into layout pixels.
   */
  function measuredCardSize(card: HTMLElement): OrgChart.Size {
    const rect = card.getBoundingClientRect();
    const scale = rect.height > 0 && card.offsetHeight > 0 ? rect.height / card.offsetHeight : 1;
    let bottom = rect.bottom;
    const fold = card.querySelector(".fold");
    if (fold instanceof HTMLElement && !fold.hidden) {
      bottom = Math.max(bottom, fold.getBoundingClientRect().bottom);
    }
    const height = scale > 0 ? (bottom - rect.top) / scale : card.offsetHeight;
    return new Size(card.offsetWidth, Math.ceil(height - 1e-6));
  }

  function createCard(dataId: string, boxId: number): HTMLButtonElement {
    const person = people.get(dataId);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.dataset.boxId = String(boxId);
    card.innerHTML = `
      <span class="kicker"></span>
      <span class="name"></span>
      <span class="title"></span>
      <span class="badge"></span>
      <span class="strategy-tag" hidden></span>
      <span class="fold"><i></i><b></b></span>
    `;
    card.querySelector(".kicker")!.textContent = person?.team ?? "Team";
    card.querySelector(".name")!.textContent = person?.name ?? dataId;
    card.querySelector(".title")!.textContent = person?.title ?? "Contributor";
    const badge = card.querySelector(".badge");
    if (badge instanceof HTMLElement) {
      badge.hidden = person?.isAssistant !== true;
      badge.textContent = "Assistant";
    }
    card.addEventListener("click", () => toggle(boxId));
    return card;
  }

  function position(refit: boolean): void {
    const tree = diagram?.visualTree;
    if (tree == null) {
      return;
    }
    const bounds = LayoutAlgorithm.computeBranchVisualBoundingRect(tree);
    const width = Math.max(bounds.size.width, 1);
    const height = Math.max(bounds.size.height, 1);
    stage.style.width = `${width}px`;
    stage.style.height = `${height}px`;
    wires.setAttribute("width", String(width));
    wires.setAttribute("height", String(height));
    wires.setAttribute("viewBox", `0 0 ${width} ${height}`);
    wires.replaceChildren();

    tree.iterateParentFirst((node) => {
      if (node.state.isHidden) {
        return false;
      }
      const box = node.element;
      if (box.isDataBound) {
        const card = cards.get(box.id);
        if (card != null) {
          card.style.left = `${node.state.topLeft.x - bounds.left}px`;
          card.style.top = `${node.state.topLeft.y - bounds.top}px`;
          const tag = card.querySelector(".strategy-tag");
          if (tag instanceof HTMLElement && (strategyId === "smart" || strategyId === "stackers")) {
            tag.textContent = strategyNames.get(node.state.requireLayoutStrategy()) ?? "";
          }
        }
      }
      const connector = node.state.connector;
      if (connector != null) {
        for (const edge of connector.segments) {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", String(edge.from.x - bounds.left));
          line.setAttribute("y1", String(edge.from.y - bounds.top));
          line.setAttribute("x2", String(edge.to.x - bounds.left));
          line.setAttribute("y2", String(edge.to.y - bounds.top));
          line.setAttribute("class", node.isAssistantRoot ? "wire wire-assistant" : "wire");
          wires.append(line);
        }
      }
      return true;
    });

    if (refit) {
      fit(width, height);
    }
    applyTransform();
    viewport.classList.add("is-ready");

    const visible = countVisible();
    const noun = visible === 1 ? "box" : "boxes";
    stats.textContent = `${visible} ${noun} · ${elapsed.toFixed(1)} ms · ${Math.round(width)} × ${Math.round(height)}`;
  }

  function toggle(boxId: number): void {
    const box = diagram?.boxes.boxesById.get(boxId);
    if (box == null || !box.isDataBound) {
      return;
    }
    box.isCollapsed = !box.isCollapsed;
    relayout(false);
  }

  function setCollapsed(collapsed: boolean): void {
    if (diagram == null) {
      return;
    }
    for (const box of diagram.boxes.boxesById.values()) {
      if (box.isDataBound) {
        box.isCollapsed = collapsed;
      }
    }
    relayout(true);
  }

  function registerStrategies(target: OrgChart.Diagram): void {
    const settings = target.layoutSettings;
    strategyNames = new Map();
    const add = (id: string, label: string, strategy: OrgChart.LayoutStrategyBase) => {
      settings.layoutStrategies.set(id, strategy);
      strategyNames.set(strategy, label);
    };

    add("linear", "Linear", aligned(new LinearLayoutStrategy(), BranchParentAlignment.Center));
    add("linear-left", "Linear left", aligned(new LinearLayoutStrategy(), BranchParentAlignment.Left));
    add("linear-right", "Linear right", aligned(new LinearLayoutStrategy(), BranchParentAlignment.Right));

    const hanger2 = new MultiLineHangerLayoutStrategy();
    hanger2.parentAlignment = BranchParentAlignment.Center;
    hanger2.maxSiblingsPerRow = 2;
    add("hanger2", "Hanger 2", hanger2);

    const hanger4 = new MultiLineHangerLayoutStrategy();
    hanger4.parentAlignment = BranchParentAlignment.Center;
    hanger4.maxSiblingsPerRow = 4;
    add("hanger4", "Hanger 4", hanger4);

    add("column-left", "Column left", aligned(new SingleColumnLayoutStrategy(), BranchParentAlignment.Left));
    add("column-right", "Column right", aligned(new SingleColumnLayoutStrategy(), BranchParentAlignment.Right));

    const fishbone1 = new MultiLineFishboneLayoutStrategy();
    fishbone1.parentAlignment = BranchParentAlignment.Center;
    fishbone1.maxGroups = 1;
    add("fishbone1", "Fishbone", fishbone1);

    const fishbone2 = new MultiLineFishboneLayoutStrategy();
    fishbone2.parentAlignment = BranchParentAlignment.Center;
    fishbone2.maxGroups = 2;
    add("fishbone2", "Fishbone 2", fishbone2);

    const hstack = new StackingLayoutStrategy();
    hstack.orientation = StackOrientation.SingleRowHorizontal;
    hstack.parentChildSpacing = 10;
    add("hstack", "Horizontal stack", hstack);

    const vstack = new StackingLayoutStrategy();
    vstack.orientation = StackOrientation.SingleColumnVertical;
    vstack.parentChildSpacing = 10;
    add("vstack", "Vertical stack", vstack);

    const vstackMiddle = new StackingLayoutStrategy();
    vstackMiddle.orientation = StackOrientation.SingleColumnVertical;
    vstackMiddle.siblingSpacing = 20;
    add("vstackMiddle", "Vertical stack", vstackMiddle);

    const vstackTop = new StackingLayoutStrategy();
    vstackTop.orientation = StackOrientation.SingleColumnVertical;
    vstackTop.siblingSpacing = 50;
    add("vstackTop", "Vertical stack", vstackTop);

    const assistants = new FishboneAssistantsLayoutStrategy();
    assistants.parentAlignment = BranchParentAlignment.Center;
    add("assistants", "Assistants", assistants);

    settings.defaultLayoutStrategyId = "vstack";
    settings.defaultAssistantLayoutStrategyId = "assistants";
  }

  function aligned<T extends { parentAlignment: OrgChart.BranchParentAlignment }>(strategy: T, alignment: OrgChart.BranchParentAlignment): T {
    strategy.parentAlignment = alignment;
    return strategy;
  }

  function createSource(): { source: ChartDataSource; people: Map<string, Person> } {
    let list: Person[];
    if (datasetId === "studio") {
      list = STUDIO.map((person) => ({ ...person }));
    } else {
      const spec = datasetSpec(datasetId);
      const generated = new TestDataSource();
      new TestDataGen().generateDataItems(generated, spec.count, spec.assistants);
      list = [...generated.items.values()].map((item) => generatedPerson(item.id, item.parentId, item.isAssistant));
      if (datasetId === "s1000") {
        ensureRootAssistants(list, 2);
      }
    }

    if (!keepAssistants) {
      list = list.map((person) => ({ ...person, isAssistant: false }));
    }
    if (multipleRoots) {
      const roots = new Set(list.filter((person) => person.parentId == null).map((person) => person.id));
      list = list
        .filter((person) => !roots.has(person.id))
        .map((person) => (person.parentId != null && roots.has(person.parentId) ? { ...person, parentId: null } : person));
    }

    const map = new Map(list.map((person) => [person.id, person]));
    return { source: new PersonSource(list), people: map };
  }

  /** Gives each top person a visible assistant row. Deeper assistants already come from the generator. */
  function ensureRootAssistants(list: Person[], count: number): void {
    const roots = list.filter((person) => person.parentId == null);
    for (const root of roots) {
      let marked = list.filter((person) => person.parentId === root.id && person.isAssistant).length;
      for (const person of list) {
        if (marked >= count) {
          break;
        }
        if (person.parentId === root.id && !person.isAssistant) {
          person.isAssistant = true;
          marked++;
        }
      }
    }
  }

  function generatedPerson(id: string, parentId: string | null, isAssistant: boolean): Person {
    const n = Number(id);
    const name = `${GIVEN[n % GIVEN.length]} ${FAMILY[(n * 7) % FAMILY.length]}`;
    return {
      id,
      parentId,
      name,
      title: parentId == null ? "General Manager" : isAssistant ? "Assistant to the lead" : TITLES[n % TITLES.length]!,
      team: parentId == null ? "Office" : "Group",
      isAssistant,
    };
  }

  function datasetSpec(id: DatasetId): { count: number; assistants: number } {
    switch (id) {
      case "s20":
        return { count: 20, assistants: 0 };
      case "s20a":
        return { count: 20, assistants: 10 };
      case "s200":
        return { count: 200, assistants: 0 };
      case "s200a":
        return { count: 200, assistants: 10 };
      case "s1000":
        return { count: 1000, assistants: 5 };
      default:
        return { count: STUDIO.length, assistants: 0 };
    }
  }

  function indexChildren(list: Map<string, Person>): Map<string | null, string[]> {
    const index = new Map<string | null, string[]>();
    for (const person of list.values()) {
      const kids = index.get(person.parentId) ?? [];
      kids.push(person.id);
      index.set(person.parentId, kids);
    }
    return index;
  }

  function descendantCount(id: string): number {
    const kids = childrenOf.get(id) ?? [];
    let count = kids.length;
    for (const kid of kids) {
      count += descendantCount(kid);
    }
    return count;
  }

  function countVisible(): number {
    const tree = diagram?.visualTree;
    if (tree == null) {
      return 0;
    }
    let count = 0;
    tree.iterateParentFirst((node) => {
      if (node.state.isHidden) {
        return false;
      }
      if (node.element.isDataBound) {
        count++;
      }
      return true;
    });
    return count;
  }

  function clearCards(): void {
    cards.clear();
    for (const child of [...stage.children]) {
      if (child !== wires) {
        child.remove();
      }
    }
  }

  function paintSelection(): void {
    for (const button of datasetRoot.querySelectorAll<HTMLButtonElement>(".choice")) {
      button.setAttribute("aria-pressed", String(button.dataset.id === datasetId));
    }
    for (const button of strategyRoot.querySelectorAll<HTMLButtonElement>(".strategy")) {
      button.setAttribute("aria-pressed", String(button.dataset.id === strategyId));
    }
  }

  function currentBounds(): { width: number; height: number } | null {
    const tree = diagram?.visualTree;
    if (tree == null) {
      return null;
    }
    const bounds = LayoutAlgorithm.computeBranchVisualBoundingRect(tree);
    return { width: Math.max(bounds.size.width, 1), height: Math.max(bounds.size.height, 1) };
  }

  function fit(width: number, height: number): void {
    const pad = 56;
    const viewWidth = viewport.clientWidth;
    const viewHeight = viewport.clientHeight;
    if (viewWidth < 20 || viewHeight < 20) {
      return;
    }
    zoom = Math.min((viewWidth - pad) / width, (viewHeight - pad) / height, 1.3);
    zoom = Math.max(zoom, 0.05);
    panX = (viewWidth - width * zoom) / 2;
    panY = Math.max(20, (viewHeight - height * zoom) / 2);
  }

  function zoomAt(x: number, y: number, factor: number): void {
    const next = clamp(zoom * factor, 0.05, 2.5);
    panX = x - ((x - panX) * next) / zoom;
    panY = y - ((y - panY) * next) / zoom;
    zoom = next;
    applyTransform();
  }

  function applyTransform(): void {
    stage.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  }

  function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  function required(selector: string): HTMLElement {
    const element = document.querySelector<HTMLElement>(selector);
    if (element == null) {
      throw new Error(`Missing ${selector}`);
    }
    return element;
  }

  function requiredInput(selector: string): HTMLInputElement {
    const element = required(selector);
    if (!(element instanceof HTMLInputElement)) {
      throw new Error(`Expected input ${selector}`);
    }
    return element;
  }

  function requiredSvg(selector: string): SVGSVGElement {
    const element = document.querySelector(selector);
    if (!(element instanceof SVGSVGElement)) {
      throw new Error(`Missing ${selector}`);
    }
    return element;
  }
}
