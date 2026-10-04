// src/geometry.ts
var DOUBLE_EPSILON = Number.MIN_VALUE;
var DOUBLE_MIN = -Number.MAX_VALUE;
var DOUBLE_MAX = Number.MAX_VALUE;
function isMinValue(value) {
  return value <= DOUBLE_MIN + DOUBLE_EPSILON;
}
function isMaxValue(value) {
  return value >= DOUBLE_MAX - DOUBLE_EPSILON;
}
function isZero(value) {
  return value <= DOUBLE_EPSILON && value >= -DOUBLE_EPSILON;
}
function isEqual(value, other) {
  return Math.abs(value - other) <= DOUBLE_EPSILON;
}

class Point {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  moveH(offsetX) {
    return new Point(this.x + offsetX, this.y);
  }
}

class Size {
  width;
  height;
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}

class Rect {
  topLeft;
  size;
  constructor(topLeft, size) {
    this.topLeft = topLeft;
    this.size = size;
  }
  static of(x, y, w, h) {
    if (w < 0) {
      throw new RangeError("Width cannot be negative");
    }
    if (h < 0) {
      throw new RangeError("Height cannot be negative");
    }
    return new Rect(new Point(x, y), new Size(w, h));
  }
  static fromCorner(topLeft, size) {
    return new Rect(topLeft, size);
  }
  static zero() {
    return new Rect(new Point(0, 0), new Size(0, 0));
  }
  static union(x, y) {
    const left = Math.min(x.left, y.left);
    const top = Math.min(x.top, y.top);
    const right = Math.max(x.right, y.right);
    const bottom = Math.max(x.bottom, y.bottom);
    return Rect.of(left, top, right - left, bottom - top);
  }
  get left() {
    return this.topLeft.x;
  }
  get right() {
    return this.topLeft.x + this.size.width;
  }
  get top() {
    return this.topLeft.y;
  }
  get bottom() {
    return this.topLeft.y + this.size.height;
  }
  get centerH() {
    return this.topLeft.x + this.size.width / 2;
  }
  get centerV() {
    return this.topLeft.y + this.size.height / 2;
  }
  moveH(offsetX) {
    return new Rect(new Point(this.left + offsetX, this.top), this.size);
  }
}

class Dimensions {
  from;
  to;
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
  static minMax() {
    return new Dimensions(DOUBLE_MAX, DOUBLE_MIN);
  }
  static union(x, y) {
    return new Dimensions(Math.min(x.from, y.from), Math.max(x.to, y.to));
  }
}

class Edge {
  from;
  to;
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
}

// src/box.ts
var BOX_NONE = -1;

class Box {
  dataId;
  id;
  parentId;
  isSpecial;
  disableCollisionDetection;
  isAssistant;
  layoutStrategyId = null;
  assistantLayoutStrategyId = null;
  size = new Size(0, 0);
  isCollapsed = false;
  constructor(dataId, id, parentId, isSpecial, disableCollisionDetection, isAssistant) {
    this.dataId = dataId;
    this.id = id;
    this.parentId = parentId;
    this.isSpecial = isSpecial;
    this.disableCollisionDetection = disableCollisionDetection;
    this.isAssistant = isAssistant;
    if (id === 0) {
      throw new RangeError("Box id must not be 0");
    }
  }
  static create(dataId, id, parentId, isAssistant) {
    return new Box(dataId, id, parentId, false, false, isAssistant);
  }
  static special(id, visualParentId, disableCollisionDetection) {
    return new Box(null, id, visualParentId, true, disableCollisionDetection, false);
  }
  get isDataBound() {
    return this.dataId != null && this.dataId.length > 0;
  }
}
// src/box-container.ts
class BoxContainer {
  #lastBoxId = 0;
  boxesById = new Map;
  boxesByDataId = new Map;
  systemRoot = null;
  constructor(source) {
    if (source != null) {
      this.reloadBoxes(source);
    }
  }
  reloadBoxes(source) {
    this.boxesByDataId.clear();
    this.boxesById.clear();
    this.#lastBoxId = 0;
    this.systemRoot = Box.special(++this.#lastBoxId, BOX_NONE, true);
    this.boxesById.set(this.systemRoot.id, this.systemRoot);
    const map = new Map;
    for (const dataId of source.allDataItemIds) {
      map.set(dataId, this.nextBoxId());
    }
    for (const dataId of source.allDataItemIds) {
      const parentDataId = dataId.length === 0 ? null : source.getParentKey(dataId);
      const visualParentId = parentDataId == null || parentDataId.length === 0 ? this.systemRoot.id : required(map, parentDataId);
      this.#add(dataId, required(map, dataId), visualParentId, source.getDataItem(dataId).isAssistant);
    }
  }
  addBox(dataId, visualParentId, isAssistant) {
    return this.#add(dataId, this.nextBoxId(), visualParentId, isAssistant);
  }
  nextBoxId() {
    this.#lastBoxId++;
    return this.#lastBoxId;
  }
  #add(dataId, id, visualParentId, isAssistant) {
    const box = Box.create(dataId, id, visualParentId, isAssistant);
    this.boxesById.set(box.id, box);
    if (box.dataId != null && box.dataId.length > 0) {
      this.boxesByDataId.set(box.dataId, box);
    }
    return box;
  }
}
function required(map, key) {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`No box id for data id ${key}`);
  }
  return value;
}
// src/node-layout-info.ts
class NodeLayoutInfo {
  #strategy = null;
  isHidden = false;
  numberOfSiblings = 0;
  numberOfSiblingRows = 0;
  numberOfSiblingColumns = 0;
  topLeft = new Point(0, 0);
  size = new Size(0, 0);
  branchExterior = Rect.zero();
  siblingsRowV = new Dimensions(0, 0);
  connector = null;
  set effectiveLayoutStrategy(value) {
    this.#strategy = value;
  }
  requireLayoutStrategy() {
    if (this.#strategy == null) {
      throw new Error("EffectiveLayoutStrategy is not set");
    }
    return this.#strategy;
  }
  get left() {
    return this.topLeft.x;
  }
  get right() {
    return this.topLeft.x + this.size.width;
  }
  get top() {
    return this.topLeft.y;
  }
  get bottom() {
    return this.topLeft.y + this.size.height;
  }
  get centerH() {
    return this.topLeft.x + this.size.width / 2;
  }
  get centerV() {
    return this.topLeft.y + this.size.height / 2;
  }
  moveTo(x, y) {
    this.topLeft = new Point(x, y);
  }
  copyExteriorFrom(other) {
    this.topLeft = other.topLeft;
    this.size = other.size;
    this.branchExterior = other.branchExterior;
    this.siblingsRowV = other.siblingsRowV;
  }
  adjustSpacer(x, y, w, h) {
    this.topLeft = new Point(x, y);
    this.size = new Size(w, h);
    this.branchExterior = Rect.of(x, y, w, h);
  }
}

// src/box-tree.ts
class BoxTree {
  root = null;
  nodes = new Map;
  depth = 0;
  iterateChildFirst(func) {
    if (this.root == null) {
      throw new Error("Root is not set");
    }
    return this.root.iterateChildFirst(func);
  }
  iterateParentFirst(enter, exit) {
    if (this.root == null) {
      throw new Error("Root is not set");
    }
    this.root.iterateParentFirst(enter, exit);
  }
  updateHierarchyStats() {
    this.depth = 0;
    this.iterateParentFirst((node) => {
      if (node.parentNode != null) {
        node.level = node.parentNode.level;
        if (!node.parentNode.isAssistantRoot) {
          node.level++;
        }
        this.depth = Math.max(1 + node.level, this.depth);
      } else {
        node.level = 0;
        this.depth = 1;
      }
      return true;
    });
  }
  static build(state) {
    const result = new BoxTree;
    for (const box of state.diagram.boxes.boxesById.values()) {
      result.nodes.set(box.id, new BoxTree.Node(box));
    }
    for (const node of result.nodes.values()) {
      const parentKey = node.element.parentId;
      const parentNode = result.nodes.get(parentKey);
      if (parentNode !== undefined) {
        if (node.element.isAssistant && parentNode.element.parentId !== BOX_NONE) {
          parentNode.addAssistantChild(node);
        } else {
          parentNode.addRegularChild(node);
        }
      } else if (result.root != null) {
        throw new Error(`More than one root found: ${node.element.id}`);
      } else {
        result.root = node;
      }
    }
    return result;
  }
}
((BoxTree) => {

  class Node {
    level = 0;
    element;
    state = new NodeLayoutInfo;
    parentNode = null;
    children = null;
    assistantsRoot = null;
    constructor(element) {
      this.element = element;
    }
    get childCount() {
      return this.children == null ? 0 : this.children.length;
    }
    get isAssistantRoot() {
      return (this.parentNode == null ? undefined : this.parentNode.assistantsRoot) === this;
    }
    addAssistantChild(child) {
      if (this.assistantsRoot == null) {
        this.assistantsRoot = new Node(Box.special(BOX_NONE, this.element.id, true));
        this.assistantsRoot.parentNode = this;
        this.assistantsRoot.level = this.level + 1;
      }
      this.assistantsRoot.addRegularChild(child);
      return this;
    }
    addRegularChild(child) {
      return this.insertRegularChild(this.childCount, child);
    }
    insertRegularChild(index, child) {
      const node = child instanceof Node ? child : new Node(child);
      if (this.children == null) {
        this.children = [];
      }
      this.children.splice(index, 0, node);
      node.parentNode = this;
      node.level = this.level + 1;
      return this;
    }
    iterateChildFirst(func) {
      if (this.assistantsRoot != null && !this.assistantsRoot.iterateChildFirst(func)) {
        return false;
      }
      if (this.children != null) {
        for (const child of this.children) {
          if (!child.iterateChildFirst(func)) {
            return false;
          }
        }
      }
      return func(this);
    }
    iterateParentFirst(enter, exit) {
      if (!enter(this)) {
        exit?.(this);
        return false;
      }
      this.assistantsRoot?.iterateParentFirst(enter, exit);
      if (this.children != null) {
        for (const child of this.children) {
          child.iterateParentFirst(enter, exit);
        }
      }
      exit?.(this);
      return true;
    }
    suppressAssistants() {
      if (this.assistantsRoot == null) {
        return;
      }
      const assistants = this.assistantsRoot.children;
      if (assistants != null) {
        for (const child of assistants) {
          this.addRegularChild(child);
        }
      }
      this.assistantsRoot = null;
    }
  }
  BoxTree.Node = Node;
})(BoxTree ||= {});
// src/boundary.ts
class BoundaryStep {
  node;
  x;
  top;
  bottom;
  constructor(node, x, top, bottom) {
    this.node = node;
    this.x = x;
    this.top = top;
    this.bottom = bottom;
  }
  changeTop(newTop) {
    return new BoundaryStep(this.node, this.x, newTop, this.bottom);
  }
  changeBottom(newBottom) {
    return new BoundaryStep(this.node, this.x, this.top, newBottom);
  }
  changeOwner(newNode, newX) {
    return new BoundaryStep(newNode, newX, this.top, this.bottom);
  }
  changeX(newX) {
    return new BoundaryStep(this.node, newX, this.top, this.bottom);
  }
}

