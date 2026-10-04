import { describe, expect, test } from "bun:test";
import { Boundary } from "../src/boundary";
import { BoxContainer } from "../src/box-container";
import { BranchParentAlignment } from "../src/layout-strategy";
import { Diagram } from "../src/diagram";
import { Size } from "../src/geometry";
import { LayoutAlgorithm } from "../src/layout-algorithm";
import { LayoutState } from "../src/layout-state";
import { FishboneAssistantsLayoutStrategy } from "../src/strategies/fishbone-assistants-layout-strategy";
import { LinearLayoutStrategy } from "../src/strategies/linear-layout-strategy";
import { MultiLineFishboneLayoutStrategy } from "../src/strategies/multi-line-fishbone-layout-strategy";
import { MultiLineHangerLayoutStrategy } from "../src/strategies/multi-line-hanger-layout-strategy";
import { SingleColumnLayoutStrategy } from "../src/strategies/single-column-layout-strategy";
import { StackingLayoutStrategy } from "../src/strategies/stacking-layout-strategy";
import { StackOrientation } from "../src/layout-strategy";
import { DotNetRandom } from "../src/testing/dotnet-random";
import { TestDataGen, TestDataSource } from "../src/testing/test-data";

Boundary.validate = true;

describe("layout", () => {
  test("seeded random matches the first values from System.Random(0)", () => {
    const random = new DotNetRandom(0);
    const values = Array.from({ length: 8 }, () => random.next());
    expect(values).toEqual([
      1559595546, 1755192844, 1649316166, 1198642031, 442452829, 1200195957, 1945678308, 949569752,
    ]);
    const bounded = new DotNetRandom(0);
    expect(Array.from({ length: 5 }, () => bounded.next(50))).toEqual([36, 40, 38, 27, 10]);
  });

  test("every strategy lays out a chart with assistants", () => {
    for (const mode of ["linear", "hanger2", "hanger4", "fishbone1", "fishbone2", "column-left", "column-right", "stackers"] as const) {
      const { diagram } = build(36, 15, mode);
      const state = new LayoutState(diagram);
      state.layoutOptimizerFunc = (node) => (node.isAssistantRoot ? null : mode === "stackers" ? "hstack" : mode);
      LayoutAlgorithm.apply(state);
      assertLaidOut(diagram);
    }
  });

  test("a hand-built chart matches the C# coordinates", () => {
    const source = new TestDataSource();
    const add = (id: string, parentId: string | null, isAssistant: boolean) => {
      source.items.set(id, { id, parentId, isAssistant });
    };
    add("0", null, false);
    add("1", "0", false);
    add("2", "0", true);
    add("3", "1", false);
    add("4", "1", false);
    add("5", "1", false);
    add("6", "1", false);
    add("7", "1", true);
    add("8", "3", false);
    const { diagram } = build(0, 0, "linear");
    diagram.boxes = new BoxContainer(source);
    for (const [id, width, height] of [
      ["0", 120, 48],
      ["1", 100, 40],
      ["2", 90, 36],
      ["3", 80, 40],
      ["4", 70, 44],
      ["5", 110, 36],
      ["6", 60, 50],
      ["7", 84, 32],
      ["8", 76, 40],
    ] as const) {
      diagram.boxes.boxesByDataId.get(id)!.size = new Size(width, height);
    }
    diagram.layoutSettings.branchSpacing = 48;
    const laid = run(diagram, "linear");
    const byId = new Map(laid.signature.map((line) => [line.slice(0, line.indexOf(":")), line.slice(line.indexOf(":") + 1)]));
    expect(byId).toEqual(
      new Map([
        ["0", "0.000,20.000,120.000,48.000"],
        ["1", "10.000,144.000,100.000,40.000"],
        ["2", "-55.000,88.000,90.000,36.000"],
        ["3", "-135.000,256.000,80.000,40.000"],
        ["4", "-35.000,256.000,70.000,44.000"],
        ["5", "55.000,256.000,110.000,36.000"],
        ["6", "185.000,256.000,60.000,50.000"],
        ["7", "-49.000,204.000,84.000,32.000"],
        ["8", "-133.000,326.000,76.000,40.000"],
      ]),
    );
  });

  test("collapsing a box hides its descendants and a second run matches", () => {
    const { diagram } = build(24, 10, "hanger4");
    const first = run(diagram, "hanger4");
    const box = [...diagram.boxes.boxesByDataId.values()].find((item) => item.dataId === "4");
    expect(box).toBeDefined();
    box!.isCollapsed = true;
    const second = run(diagram, "hanger4");
    expect(second.visible).toBeLessThan(first.visible);
    const third = run(diagram, "hanger4");
    expect(third.signature).toEqual(second.signature);
  });
});