class Boundary {
  static validate = false;
  boundingRect = Rect.zero();
  left = [];
  right = [];
  #spacerMerger;
  constructor(fromPublic = true) {
    if (fromPublic) {
      this.#spacerMerger = new Boundary(false);
    } else {
      this.#spacerMerger = null;
    }
  }
  prepareForHorizontalLayout(node) {
    this.prepare(node);
    if (node.element.disableCollisionDetection) {
      return;
    }
    const rect = node.state;
    this.left.push(new BoundaryStep(node, rect.left, rect.top, rect.bottom));
    this.right.push(new BoundaryStep(node, rect.right, rect.top, rect.bottom));
  }
  prepare(node) {
    this.left.length = 0;
    this.right.length = 0;
    this.boundingRect = Rect.fromCorner(node.state.topLeft, node.state.size);
  }
  verticalMergeFrom(other) {
    this.boundingRect = Rect.union(this.boundingRect, other.boundingRect);
  }
  mergeFrom(other) {
    if (other instanceof Boundary) {
      this.#mergeBoundary(other);
      return;
    }
    this.#mergeNode(other);
  }
  #mergeNode(node) {
    if (node.element.disableCollisionDetection || isZero(node.state.size.height)) {
      return;
    }
    if (this.#spacerMerger == null) {
      throw new Error("Spacer merger is not available");
    }
    this.#spacerMerger.prepareForHorizontalLayout(node);
    this.#mergeBoundary(this.#spacerMerger);
  }
  #mergeBoundary(other) {
    if (other.boundingRect.top >= other.boundingRect.bottom) {
      throw new Error(`Cannot merge boundary of height ${other.boundingRect.bottom - other.boundingRect.top}`);
    }
    let merge = "r";
    while (merge !== "\x00") {
      const mySteps = merge === "r" ? this.right : this.left;
      const theirSteps = merge === "r" ? other.right : other.left;
      let i = 0;
      let k = 0;
      for (;k < theirSteps.length && i < mySteps.length; ) {
        const my = mySteps[i];
        const th = theirSteps[k];
        if (my.bottom <= th.top) {
          i++;
          continue;
        }
        if (th.bottom <= my.top) {
          mySteps.splice(i, 0, th);
          k++;
          this.#validateState();
          continue;
        }
        const theirWins = merge === "r" ? my.x <= th.x : my.x >= th.x;
        if (isEqual(my.top, th.top)) {
          if (isEqual(my.bottom, th.bottom)) {
            if (theirWins) {
              mySteps[i] = th;
            }
            i++;
            k++;
            this.#validateState();
          } else if (my.bottom < th.bottom) {
            if (theirWins) {
              mySteps[i] = my.changeOwner(th.node, th.x);
            }
            theirSteps[k] = th.changeTop(my.bottom);
            i++;
            this.#validateState();
          } else if (theirWins) {
            mySteps[i] = my.changeTop(th.bottom);
            mySteps.splice(i, 0, th);
            i++;
            k++;
            this.#validateState();
          } else {
            k++;
            this.#validateState();
          }
        } else if (isEqual(my.bottom, th.bottom)) {
          if (my.top < th.top) {
            if (theirWins) {
              mySteps[i] = my.changeBottom(th.top);
              mySteps.splice(i + 1, 0, th);
              i++;
            }
            i++;
            k++;
            this.#validateState();
          } else if (theirWins) {
            mySteps[i] = th;
            i++;
            k++;
            this.#validateState();
          } else {
            mySteps.splice(i, 0, th.changeBottom(my.top));
            i++;
            i++;
            k++;
            this.#validateState();
          }
        } else if (my.top < th.top && my.bottom < th.bottom) {
          if (theirWins) {
            mySteps[i] = my.changeBottom(th.top);
            mySteps.splice(i + 1, 0, new BoundaryStep(th.node, th.x, th.top, my.bottom));
            i++;
          }
          theirSteps[k] = th.changeTop(my.bottom);
          i++;
          this.#validateState();
        } else if (my.top < th.top && my.bottom > th.bottom) {
          if (theirWins) {
            mySteps[i] = my.changeBottom(th.top);
            mySteps.splice(i + 1, 0, th);
            mySteps.splice(i + 2, 0, my.changeTop(th.bottom));
            i += 2;
          }
          k++;
          this.#validateState();
        } else if (my.bottom > th.bottom) {
          if (theirWins) {
            mySteps[i] = my.changeTop(th.bottom);
            mySteps.splice(i, 0, th);
          } else {
            mySteps.splice(i, 0, th.changeBottom(my.top));
          }
          i++;
          k++;
          this.#validateState();
        } else if (theirWins) {
          mySteps[i] = th.changeBottom(my.bottom);
          theirSteps[k] = th.changeTop(my.bottom);
          i++;
          this.#validateState();
        } else {
          mySteps.splice(i, 0, th.changeBottom(my.top));
          i++;
          theirSteps[k] = th.changeTop(my.bottom);
          i++;
          this.#validateState();
        }
      }
      if (i === mySteps.length) {
        while (k < theirSteps.length) {
          mySteps.push(theirSteps[k]);
          k++;
          this.#validateState();
        }
      }
      merge = merge === "r" ? "l" : "\x00";
    }
    this.boundingRect = Rect.union(this.boundingRect, other.boundingRect);
  }
  computeOverlap(other, siblingSpacing, branchSpacing) {
    let i = 0;
    let k = 0;
    let offense = 0;
    while (i < this.right.length && k < other.left.length) {
      const my = this.right[i];
      const th = other.left[k];
      if (my.bottom <= th.top) {
        i++;
      } else if (th.bottom <= my.top) {
        k++;
      } else {
        if (!my.node.element.disableCollisionDetection && !th.node.element.disableCollisionDetection) {
          const desiredSpacing = my.node.element.isSpecial || th.node.element.isSpecial ? 0 : my.node.element.parentId === th.node.element.parentId ? siblingSpacing : branchSpacing;
          const diff = my.x + desiredSpacing - th.x;
          if (diff > offense) {
            offense = diff;
          }
        }
        if (my.bottom >= th.bottom) {
          k++;
        }
        if (th.bottom >= my.bottom) {
          i++;
        }
      }
    }
    return offense;
  }
  reloadFromBranch(branchRoot) {
    let leftmost = DOUBLE_MAX;
    let rightmost = DOUBLE_MIN;
    for (let i = 0;i < this.left.length; i++) {
      const step = this.left[i];
      const newLeft = step.node.state.left;
      this.left[i] = step.changeX(newLeft);
      leftmost = Math.min(leftmost, newLeft);
    }
    for (let i = 0;i < this.right.length; i++) {
      const step = this.right[i];
      const newRight = step.node.state.right;
      this.right[i] = step.changeX(newRight);
      rightmost = Math.max(rightmost, newRight);
    }
    leftmost = Math.min(branchRoot.state.left, leftmost);
    rightmost = Math.max(branchRoot.state.right, rightmost);
    this.boundingRect = Rect.fromCorner(new Point(leftmost, this.boundingRect.top), new Size(rightmost - leftmost, this.boundingRect.size.height));
  }
  #validateState() {
    if (!Boundary.validate) {
      return;
    }
    validateEdge(this.left, "Left");
    validateEdge(this.right, "Right");
  }
}
function validateEdge(steps, name) {
  for (let i = 1;i < steps.length; i++) {
    const step = steps[i];
    const prev = steps[i - 1];
    if (isEqual(step.top, step.bottom) || step.top < prev.bottom || step.top <= prev.top || step.bottom <= step.top || step.bottom <= prev.bottom) {
      throw new Error(`State error at ${name} index ${i}`);
    }
  }
}
// src/connector.ts
class Connector {
  segments;
  constructor(segments) {
    if (segments.length === 0) {
      throw new Error("Need at least one segment");
    }
    this.segments = segments;
  }
}
// src/diagram.ts
class DiagramLayoutSettings {
  #branchSpacing = 50;
  layoutStrategies = new Map;
  defaultAssistantLayoutStrategyId = null;
  defaultLayoutStrategyId = null;
  get branchSpacing() {
    return this.#branchSpacing;
  }
  set branchSpacing(value) {
    if (value < 0) {
      throw new RangeError("Branch spacing cannot be negative");
    }
    this.#branchSpacing = value;
  }
  requireDefaultLayoutStrategy() {
    return this.#require(this.defaultLayoutStrategyId, "DefaultLayoutStrategyId");
  }
  requireDefaultAssistantLayoutStrategy() {
    return this.#require(this.defaultAssistantLayoutStrategyId, "DefaultAssistantLayoutStrategyId");
  }
  #require(id, name) {
    if (id == null || id.length === 0) {
      throw new Error(`${name} is null or not valid`);
    }
    const strategy = this.layoutStrategies.get(id);
    if (strategy === undefined) {
      throw new Error(`${name} is null or not valid`);
    }
    return strategy;
  }
}

class Diagram {
  layoutSettings = new DiagramLayoutSettings;
  #boxes = null;
  visualTree = null;
  get boxes() {
    if (this.#boxes == null) {
      throw new Error("Boxes are not set");
    }
    return this.#boxes;
  }
  set boxes(value) {
    this.visualTree = null;
    this.#boxes = value;
  }
}
// src/layout-state.ts
var LayoutOperation;
((LayoutOperation2) => {
  LayoutOperation2[LayoutOperation2["Idle"] = 0] = "Idle";
  LayoutOperation2[LayoutOperation2["Preparing"] = 1] = "Preparing";
  LayoutOperation2[LayoutOperation2["PreprocessVisualTree"] = 2] = "PreprocessVisualTree";
  LayoutOperation2[LayoutOperation2["VerticalLayout"] = 3] = "VerticalLayout";
  LayoutOperation2[LayoutOperation2["HorizontalLayout"] = 4] = "HorizontalLayout";
  LayoutOperation2[LayoutOperation2["ConnectorsLayout"] = 5] = "ConnectorsLayout";
  LayoutOperation2[LayoutOperation2["Completed"] = 6] = "Completed";
})(LayoutOperation ||= {});

class LayoutLevel {
  branchRoot;
  boundary;
  constructor(branchRoot, boundary) {
    this.branchRoot = branchRoot;
    this.boundary = boundary;
  }
}

class BoundaryChangedEventArgs {
  boundary;
  layoutLevel;
  state;
  constructor(boundary, layoutLevel, state) {
    this.boundary = boundary;
    this.layoutLevel = layoutLevel;
    this.state = state;
  }
}

class LayoutStateOperationChangedEventArgs {
  state;
  constructor(state) {
    this.state = state;
  }
}

class LayoutState {
  diagram;
  boxSizeFunc = null;
  layoutOptimizerFunc = null;
  #currentOperation = 0 /* Idle */;
  #layoutStack = [];
  #pooledBoundaries = [];
  #boundaryHandlers = [];
  #operationHandlers = [];
  constructor(diagram) {
    this.diagram = diagram;
  }
  get currentOperation() {
    return this.#currentOperation;
  }
  set currentOperation(value) {
    this.#currentOperation = value;
    const args = new LayoutStateOperationChangedEventArgs(this);
    for (const handler of this.#operationHandlers) {
      handler(this, args);
    }
  }
  addBoundaryChanged(handler) {
    this.#boundaryHandlers.push(handler);
  }
  addOperationChanged(handler) {
    this.#operationHandlers.push(handler);
  }
  attachVisualTree(tree) {
    while (this.#pooledBoundaries.length < tree.depth) {
      this.#pooledBoundaries.push(new Boundary);
    }
  }
  pushLayoutLevel(node) {
    if (this.#pooledBoundaries.length === 0) {
      this.#pooledBoundaries.push(new Boundary);
    }
    const boundary = this.#pooledBoundaries.pop();
    switch (this.currentOperation) {
      case 3 /* VerticalLayout */:
        boundary.prepare(node);
        break;
      case 4 /* HorizontalLayout */:
        boundary.prepareForHorizontalLayout(node);
        break;
      default:
        throw new Error("This operation can only be invoked when performing vertical or horizontal layouts");
    }
    const result = new LayoutLevel(node, boundary);
    this.#layoutStack.push(result);
    this.#raiseBoundary(boundary, result);
    return result;
  }
  mergeSpacer(spacer) {
    if (this.currentOperation !== 4 /* HorizontalLayout */) {
      throw new Error("Spacers can only be merged during horizontal layout");
    }
    if (this.#layoutStack.length === 0) {
      throw new Error("Cannot merge spacers at top nesting level");
    }
    const level = this.#layoutStack[this.#layoutStack.length - 1];
    level.boundary.mergeFrom(spacer);
    this.#raiseBoundary(level.boundary, level);
  }
  popLayoutLevel() {
    const innerLevel = this.#layoutStack.pop();
    if (innerLevel == null) {
      throw new Error("Layout stack is empty");
    }
    this.#raiseBoundary(innerLevel.boundary, innerLevel);
    if (this.#layoutStack.length > 0) {
      const higherLevel = this.#layoutStack[this.#layoutStack.length - 1];
      switch (this.currentOperation) {
        case 3 /* VerticalLayout */:
          higherLevel.boundary.verticalMergeFrom(innerLevel.boundary);
          higherLevel.branchRoot.state.branchExterior = higherLevel.boundary.boundingRect;
          break;
        case 4 /* HorizontalLayout */: {
          if (higherLevel.branchRoot.assistantsRoot !== innerLevel.branchRoot) {
            const strategy = higherLevel.branchRoot.state.requireLayoutStrategy();
            const overlap = higherLevel.boundary.computeOverlap(innerLevel.boundary, strategy.siblingSpacing, this.diagram.layoutSettings.branchSpacing);
            if (overlap > 0) {
              LayoutAlgorithm.moveBranch(this, innerLevel, overlap);
              this.#raiseBoundary(innerLevel.boundary, innerLevel);
            }
          }
          higherLevel.boundary.mergeFrom(innerLevel.boundary);
          const bounds = higherLevel.boundary.boundingRect;
          const exterior = higherLevel.branchRoot.state.branchExterior;
          higherLevel.branchRoot.state.branchExterior = Rect.of(bounds.left, exterior.top, bounds.size.width, exterior.size.height);
          break;
        }
        default:
          throw new Error("This operation can only be invoked when performing vertical or horizontal layouts");
      }
      this.#raiseBoundary(higherLevel.boundary, higherLevel);
    }
    this.#pooledBoundaries.push(innerLevel.boundary);
  }
  #raiseBoundary(boundary, level) {
    if (this.#boundaryHandlers.length === 0) {
      return;
    }
    const args = new BoundaryChangedEventArgs(boundary, level, this);
    for (const handler of this.#boundaryHandlers) {
      handler(this, args);
    }
  }
}

// src/layout-algorithm.ts
class LayoutAlgorithm {
  static computeBranchVisualBoundingRect(visualTree) {
    let result = Rect.zero();
    let initialized = false;
    visualTree.iterateParentFirst((node) => {
      const box = node.element;
      if (!node.state.isHidden && !box.isSpecial) {
        const rect = Rect.fromCorner(node.state.topLeft, node.state.size);
        result = initialized ? Rect.union(result, rect) : rect;
        initialized = true;
      }
      return !box.isCollapsed;
    });
    return result;
  }
  static apply(state) {
    if (state.diagram.boxes.systemRoot == null) {
      throw new Error("SystemRoot is not initialized on the box container");
    }
    state.currentOperation = 1 /* Preparing */;
    const tree = BoxTree.build(state);
    state.diagram.visualTree = tree;
    if (tree.root == null || tree.root.element.id !== state.diagram.boxes.systemRoot.id) {
      throw new Error("SystemRoot is not on the top of the visual tree");
    }
    tree.updateHierarchyStats();
    state.attachVisualTree(tree);
    tree.iterateParentFirst((node) => {
      node.state.isHidden = node.parentNode != null && (node.parentNode.state.isHidden || node.parentNode.element.isCollapsed);
      return true;
    });
    state.currentOperation = 2 /* PreprocessVisualTree */;
    if (state.boxSizeFunc != null) {
      const sizeOf = state.boxSizeFunc;
      for (const box of state.diagram.boxes.boxesById.values()) {
        if (box.isDataBound && box.dataId != null) {
          box.size = sizeOf(box.dataId);
        }
      }
    }
    for (const box of state.diagram.boxes.boxesById.values()) {
      assertBoxSize(box);
    }
    tree.iterateParentFirst((node) => {
      node.state.moveTo(0, 0);
      node.state.size = node.element.size;
      node.state.branchExterior = Rect.fromCorner(new Point(0, 0), node.element.size);
      return true;
    });
    preprocessVisualTree(state, tree);
    tree.updateHierarchyStats();
    state.currentOperation = 3 /* VerticalLayout */;
    LayoutAlgorithm.verticalLayout(state, tree.root);
    state.currentOperation = 4 /* HorizontalLayout */;
    LayoutAlgorithm.horizontalLayout(state, tree.root);
    state.currentOperation = 5 /* ConnectorsLayout */;
    routeConnectors(state, tree);
    state.currentOperation = 6 /* Completed */;
  }
  static horizontalLayout(state, branchRoot) {
    if (branchRoot.state.isHidden) {
      throw new Error(`Branch root ${branchRoot.element.id} does not affect layout`);
    }
    const level = state.pushLayoutLevel(branchRoot);
    try {
      if (branchRoot.level === 0 || (branchRoot.state.numberOfSiblings > 0 || branchRoot.assistantsRoot != null) && !branchRoot.element.isCollapsed) {
        branchRoot.state.requireLayoutStrategy().applyHorizontalLayout(state, level);
      }
    } finally {
      state.popLayoutLevel();
    }
  }
  static verticalLayout(state, branchRoot) {
    if (branchRoot.state.isHidden) {
      throw new Error(`Branch root ${branchRoot.element.id} does not affect layout`);
    }
    const level = state.pushLayoutLevel(branchRoot);
    try {
      if (branchRoot.level === 0 || (branchRoot.state.numberOfSiblings > 0 || branchRoot.assistantsRoot != null) && !branchRoot.element.isCollapsed) {
        branchRoot.state.requireLayoutStrategy().applyVerticalLayout(state, level);
      }
    } finally {
      state.popLayoutLevel();
    }
  }
  static moveChildrenOnly(_state, layoutLevel, offset) {
    const children = layoutLevel.branchRoot.children;
    if (children == null || children.length === 0) {
      throw new Error("Should never be invoked when children not set");
    }
    for (const child of children) {
      moveOne(child, offset);
    }
    layoutLevel.boundary.reloadFromBranch(layoutLevel.branchRoot);
    layoutLevel.branchRoot.state.branchExterior = layoutLevel.boundary.boundingRect;
  }
  static moveBranch(_state, layoutLevel, offset) {
    moveOne(layoutLevel.branchRoot, offset);
    layoutLevel.boundary.reloadFromBranch(layoutLevel.branchRoot);
    layoutLevel.branchRoot.state.branchExterior = layoutLevel.boundary.boundingRect;
  }
  static alignHorizontalCenters(_state, level, subset) {
    const nodes = [...subset];
    let center = DOUBLE_MIN;
    for (const child of nodes) {
      const c = child.state.centerH;
      if (c > center) {
        center = c;
      }
    }
    let leftmost = DOUBLE_MAX;
    let rightmost = DOUBLE_MIN;
    for (const child of nodes) {
      const c = child.state.centerH;
      if (!isEqual(c, center)) {
        moveOne(child, center - c);
      }
      leftmost = Math.min(leftmost, child.state.branchExterior.left);
      rightmost = Math.max(rightmost, child.state.branchExterior.right);
    }
    level.boundary.reloadFromBranch(level.branchRoot);
    return new Dimensions(leftmost, rightmost);
  }
}
function assertBoxSize(box) {
  if (box.size.width >= 0 && box.size.width <= 1e9) {
    if (box.size.height >= 0 && box.size.width <= 1e9) {
      return;
    }
  }
  throw new Error(`Box ${box.id} has invalid size: ${box.size.width}x${box.size.height}`);
}
function preprocessVisualTree(state, visualTree) {
  const regular = [state.diagram.layoutSettings.requireDefaultLayoutStrategy()];
  const assistants = [state.diagram.layoutSettings.requireDefaultAssistantLayoutStrategy()];
  visualTree.iterateParentFirst((node) => {
    if (node.state.isHidden) {
      return false;
    }
    let strategy = null;
    if (state.layoutOptimizerFunc != null) {
      const suggestedStrategyId = state.layoutOptimizerFunc(node);
      if (suggestedStrategyId != null && suggestedStrategyId.length > 0) {
        const found = state.diagram.layoutSettings.layoutStrategies.get(suggestedStrategyId);
        if (found === undefined) {
          throw new Error(`Unknown layout strategy ${suggestedStrategyId}`);
        }
        strategy = found;
      }
    }
    if (node.isAssistantRoot) {
      if (strategy == null) {
        const assistantId = node.parentNode?.element.assistantLayoutStrategyId;
        strategy = assistantId != null ? requiredStrategy(state, assistantId) : assistants[assistants.length - 1];
      }
      assistants.push(strategy);
    } else {
      if (strategy == null) {
        const layoutId = node.element.layoutStrategyId;
        strategy = layoutId != null ? requiredStrategy(state, layoutId) : regular[regular.length - 1];
      }
      regular.push(strategy);
      if (!strategy.supportsAssistants) {
        node.suppressAssistants();
      }
    }
    node.state.effectiveLayoutStrategy = strategy;
    node.state.requireLayoutStrategy().preProcessThisNode(state, node);
    return !node.element.isCollapsed && node.childCount > 0 || node.assistantsRoot != null;
  }, (node) => {
    if (!node.state.isHidden) {
      if (node.isAssistantRoot) {
        assistants.pop();
      } else {
        regular.pop();
      }
    }
  });
}
function requiredStrategy(state, id) {
  const strategy = state.diagram.layoutSettings.layoutStrategies.get(id);
  if (strategy === undefined) {
    throw new Error(`Unknown layout strategy ${id}`);
  }
  return strategy;
}
function routeConnectors(state, visualTree) {
  visualTree.iterateParentFirst((node) => {
    if (node.element.isCollapsed || node.state.numberOfSiblings === 0 && node.assistantsRoot == null) {
      return false;
    }
    if (node.level === 0) {
      return true;
    }
    if (!node.element.isSpecial || node.isAssistantRoot) {
      node.state.requireLayoutStrategy().routeConnectors(state, node);
      return true;
    }
    return false;
  });
}
function moveOne(root, offset) {
  root.iterateChildFirst((node) => {
    if (!node.state.isHidden) {
      node.state.topLeft = node.state.topLeft.moveH(offset);
      node.state.branchExterior = node.state.branchExterior.moveH(offset);
    }
    return true;
  });
}
// src/layout-strategy.ts
var BranchParentAlignment;
((BranchParentAlignment2) => {
  BranchParentAlignment2[BranchParentAlignment2["Invalid"] = 0] = "Invalid";
  BranchParentAlignment2[BranchParentAlignment2["Left"] = 1] = "Left";
  BranchParentAlignment2[BranchParentAlignment2["Center"] = 2] = "Center";
  BranchParentAlignment2[BranchParentAlignment2["Right"] = 3] = "Right";
})(BranchParentAlignment ||= {});
var StackOrientation;
((StackOrientation2) => {
  StackOrientation2[StackOrientation2["Invalid"] = 0] = "Invalid";
  StackOrientation2[StackOrientation2["SingleRowHorizontal"] = 1] = "SingleRowHorizontal";
  StackOrientation2[StackOrientation2["SingleColumnVertical"] = 2] = "SingleColumnVertical";
})(StackOrientation ||= {});