function build(count: number, assistants: number, mode: string) {
  const source = new TestDataSource();
  new TestDataGen().generateDataItems(source, count, assistants);
  const boxes = new BoxContainer(source);
  TestDataGen.generateBoxSizes(boxes);
  const diagram = new Diagram();
  diagram.boxes = boxes;
  const linear = new LinearLayoutStrategy();
  linear.parentAlignment = BranchParentAlignment.Center;
  diagram.layoutSettings.layoutStrategies.set("linear", linear);

  const hanger2 = new MultiLineHangerLayoutStrategy();
  hanger2.parentAlignment = BranchParentAlignment.Center;
  hanger2.maxSiblingsPerRow = 2;
  diagram.layoutSettings.layoutStrategies.set("hanger2", hanger2);

  const hanger4 = new MultiLineHangerLayoutStrategy();
  hanger4.parentAlignment = BranchParentAlignment.Center;
  hanger4.maxSiblingsPerRow = 4;
  diagram.layoutSettings.layoutStrategies.set("hanger4", hanger4);

  const fishbone1 = new MultiLineFishboneLayoutStrategy();
  fishbone1.parentAlignment = BranchParentAlignment.Center;
  fishbone1.maxGroups = 1;
  diagram.layoutSettings.layoutStrategies.set("fishbone1", fishbone1);

  const fishbone2 = new MultiLineFishboneLayoutStrategy();
  fishbone2.parentAlignment = BranchParentAlignment.Center;
  fishbone2.maxGroups = 2;
  diagram.layoutSettings.layoutStrategies.set("fishbone2", fishbone2);

  const columnLeft = new SingleColumnLayoutStrategy();
  columnLeft.parentAlignment = BranchParentAlignment.Left;
  diagram.layoutSettings.layoutStrategies.set("column-left", columnLeft);

  const columnRight = new SingleColumnLayoutStrategy();
  columnRight.parentAlignment = BranchParentAlignment.Right;
  diagram.layoutSettings.layoutStrategies.set("column-right", columnRight);

  const hstack = new StackingLayoutStrategy();
  hstack.orientation = StackOrientation.SingleRowHorizontal;
  diagram.layoutSettings.layoutStrategies.set("hstack", hstack);

  const assistantsStrategy = new FishboneAssistantsLayoutStrategy();
  assistantsStrategy.parentAlignment = BranchParentAlignment.Center;
  diagram.layoutSettings.layoutStrategies.set("assistants", assistantsStrategy);
  diagram.layoutSettings.defaultLayoutStrategyId = mode === "stackers" ? "hstack" : mode;
  diagram.layoutSettings.defaultAssistantLayoutStrategyId = "assistants";
  return { diagram };
}

function run(diagram: Diagram, mode: string) {
  const state = new LayoutState(diagram);
  state.layoutOptimizerFunc = (node) => (node.isAssistantRoot ? null : mode);
  LayoutAlgorithm.apply(state);
  return assertLaidOut(diagram);
}

function assertLaidOut(diagram: Diagram) {
  const tree = diagram.visualTree;
  expect(tree).not.toBeNull();
  const bounds = LayoutAlgorithm.computeBranchVisualBoundingRect(tree!);
  expect(Number.isFinite(bounds.size.width)).toBe(true);
  expect(Number.isFinite(bounds.size.height)).toBe(true);
  let visible = 0;
  const signature: string[] = [];
  tree!.iterateParentFirst((node) => {
    if (node.state.isHidden) {
      return false;
    }
    expect(Number.isFinite(node.state.left)).toBe(true);
    expect(Number.isFinite(node.state.top)).toBe(true);
    if (node.element.isDataBound) {
      visible++;
      expect(node.state.left).toBeGreaterThanOrEqual(bounds.left - 0.001);
      expect(node.state.top).toBeGreaterThanOrEqual(bounds.top - 0.001);
      expect(node.state.right).toBeLessThanOrEqual(bounds.right + 0.001);
      expect(node.state.bottom).toBeLessThanOrEqual(bounds.bottom + 0.001);
      signature.push(
        `${node.element.dataId}:${node.state.left.toFixed(3)},${node.state.top.toFixed(3)},${node.state.size.width.toFixed(3)},${node.state.size.height.toFixed(3)}`,
      );
    }
    if (node.state.connector != null) {
      expect(node.state.connector.segments.length).toBeGreaterThan(0);
      for (const edge of node.state.connector.segments) {
        expect(edge).toBeDefined();
        expect(Number.isFinite(edge.from.x + edge.to.y)).toBe(true);
      }
    }
    return true;
  });
  expect(visible).toBeGreaterThan(0);
  return { visible, signature };
}