class LayoutStrategyBase {
  parentAlignment = 0 /* Invalid */;
  parentChildSpacing = 20;
  parentConnectorShield = 50;
  siblingSpacing = 20;
  childConnectorHookLength = 5;
}
// src/strategies/fishbone-assistants-layout-strategy.ts
class FishboneAssistantsLayoutStrategy extends LayoutStrategyBase {
  supportsAssistants = false;
  preProcessThisNode(_state, node) {
    node.state.numberOfSiblings = node.childCount;
    if (node.state.numberOfSiblings === 0) {
      return;
    }
    node.state.numberOfSiblingColumns = 1;
    node.state.numberOfSiblingRows = div(node.state.numberOfSiblings, 2);
    if (node.state.numberOfSiblings % 2 !== 0) {
      node.state.numberOfSiblingRows++;
    }
    node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
  }
  applyVerticalLayout(state, level) {
    const node = level.branchRoot;
    if (node.level === 0) {
      throw new Error("Should never be invoked on root node");
    }
    const children = node.children;
    if (children == null) {
      return;
    }
    let prevRowBottom = node.state.siblingsRowV.to;
    const maxOnLeft = maxOnLeftOf(node);
    for (let i = 0;i < maxOnLeft; i++) {
      const spacing = i === 0 ? this.parentChildSpacing : this.siblingSpacing;
      const child = children[i];
      const frame = child.state;
      frame.moveTo(frame.left, prevRowBottom + spacing);
      let rowExterior = new Dimensions(frame.top, frame.bottom);
      const i2 = i + maxOnLeft;
      if (i2 < node.state.numberOfSiblings) {
        const child2 = children[i2];
        const frame2 = child2.state;
        frame2.moveTo(frame2.left, prevRowBottom + spacing);
        if (frame2.bottom > frame.bottom) {
          frame.moveTo(frame.left, frame2.centerV - frame.size.height / 2);
        } else if (frame2.bottom < frame.bottom) {
          frame2.moveTo(frame2.left, frame.centerV - frame2.size.height / 2);
        }
        frame2.branchExterior = Rect.fromCorner(frame2.topLeft, frame2.size);
        rowExterior = Dimensions.union(rowExterior, new Dimensions(frame2.top, frame2.bottom));
        frame2.siblingsRowV = rowExterior;
        LayoutAlgorithm.verticalLayout(state, child2);
        prevRowBottom = frame2.branchExterior.bottom;
      }
      frame.branchExterior = Rect.fromCorner(frame.topLeft, frame.size);
      frame.siblingsRowV = rowExterior;
      LayoutAlgorithm.verticalLayout(state, child);
      prevRowBottom = Math.max(prevRowBottom, frame.branchExterior.bottom);
    }
  }
  applyHorizontalLayout(state, level) {
    const node = level.branchRoot;
    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }
    const children = node.children ?? [];
    let left = true;
    let countOnThisSide = 0;
    const maxOnLeft = maxOnLeftOf(node);
    for (let i = 0;i < node.state.numberOfSiblings; i++) {
      const child = children[i];
      LayoutAlgorithm.horizontalLayout(state, child);
      countOnThisSide++;
      if (countOnThisSide !== maxOnLeft || !left) {
        continue;
      }
      LayoutAlgorithm.alignHorizontalCenters(state, level, children.slice(0, maxOnLeft));
      left = false;
      countOnThisSide = 0;
      let rightmost = DOUBLE_MIN;
      for (let k = 0;k <= i; k++) {
        rightmost = Math.max(rightmost, children[k].state.branchExterior.right);
      }
      if (node.state.numberOfSiblings % 2 !== 0) {
        rightmost = Math.max(rightmost, child.state.right);
      } else {
        const opposite = children[node.state.numberOfSiblings - 1];
        if (opposite.element.isCollapsed || opposite.childCount === 0) {
          rightmost = Math.max(rightmost, child.state.right);
        } else {
          rightmost = Math.max(rightmost, child.state.branchExterior.right);
        }
      }
      const spacer = children[node.state.numberOfSiblings];
      spacer.state.adjustSpacer(rightmost, node.state.bottom, this.parentConnectorShield, node.state.branchExterior.bottom - node.state.bottom);
      level.boundary.mergeFrom(spacer);
    }
    LayoutAlgorithm.alignHorizontalCenters(state, level, children.slice(maxOnLeft, node.state.numberOfSiblings));
    if (node.level > 0 && node.state.numberOfSiblings > 0) {
      const carrier = children[node.state.numberOfSiblings].state.centerH;
      LayoutAlgorithm.moveChildrenOnly(state, level, node.state.centerH - carrier);
    }
  }
  routeConnectors(_state, node) {
    let count = node.state.numberOfSiblings;
    if (count === 0) {
      return;
    }
    const children = node.children;
    if (children == null || node.parentNode == null) {
      throw new Error("Assistant connectors require a parent and children");
    }
    const needsCarrier = node.parentNode.childCount === 0;
    if (needsCarrier) {
      count++;
    }
    const segments = new Array(count);
    let ix = 0;
    const maxOnLeft = maxOnLeftOf(node);
    const carrier = children[node.state.numberOfSiblings].state;
    const from = carrier.centerH;
    let isLeft = true;
    let countOnThisSide = 0;
    let bottomMost = DOUBLE_MIN;
    for (let i = 0;i < node.state.numberOfSiblings; i++) {
      const to = isLeft ? children[i].state.right : children[i].state.left;
      const y = children[i].state.centerV;
      bottomMost = Math.max(bottomMost, y);
      segments[ix++] = new Edge(new Point(from, y), new Point(to, y));
      countOnThisSide++;
      if (countOnThisSide === maxOnLeft) {
        countOnThisSide = 0;
        isLeft = !isLeft;
      }
    }
    if (needsCarrier) {
      segments[node.state.numberOfSiblings] = new Edge(new Point(carrier.centerH, carrier.top), new Point(carrier.centerH, bottomMost));
    }
    node.state.connector = new Connector(segments);
  }
}
function maxOnLeftOf(node) {
  return div(node.state.numberOfSiblings, 2) + node.state.numberOfSiblings % 2;
}
function div(a, b) {
  return Math.trunc(a / b);
}
// src/strategies/linear-layout-strategy.ts
class LinearLayoutStrategy extends LayoutStrategyBase {
  supportsAssistants = true;
  preProcessThisNode(_state, node) {
    if (node.childCount === 0) {
      return;
    }
    node.state.numberOfSiblings = node.element.isCollapsed ? 0 : node.childCount;
    if (node.element.isCollapsed) {
      return;
    }
    node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
  }
  applyVerticalLayout(state, level) {
    const node = level.branchRoot;
    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }
    if (node.assistantsRoot != null) {
      node.assistantsRoot.state.copyExteriorFrom(node.state);
      LayoutAlgorithm.verticalLayout(state, node.assistantsRoot);
    }
    if (node.state.numberOfSiblings === 0) {
      return;
    }
    let siblingsRowExterior = Dimensions.minMax();
    const top = node.assistantsRoot == null ? node.state.siblingsRowV.to + this.parentChildSpacing : node.state.branchExterior.bottom + this.parentChildSpacing;
    const children = requiredChildren(node);
    for (let i = 0;i < node.state.numberOfSiblings; i++) {
      const child = children[i];
      child.state.moveTo(0, top);
      child.state.branchExterior = Rect.fromCorner(child.state.topLeft, child.state.size);
      siblingsRowExterior = Dimensions.union(siblingsRowExterior, new Dimensions(top, top + child.state.size.height));
    }
    siblingsRowExterior = new Dimensions(siblingsRowExterior.from, siblingsRowExterior.to);
    for (let i = 0;i < node.state.numberOfSiblings; i++) {
      const child = children[i];
      child.state.siblingsRowV = siblingsRowExterior;
      LayoutAlgorithm.verticalLayout(state, child);
    }
  }
  applyHorizontalLayout(state, level) {
    const node = level.branchRoot;
    if (node.assistantsRoot != null) {
      LayoutAlgorithm.horizontalLayout(state, node.assistantsRoot);
    }
    const children = node.children ?? [];
    for (let i = 0;i < node.state.numberOfSiblings; i++) {
      LayoutAlgorithm.horizontalLayout(state, children[i]);
    }
    if (node.level > 0 && node.childCount > 0) {
      const rect = node.state;
      const leftmost = children[0].state.centerH;
      const rightmost = children[node.state.numberOfSiblings - 1].state.centerH;
      const desiredCenter = node.state.numberOfSiblings === 1 || this.parentAlignment === 2 /* Center */ ? leftmost + (rightmost - leftmost) / 2 : this.parentAlignment === 1 /* Left */ ? leftmost + this.childConnectorHookLength : rightmost - this.childConnectorHookLength;
      LayoutAlgorithm.moveChildrenOnly(state, level, rect.centerH - desiredCenter);
      const verticalSpacer = children[node.state.numberOfSiblings];
      verticalSpacer.state.adjustSpacer(rect.centerH - this.parentConnectorShield / 2, rect.bottom, this.parentConnectorShield, children[0].state.siblingsRowV.from - rect.bottom);
      state.mergeSpacer(verticalSpacer);
      const firstInRow = children[0].state;
      const horizontalSpacer = children[node.state.numberOfSiblings + 1];
      horizontalSpacer.state.adjustSpacer(firstInRow.left, firstInRow.siblingsRowV.from - this.parentChildSpacing, children[node.state.numberOfSiblings - 1].state.right - firstInRow.left, this.parentChildSpacing);
      state.mergeSpacer(horizontalSpacer);
    }
  }
  routeConnectors(_state, node) {
    const normalChildCount = node.state.numberOfSiblings;
    const count = normalChildCount === 0 ? 0 : normalChildCount === 1 ? 1 : 1 + 1 + normalChildCount;
    if (count === 0) {
      node.state.connector = null;
      return;
    }
    const children = node.children;
    if (children == null) {
      throw new Error("State is present, but children not set");
    }
    const segments = new Array(count);
    const rootRect = node.state;
    const center = rootRect.centerH;
    if (count === 1) {
      segments[0] = new Edge(new Point(center, rootRect.bottom), new Point(center, children[0].state.top));
    } else {
      const space = children[0].state.siblingsRowV.from - rootRect.bottom;
      segments[0] = new Edge(new Point(center, rootRect.bottom), new Point(center, rootRect.bottom + space - this.childConnectorHookLength));
      for (let i = 0;i < normalChildCount; i++) {
        const childRect = children[i].state;
        const childCenter = childRect.centerH;
        segments[1 + i] = new Edge(new Point(childCenter, childRect.top), new Point(childCenter, childRect.top - this.childConnectorHookLength));
      }
      segments[count - 1] = new Edge(new Point(segments[1].to.x, segments[1].to.y), new Point(segments[count - 2].to.x, segments[1].to.y));
    }
    node.state.connector = new Connector(segments);
  }
}
function requiredChildren(node) {
  if (node.children == null) {
    throw new Error("Children are not set");
  }
  return node.children;
}
// src/strategies/multi-line-fishbone-layout-strategy.ts
class MultiLineFishboneLayoutStrategy extends LinearLayoutStrategy {
  maxGroups = 4;
  preProcessThisNode(state, node) {
    if (this.maxGroups <= 0) {
      throw new Error("MaxGroups must be a positive value");
    }
    if (node.childCount <= this.maxGroups * 2) {
      super.preProcessThisNode(state, node);
      return;
    }
    node.state.numberOfSiblings = node.childCount;
    if (node.state.numberOfSiblings === 0) {
      return;
    }
    node.state.numberOfSiblingColumns = this.maxGroups;
    node.state.numberOfSiblingRows = div2(node.state.numberOfSiblings, this.maxGroups * 2);
    if (node.state.numberOfSiblings % (this.maxGroups * 2) !== 0) {
      node.state.numberOfSiblingRows++;
    }
    node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    for (let i = 0;i < node.state.numberOfSiblingColumns; i++) {
      node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    }
    if (node.state.numberOfSiblingColumns > 1) {
      node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    }
  }
  applyVerticalLayout(state, level) {
    const node = level.branchRoot;
    if (node.state.numberOfSiblings <= this.maxGroups * 2) {
      super.applyVerticalLayout(state, level);
      return;
    }
    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }
    if (node.assistantsRoot != null) {
      node.assistantsRoot.state.copyExteriorFrom(node.state);
      LayoutAlgorithm.verticalLayout(state, node.assistantsRoot);
    }
    const adapter = new SingleFishboneLayoutAdapter(node);
    while (adapter.nextGroup()) {
      LayoutAlgorithm.verticalLayout(state, adapter.specialRoot);
    }
  }
  applyHorizontalLayout(state, level) {
    const node = level.branchRoot;
    if (node.state.numberOfSiblings <= this.maxGroups * 2) {
      super.applyHorizontalLayout(state, level);
      return;
    }
    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }
    if (node.assistantsRoot != null) {
      LayoutAlgorithm.horizontalLayout(state, node.assistantsRoot);
    }
    const adapter = new SingleFishboneLayoutAdapter(node);
    while (adapter.nextGroup()) {
      LayoutAlgorithm.horizontalLayout(state, adapter.specialRoot);
    }
    const rect = node.state;
    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }
    if (node.level > 0) {
      let diff;
      if (node.state.numberOfSiblingColumns > 1) {
        const leftCarrier = children[node.state.numberOfSiblings + 1].state.centerH;
        const rightCarrier = children[node.state.numberOfSiblings + node.state.numberOfSiblingColumns].state.centerH;
        const desiredCenter = node.state.numberOfSiblings === 1 || this.parentAlignment === 2 /* Center */ ? leftCarrier + (rightCarrier - leftCarrier) / 2 : this.parentAlignment === 1 /* Left */ ? leftCarrier + this.childConnectorHookLength : rightCarrier - this.childConnectorHookLength;
        diff = rect.centerH - desiredCenter;
      } else {
        const carrier = children[1 + node.state.numberOfSiblings].state.centerH;
        diff = rect.centerH - carrier;
      }
      LayoutAlgorithm.moveChildrenOnly(state, level, diff);
    }
    if (node.level > 0) {
      let ix = node.state.numberOfSiblings;
      const verticalSpacer = children[ix];
      verticalSpacer.state.adjustSpacer(rect.centerH - this.parentConnectorShield / 2, rect.bottom, this.parentConnectorShield, children[0].state.siblingsRowV.from - rect.bottom);
      state.mergeSpacer(verticalSpacer);
      ix++;
      ix += node.state.numberOfSiblingColumns;
      if (node.state.numberOfSiblingColumns > 1) {
        const horizontalSpacer = children[ix];
        const leftmost = children[node.state.numberOfSiblings + 1].state.topLeft;
        const rightmost = children[ix - 1].state.right;
        horizontalSpacer.state.adjustSpacer(leftmost.x, leftmost.y - this.parentChildSpacing, rightmost - leftmost.x, this.parentChildSpacing);
        state.mergeSpacer(horizontalSpacer);
      }
    }
  }
  routeConnectors(state, node) {
    if (node.state.numberOfSiblings <= this.maxGroups * 2) {
      super.routeConnectors(state, node);
      return;
    }
    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }
    let count = 1 + node.state.numberOfSiblings + node.state.numberOfSiblingColumns;
    if (node.state.numberOfSiblingColumns > 1) {
      count++;
    }
    const segments = new Array(count);
    const rootRect = node.state;
    const center = rootRect.centerH;
    let ix = 0;
    const space = children[0].state.siblingsRowV.from - rootRect.bottom;
    segments[ix++] = new Edge(new Point(center, rootRect.bottom), new Point(center, rootRect.bottom + space - this.childConnectorHookLength));
    const iterator = new GroupIterator(node.state.numberOfSiblings, node.state.numberOfSiblingColumns);
    while (iterator.nextGroup()) {
      const carrier = children[1 + node.state.numberOfSiblings + iterator.group].state;
      const from = carrier.centerH;
      let isLeft = true;
      let countOnThisSide = 0;
      for (let i = iterator.fromIndex;i < iterator.fromIndex + iterator.count; i++) {
        const to = isLeft ? children[i].state.right : children[i].state.left;
        const y = children[i].state.centerV;
        segments[ix++] = new Edge(new Point(from, y), new Point(to, y));
        countOnThisSide++;
        if (countOnThisSide === iterator.maxOnLeft) {
          countOnThisSide = 0;
          if (isLeft) {
            segments[1 + node.state.numberOfSiblings + iterator.group] = new Edge(new Point(carrier.centerH, carrier.top - this.childConnectorHookLength), new Point(carrier.centerH, children[i].state.centerV));
          }
          isLeft = !isLeft;
        }
      }
    }
    ix += node.state.numberOfSiblingColumns;
    if (node.state.numberOfSiblingColumns > 1) {
      const leftGroup = children[1 + node.state.numberOfSiblings].state;
      const rightGroup = children[1 + node.state.numberOfSiblings + node.state.numberOfSiblingColumns - 1].state;
      segments[ix] = new Edge(new Point(leftGroup.centerH, leftGroup.top - this.childConnectorHookLength), new Point(rightGroup.centerH, rightGroup.top - this.childConnectorHookLength));
    }
    node.state.connector = new Connector(segments);
  }
}

class GroupIterator {
  numberOfSiblings;
  numberOfGroups;
  group = 0;
  fromIndex = 0;
  count = 0;
  maxOnLeft = 0;
  constructor(numberOfSiblings, numberOfGroups) {
    this.numberOfSiblings = numberOfSiblings;
    this.numberOfGroups = numberOfGroups;
  }
  countInGroup() {
    const countInRow = this.numberOfGroups * 2;
    let result = 0;
    let countToThisGroup = this.group * 2 + 2;
    let firstInRow = 0;
    while (true) {
      const countInThisRow = firstInRow >= this.numberOfSiblings - countInRow ? this.numberOfSiblings - firstInRow : countInRow;
      if (countInThisRow >= countToThisGroup) {
        result += 2;
      } else {
        countToThisGroup--;
        if (countInThisRow >= countToThisGroup) {
          result++;
        }
        break;
      }
      firstInRow += countInThisRow;
    }
    return result;
  }
  nextGroup() {
    this.fromIndex = this.fromIndex + this.count;
    if (this.fromIndex > 0) {
      this.group++;
    }
    this.count = this.countInGroup();
    this.maxOnLeft = div2(this.count, 2) + this.count % 2;
    return this.count !== 0;
  }
}

class TreeNodeView extends BoxTree.Node {
  prepare() {
    if (this.children == null) {
      this.children = [];
    } else {
      this.children.length = 0;
    }
  }
  addChildView(node) {
    if (this.children == null) {
      this.children = [];
    }
    this.children.push(node);
  }
}

class SingleFishboneLayoutAdapter extends LayoutStrategyBase {
  supportsAssistants = false;
  realRoot;
  specialRoot;
  iterator;
  constructor(realRoot) {
    super();
    this.iterator = new GroupIterator(realRoot.state.numberOfSiblings, realRoot.state.numberOfSiblingColumns);
    this.realRoot = realRoot;
    this.specialRoot = new TreeNodeView(Box.special(BOX_NONE, realRoot.element.id, true));
    this.specialRoot.level = realRoot.level;
    this.specialRoot.parentNode = realRoot;
    this.specialRoot.state.effectiveLayoutStrategy = this;
    const parentStrategy = realRoot.state.requireLayoutStrategy();
    if (!(parentStrategy instanceof MultiLineFishboneLayoutStrategy)) {
      throw new Error("Fishbone group adapter requires MultiLineFishboneLayoutStrategy");
    }
    this.siblingSpacing = parentStrategy.siblingSpacing;
    this.parentConnectorShield = parentStrategy.parentConnectorShield;
    this.parentChildSpacing = parentStrategy.parentChildSpacing;
    this.parentAlignment = parentStrategy.parentAlignment;
    this.childConnectorHookLength = parentStrategy.childConnectorHookLength;
  }
  nextGroup() {
    if (!this.iterator.nextGroup()) {
      return false;
    }
    this.specialRoot.state.numberOfSiblings = this.iterator.count;
    this.specialRoot.prepare();
    const children = this.realRoot.children;
    if (children == null) {
      throw new Error("Children are not set");
    }
    for (let i = 0;i < this.iterator.count; i++) {
      this.specialRoot.addChildView(children[this.iterator.fromIndex + i]);
    }
    const spacer = children[this.realRoot.state.numberOfSiblings + 1 + this.iterator.group];
    this.specialRoot.addChildView(spacer);
    this.specialRoot.state.copyExteriorFrom(this.realRoot.state);
    return true;
  }
  preProcessThisNode(_state, _node) {
    throw new Error("Not supported");
  }
  applyVerticalLayout(state, _level) {
    const children = this.specialRoot.children;
    if (children == null) {
      throw new Error("Children are not set");
    }
    let prevRowBottom = this.realRoot.assistantsRoot != null ? this.realRoot.assistantsRoot.state.branchExterior.bottom : this.specialRoot.state.siblingsRowV.to;
    for (let i = 0;i < this.iterator.maxOnLeft; i++) {
      const spacing = i === 0 ? this.parentChildSpacing : this.siblingSpacing;
      const child = children[i];
      const frame = child.state;
      frame.moveTo(frame.left, prevRowBottom + spacing);
      let rowExterior = new Dimensions(frame.top, frame.bottom);
      const i2 = i + this.iterator.maxOnLeft;
      if (i2 < this.iterator.count) {
        const child2 = children[i2];
        const frame2 = child2.state;
        frame2.moveTo(frame2.left, prevRowBottom + spacing);
        if (frame2.bottom > frame.bottom) {
          frame.moveTo(frame.left, frame2.centerV - frame.size.height / 2);
        } else if (frame2.bottom < frame.bottom) {
          frame2.moveTo(frame2.left, frame.centerV - frame2.size.height / 2);
        }
        frame2.branchExterior = Rect.fromCorner(frame2.topLeft, frame2.size);
        rowExterior = Dimensions.union(rowExterior, new Dimensions(frame2.top, frame2.bottom));
        frame2.siblingsRowV = rowExterior;
        LayoutAlgorithm.verticalLayout(state, child2);
        prevRowBottom = frame2.branchExterior.bottom;
      }
      frame.branchExterior = Rect.fromCorner(frame.topLeft, frame.size);
      frame.siblingsRowV = rowExterior;
      LayoutAlgorithm.verticalLayout(state, child);
      prevRowBottom = Math.max(prevRowBottom, frame.branchExterior.bottom);
    }
  }
  applyHorizontalLayout(state, level) {
    if (level.branchRoot !== this.specialRoot) {
      throw new Error("Wrong root node received");
    }
    const children = this.specialRoot.children;
    if (children == null) {
      throw new Error("Children are not set");
    }
    let left = true;
    let countOnThisSide = 0;
    for (let i = 0;i < this.iterator.count; i++) {
      const child = children[i];
      LayoutAlgorithm.horizontalLayout(state, child);
      countOnThisSide++;
      if (countOnThisSide !== this.iterator.maxOnLeft || !left) {
        continue;
      }
      LayoutAlgorithm.alignHorizontalCenters(state, level, children.slice(0, this.iterator.maxOnLeft));
      left = false;
      countOnThisSide = 0;
      let rightmost = DOUBLE_MIN;
      for (let k = 0;k < i; k++) {
        rightmost = Math.max(rightmost, children[k].state.branchExterior.right);
      }
      rightmost = Math.max(rightmost, child.state.right);
      const spacer = children[this.specialRoot.state.numberOfSiblings];
      spacer.state.adjustSpacer(rightmost, children[0].state.siblingsRowV.from, this.siblingSpacing, child.state.siblingsRowV.to - children[0].state.siblingsRowV.from);
      level.boundary.mergeFrom(spacer);
    }
    LayoutAlgorithm.alignHorizontalCenters(state, level, children.slice(this.iterator.maxOnLeft, this.iterator.count));
  }
  routeConnectors(_state, _node) {
    throw new Error("Not supported");
  }
}
function div2(a, b) {
  return Math.trunc(a / b);
}
// src/strategies/multi-line-hanger-layout-strategy.ts
class MultiLineHangerLayoutStrategy extends LinearLayoutStrategy {
  maxSiblingsPerRow = 4;
  preProcessThisNode(state, node) {
    if (this.maxSiblingsPerRow <= 0 || this.maxSiblingsPerRow % 2 !== 0) {
      throw new Error("MaxSiblingsPerRow must be a positive even value");
    }
    if (node.childCount <= this.maxSiblingsPerRow) {
      super.preProcessThisNode(state, node);
      return;
    }
    node.state.numberOfSiblings = node.childCount;
    if (node.state.numberOfSiblings === 0) {
      return;
    }
    const lastRowBoxCount = node.childCount % this.maxSiblingsPerRow;
    node.state.numberOfSiblingColumns = 1 + this.maxSiblingsPerRow;
    node.state.numberOfSiblingRows = div3(node.childCount, this.maxSiblingsPerRow);
    if (lastRowBoxCount !== 0) {
      node.state.numberOfSiblingRows++;
    }
    node.state.numberOfSiblings = node.childCount + node.state.numberOfSiblingRows;
    if (lastRowBoxCount > 0 && lastRowBoxCount <= div3(this.maxSiblingsPerRow, 2)) {
      node.state.numberOfSiblings--;
    }
    let ix = div3(this.maxSiblingsPerRow, 2);
    while (ix < node.state.numberOfSiblings) {
      node.insertRegularChild(ix, Box.special(BOX_NONE, node.element.id, false));
      ix += node.state.numberOfSiblingColumns;
    }
    node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    for (let i = 0;i < node.state.numberOfSiblingRows; i++) {
      node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    }
  }
  applyVerticalLayout(state, level) {
    const node = level.branchRoot;
    if (node.state.numberOfSiblings <= this.maxSiblingsPerRow) {
      super.applyVerticalLayout(state, level);
      return;
    }
    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }
    if (node.assistantsRoot != null) {
      node.assistantsRoot.state.copyExteriorFrom(node.state);
      LayoutAlgorithm.verticalLayout(state, node.assistantsRoot);
    }
    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }
    let prevRowExterior = new Dimensions(node.state.siblingsRowV.from, node.assistantsRoot == null ? node.state.siblingsRowV.to : node.state.branchExterior.bottom);
    for (let row = 0;row < node.state.numberOfSiblingRows; row++) {
      let siblingsRowExterior = Dimensions.minMax();
      const spacing = row === 0 ? this.parentChildSpacing : this.siblingSpacing;
      const from = row * node.state.numberOfSiblingColumns;
      const to = Math.min(from + node.state.numberOfSiblingColumns, node.state.numberOfSiblings);
      for (let i = from;i < to; i++) {
        const child = children[i];
        if (child.element.isSpecial) {
          continue;
        }
        const top = prevRowExterior.to + spacing;
        child.state.moveTo(child.state.left, top);
        child.state.branchExterior = Rect.fromCorner(child.state.topLeft, child.state.size);
        siblingsRowExterior = Dimensions.union(siblingsRowExterior, new Dimensions(top, top + child.state.size.height));
      }
      siblingsRowExterior = new Dimensions(siblingsRowExterior.from, siblingsRowExterior.to);
      let siblingsBottom = DOUBLE_MIN;
      for (let i = from;i < to; i++) {
        const child = children[i];
        child.state.siblingsRowV = siblingsRowExterior;
        LayoutAlgorithm.verticalLayout(state, child);
        siblingsBottom = Math.max(siblingsBottom, child.state.branchExterior.bottom);
      }
      prevRowExterior = new Dimensions(siblingsRowExterior.from, Math.max(siblingsBottom, siblingsRowExterior.to));
      const spacerIndex = from + div3(node.state.numberOfSiblingColumns, 2);
      if (spacerIndex < node.state.numberOfSiblings) {
        const spacerBottom = row === node.state.numberOfSiblingRows - 1 ? children[spacerIndex - 1].state.siblingsRowV.to : prevRowExterior.to;
        children[spacerIndex].state.adjustSpacer(0, prevRowExterior.from, this.parentConnectorShield, spacerBottom - prevRowExterior.from);
      }
    }
  }
  applyHorizontalLayout(state, level) {
    const node = level.branchRoot;
    if (node.state.numberOfSiblings <= this.maxSiblingsPerRow) {
      super.applyHorizontalLayout(state, level);
      return;
    }
    if (node.assistantsRoot != null) {
      LayoutAlgorithm.horizontalLayout(state, node.assistantsRoot);
    }
    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }
    for (let col = 0;col < node.state.numberOfSiblingColumns; col++) {
      for (let row = 0;row < node.state.numberOfSiblingRows; row++) {
        const ix = row * node.state.numberOfSiblingColumns + col;
        if (ix >= node.state.numberOfSiblings) {
          break;
        }
        LayoutAlgorithm.horizontalLayout(state, children[ix]);
      }
      LayoutAlgorithm.alignHorizontalCenters(state, level, columnNodes(node, col));
    }
    const rect = node.state;
    const spacer = children[div3(node.state.numberOfSiblingColumns, 2)];
    LayoutAlgorithm.moveChildrenOnly(state, level, rect.centerH - spacer.state.centerH);
    const verticalSpacer = children[node.state.numberOfSiblings];
    verticalSpacer.state.adjustSpacer(rect.centerH - this.parentConnectorShield / 2, rect.bottom, this.parentConnectorShield, children[0].state.siblingsRowV.from - rect.bottom);
    state.mergeSpacer(verticalSpacer);
    let spacing = this.parentChildSpacing;
    for (let firstInRowIndex = 0;firstInRowIndex < node.state.numberOfSiblings; firstInRowIndex += node.state.numberOfSiblingColumns) {
      const firstInRow = children[firstInRowIndex].state;
      const lastInRow = children[Math.min(firstInRowIndex + node.state.numberOfSiblingColumns - 1, node.state.numberOfSiblings - 1)].state;
      const horizontalSpacer = children[1 + node.state.numberOfSiblings + div3(firstInRowIndex, node.state.numberOfSiblingColumns)];
      const width = lastInRow.right >= verticalSpacer.state.right ? lastInRow.right - firstInRow.left : verticalSpacer.state.right - firstInRow.left;
      horizontalSpacer.state.adjustSpacer(firstInRow.left, firstInRow.siblingsRowV.from - spacing, width, spacing);
      state.mergeSpacer(horizontalSpacer);
      spacing = this.siblingSpacing;
    }
  }
  routeConnectors(state, node) {
    if (node.state.numberOfSiblings <= this.maxSiblingsPerRow) {
      super.routeConnectors(state, node);
      return;
    }
    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }
    let count = 1 + node.state.numberOfSiblingRows;
    for (const child of children) {
      if (!child.element.isSpecial) {
        count++;
      }
    }
    const segments = new Array(count);
    const rootRect = node.state;
    const center = rootRect.centerH;
    const verticalCarrierHeight = children[node.state.numberOfSiblings - 1].state.siblingsRowV.from - this.childConnectorHookLength - rootRect.bottom;
    segments[0] = new Edge(new Point(center, rootRect.bottom), new Point(center, rootRect.bottom + verticalCarrierHeight));
    let ix = 1;
    for (let i = 0;i < node.state.numberOfSiblings; i++) {
      const child = children[i];
      if (!child.element.isSpecial) {
        const childRect = child.state;
        segments[ix++] = new Edge(new Point(childRect.centerH, childRect.top), new Point(childRect.centerH, childRect.top - this.childConnectorHookLength));
      }
    }
    const lastChildHookIndex = count - node.state.numberOfSiblingRows - 1;
    for (let firstInRowIndex = 1;firstInRowIndex < count - node.state.numberOfSiblingRows; firstInRowIndex += this.maxSiblingsPerRow) {
      const firstInRow = segments[firstInRowIndex];
      const lastInRow = segments[Math.min(firstInRowIndex + this.maxSiblingsPerRow - 1, lastChildHookIndex)];
      if (lastInRow.from.x < segments[0].from.x) {
        segments[ix++] = new Edge(new Point(firstInRow.to.x, firstInRow.to.y), new Point(segments[0].to.x, firstInRow.to.y));
      } else {
        segments[ix++] = new Edge(new Point(firstInRow.to.x, firstInRow.to.y), new Point(lastInRow.to.x, firstInRow.to.y));
      }
    }
    node.state.connector = new Connector(segments);
  }
}
function columnNodes(branchRoot, col) {
  const children = branchRoot.children;
  if (children == null) {
    return [];
  }
  const result = [];
  for (let row = 0;row < branchRoot.state.numberOfSiblingRows; row++) {
    const ix = row * branchRoot.state.numberOfSiblingColumns + col;
    if (ix >= branchRoot.state.numberOfSiblings) {
      break;
    }
    result.push(children[ix]);
  }
  return result;
}
function div3(a, b) {
  return Math.trunc(a / b);
}
// src/strategies/single-column-layout-strategy.ts
class SingleColumnLayoutStrategy extends LayoutStrategyBase {
  supportsAssistants = true;
  preProcessThisNode(_state, node) {
    if (this.parentAlignment !== 1 /* Left */ && this.parentAlignment !== 3 /* Right */) {
      throw new Error("Unsupported value for ParentAlignment");
    }
    node.state.numberOfSiblings = node.element.isCollapsed ? 0 : node.childCount;
    if (node.state.numberOfSiblings > 0 && node.level > 0) {
      node.state.numberOfSiblingColumns = 1;
      node.state.numberOfSiblingRows = node.childCount;
      node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    }
  }
  applyVerticalLayout(state, level) {
    const node = level.branchRoot;
    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }
    if (node.assistantsRoot != null) {
      node.assistantsRoot.state.copyExteriorFrom(node.state);
      LayoutAlgorithm.verticalLayout(state, node.assistantsRoot);
    }
    let prevRowExterior = new Dimensions(node.state.siblingsRowV.from, node.assistantsRoot == null ? node.state.siblingsRowV.to : node.state.branchExterior.bottom);
    const children = node.children ?? [];
    for (let row = 0;row < node.state.numberOfSiblings; row++) {
      const child = children[row];
      const top = prevRowExterior.to + (row === 0 ? this.parentChildSpacing : this.siblingSpacing);
      child.state.moveTo(child.state.left, top);
      child.state.branchExterior = Rect.fromCorner(child.state.topLeft, child.state.size);
      const rowExterior = new Dimensions(top, top + child.state.size.height);
      child.state.siblingsRowV = rowExterior;
      LayoutAlgorithm.verticalLayout(state, child);
      prevRowExterior = new Dimensions(rowExterior.from, Math.max(child.state.branchExterior.bottom, rowExterior.to));
    }
  }
  applyHorizontalLayout(state, level) {
    const node = level.branchRoot;
    const nodeState = node.state;
    if (node.assistantsRoot != null) {
      LayoutAlgorithm.horizontalLayout(state, node.assistantsRoot);
    }
    const children = node.children ?? [];
    for (let row = 0;row < nodeState.numberOfSiblings; row++) {
      LayoutAlgorithm.horizontalLayout(state, children[row]);
    }
    const column = [];
    for (let i = 0;i < node.state.numberOfSiblings; i++) {
      column.push(children[i]);
    }
    const edges = LayoutAlgorithm.alignHorizontalCenters(state, level, column);
    if (node.level > 0 && node.childCount > 0) {
      const rect = node.state;
      let diff;
      if (this.parentAlignment === 1 /* Left */) {
        diff = rect.centerH + this.parentConnectorShield / 2 - edges.from;
      } else if (this.parentAlignment === 3 /* Right */) {
        diff = rect.centerH - this.parentConnectorShield / 2 - edges.to;
      } else {
        throw new Error("Invalid ParentAlignment setting");
      }
      LayoutAlgorithm.moveChildrenOnly(state, level, diff);
      const verticalSpacer = node.level > 0 ? children[node.childCount - 1] : null;
      if (verticalSpacer != null) {
        const spacerTop = node.state.bottom;
        const spacerBottom = children[node.childCount - 2].state.bottom;
        verticalSpacer.state.adjustSpacer(rect.centerH - this.parentConnectorShield / 2, spacerTop, this.parentConnectorShield, spacerBottom - spacerTop);
        state.mergeSpacer(verticalSpacer);
      }
    }
  }
  routeConnectors(_state, node) {
    if (node.childCount === 0) {
      return;
    }
    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }
    const count = 1 + node.state.numberOfSiblings;
    const segments = new Array(count);
    const rootRect = node.state;
    const center = rootRect.centerH;
    const verticalCarrierHeight = children[node.state.numberOfSiblings - 1].state.centerV - node.state.bottom;
    segments[0] = new Edge(new Point(center, rootRect.bottom), new Point(center, rootRect.bottom + verticalCarrierHeight));
    for (let ix = 0;ix < node.state.numberOfSiblings; ix++) {
      const rect = children[ix].state;
      const destination = this.parentAlignment === 1 /* Left */ ? rect.left : rect.right;
      segments[1 + ix] = new Edge(new Point(center, rect.centerV), new Point(destination, rect.centerV));
    }
    node.state.connector = new Connector(segments);
  }
}
// src/strategies/stacking-layout-strategy.ts
class StackingLayoutStrategy extends LayoutStrategyBase {
  orientation = 1 /* SingleRowHorizontal */;
  supportsAssistants = false;
  constructor() {
    super();
    this.parentAlignment = 0 /* Invalid */;
    this.childConnectorHookLength = 0;
    this.parentConnectorShield = 0;
    this.siblingSpacing = 5;
  }
  preProcessThisNode(_state, node) {
    node.state.numberOfSiblings = node.element.isCollapsed ? 0 : node.childCount;
    if (node.state.numberOfSiblings === 0) {
      return;
    }
    if (this.orientation !== 1 /* SingleRowHorizontal */ && this.orientation !== 2 /* SingleColumnVertical */) {
      throw new Error(`Unsupported value for orientation: ${this.orientation}`);
    }
  }
  applyVerticalLayout(state, level) {
    const node = level.branchRoot;
    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }
    if (node.state.numberOfSiblings === 0) {
      return;
    }
    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }
    if (this.orientation === 1 /* SingleRowHorizontal */) {
      let siblingsRowExterior = Dimensions.minMax();
      const top = node.assistantsRoot == null ? node.state.siblingsRowV.to + this.parentChildSpacing : node.state.branchExterior.bottom + this.parentChildSpacing;
      for (let i = 0;i < node.state.numberOfSiblings; i++) {
        const child = children[i];
        child.state.moveTo(0, top);
        child.state.branchExterior = Rect.fromCorner(child.state.topLeft, child.state.size);
        siblingsRowExterior = Dimensions.union(siblingsRowExterior, new Dimensions(top, top + child.state.size.height));
      }
      siblingsRowExterior = new Dimensions(siblingsRowExterior.from, siblingsRowExterior.to);
      for (let i = 0;i < node.state.numberOfSiblings; i++) {
        const child = children[i];
        child.state.siblingsRowV = siblingsRowExterior;
        LayoutAlgorithm.verticalLayout(state, child);
      }
      return;
    }
    if (this.orientation === 2 /* SingleColumnVertical */) {
      let prevRowExterior = new Dimensions(node.state.siblingsRowV.from, node.state.siblingsRowV.to);
      for (let row = 0;row < node.state.numberOfSiblings; row++) {
        const child = children[row];
        const top = prevRowExterior.to + (row === 0 ? this.parentChildSpacing : this.siblingSpacing);
        child.state.moveTo(child.state.left, top);
        child.state.branchExterior = Rect.fromCorner(child.state.topLeft, child.state.size);
        const rowExterior = new Dimensions(top, top + child.state.size.height);
        child.state.siblingsRowV = rowExterior;
        LayoutAlgorithm.verticalLayout(state, child);
        prevRowExterior = new Dimensions(rowExterior.from, Math.max(child.state.branchExterior.bottom, rowExterior.to));
      }
    }
  }
  applyHorizontalLayout(state, level) {
    const node = level.branchRoot;
    const children = node.children ?? [];
    for (const child of children) {
      LayoutAlgorithm.horizontalLayout(state, child);
    }
    if (node.childCount === 0) {
      return;
    }
    if (this.orientation === 1 /* SingleRowHorizontal */) {
      const width = children[node.state.numberOfSiblings - 1].state.right - children[0].state.left;
      node.state.size = new Size(Math.max(node.state.size.width, width), node.state.size.height);
      const center = (children[0].state.left + children[node.childCount - 1].state.right) / 2;
      LayoutAlgorithm.moveChildrenOnly(state, level, node.state.centerH - center);
      return;
    }
    if (this.orientation === 2 /* SingleColumnVertical */) {
      LayoutAlgorithm.alignHorizontalCenters(state, level, children);
      const diff = node.state.centerH - children[0].state.centerH;
      LayoutAlgorithm.moveChildrenOnly(state, level, diff);
    }
  }
  routeConnectors(_state, _node) {}
}
// src/testing/dotnet-random.ts
var MBIG = 2147483647;
var MSEED = 161803398;

class DotNetRandom {
  #seedArray = new Array(56).fill(0);
  #inext = 0;
  #inextp = 21;
  constructor(seed) {
    const subtraction = seed === -2147483648 ? 2147483647 : Math.abs(seed);
    let mj = MSEED - subtraction;
    this.#seedArray[55] = mj;
    let mk = 1;
    for (let i = 1;i < 55; i++) {
      const ii = 21 * i % 55;
      this.#seedArray[ii] = mk;
      mk = mj - mk;
      if (mk < 0) {
        mk += MBIG;
      }
      mj = this.#seedArray[ii];
    }
    for (let k = 1;k < 5; k++) {
      for (let i = 1;i < 56; i++) {
        this.#seedArray[i] = this.#seedArray[i] - this.#seedArray[1 + (i + 30) % 55];
        if (this.#seedArray[i] < 0) {
          this.#seedArray[i] = this.#seedArray[i] + MBIG;
        }
      }
    }
    this.#inext = 0;
    this.#inextp = 21;
  }
  next(maxValue) {
    if (maxValue === undefined) {
      return this.#internalSample();
    }
    if (maxValue < 0) {
      throw new RangeError("maxValue cannot be negative");
    }
    return Math.trunc(this.#sample() * maxValue);
  }
  #sample() {
    return this.#internalSample() * (1 / MBIG);
  }
  #internalSample() {
    let locINext = this.#inext;
    let locINextp = this.#inextp;
    if (++locINext >= 56) {
      locINext = 1;
    }
    if (++locINextp >= 56) {
      locINextp = 1;
    }
    let retVal = this.#seedArray[locINext] - this.#seedArray[locINextp];
    if (retVal === MBIG) {
      retVal--;
    }
    if (retVal < 0) {
      retVal += MBIG;
    }
    this.#seedArray[locINext] = retVal;
    this.#inext = locINext;
    this.#inextp = locINextp;
    return retVal;
  }
}

// src/testing/test-data.ts
class TestDataSource {
  items = new Map;
  get allDataItemIds() {
    return [...this.items.keys()].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  }
  getParentKey(itemId) {
    const item = this.items.get(itemId);
    if (item == null) {
      throw new Error(`Unknown data id ${itemId}`);
    }
    return item.parentId;
  }
  getDataItem(itemId) {
    const item = this.items.get(itemId);
    if (item == null) {
      throw new Error(`Unknown data id ${itemId}`);
    }
    return item;
  }
}

class TestDataGen {
  generateDataItems(dataSource, count, percentAssistants) {
    for (const item of generateRandomDataItems(count, percentAssistants)) {
      dataSource.items.set(item.id, item);
    }
  }
  static generateBoxSizes(boxContainer) {
    const minWidth = 50;
    const minHeight = 50;
    const widthVariation = 50;
    const heightVariation = 50;
    const random = new DotNetRandom(0);
    for (const box of boxContainer.boxesById.values()) {
      if (!box.isSpecial) {
        box.size = new Size(minWidth + random.next(widthVariation), minHeight + random.next(heightVariation));
      }
    }
  }
}
function generateRandomDataItems(itemCount, percentAssistants) {
  if (itemCount < 0) {
    throw new RangeError("Count must be zero or positive");
  }
  const random = new DotNetRandom(0);
  const items = [];
  for (let i = 0;i < itemCount; i++) {
    items.push({ id: String(i), parentId: null, isAssistant: false });
  }
  let firstInLayer = 1;
  let prevLayerSize = 1;
  while (firstInLayer < itemCount) {
    const layerSize = 15 + prevLayerSize + random.next(prevLayerSize * 2);
    for (let i = firstInLayer;i < firstInLayer + layerSize && i < itemCount; i++) {
      const parentIndex = firstInLayer - 1 - random.next(prevLayerSize);
      items[i].parentId = items[parentIndex].id;
    }
    firstInLayer += layerSize;
    prevLayerSize = layerSize;
  }
  for (let i = 0;i < Math.trunc(items.length / 2); i++) {
    const from = random.next(items.length);
    const to = random.next(items.length);
    const temp = items[from];
    items[from] = items[to];
    items[to] = temp;
  }
  if (percentAssistants > 0) {
    const assistantCount = Math.min(items.length, Math.ceil(items.length * percentAssistants / 100));
    for (let i = 0;i < assistantCount; i++) {
      items[random.next(items.length)].isAssistant = true;
    }
  }
  return items;
}
export {
  BOX_NONE,
  Boundary,
  BoundaryChangedEventArgs,
  BoundaryStep,
  Box,
  BoxContainer,
  BoxTree,
  BranchParentAlignment,
  Connector,
  Diagram,
  DiagramLayoutSettings,
  Dimensions,
  Edge,
  FishboneAssistantsLayoutStrategy,
  LayoutAlgorithm,
  LayoutLevel,
  LayoutOperation,
  LayoutState,
  LayoutStateOperationChangedEventArgs,
  LayoutStrategyBase,
  LinearLayoutStrategy,
  MultiLineFishboneLayoutStrategy,
  MultiLineHangerLayoutStrategy,
  NodeLayoutInfo,
  Point,
  Rect,
  SingleColumnLayoutStrategy,
  Size,
  StackOrientation,
  StackingLayoutStrategy,
  TestDataGen,
  TestDataSource,
  isEqual,
  isMaxValue,
  isMinValue,
  isZero
};
