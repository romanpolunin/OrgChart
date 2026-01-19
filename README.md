# OrgChart

## Overview


A fast, robust and easily extensible organization chart layout library without any 3-rd party dependencies.
Designed specifically for arrangement of rectangular boxes and connectors, 
for use by applications which represent hierarchical organizational structures in a user-friendly manner.

Supports combining arbitrary layout styles with some available out of the box and with open interfaces for extension/new styles, 
special layout rules for assistants, expand-collapse operations, pluggable box rendering algorithms. 
All calculations made using double-precision coordinates.

Available in C# and JavaScript (JS code is generated from C# using Bridge.Net).
All code (including C# -> JS converter) is in one Visual Studio solution.
C# version has advanced demo and debugging tool built on top of OrgChart as a Windows Universal application, 
that helps to visualize and debug layout computation process step-by-step.

JavaScript demo page generates a 200-box chart and renders it into a collection of pure HTML/div objects 
with absolute coordinates as computed by OrgChart library - you can build rich HTML5 user interfaces the way your users want it.

Use OrgChart if you need to:

- Render rich interactive organizational charts in a cross-browser HTML5/CSS/JS client application, with your very own data adapters.
- Implement advanced organizational charting UI in a native client Windows Forms, WPF, Universal, Xamarin application.
- Render organizational charts in a .NET or JavaScript-based server application, for reporting or exporting purposes.
- Implement and debug custom layout strategies and layout optimization behavior with minimal effort in C#, then instantly port them to JavaScript.

## Author and license

(c) Roman Polunin 2016, MIT license. See https://opensource.org/licenses/MIT.

Copyright 2016 Roman Polunin.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Advantages

Absolutely free to use and modify in all types of applications, in source code and binary form.

Supports very sophisticated layout rules, supports assistants and multiple visual roots, step-by-step visualization of layout for debugging, produces double-precision coordinates and rich supplementary layout information.

Exactly same code is available both in C# and JavaScript, compiles to .NET 2.0 and 4.0, .NET Core, UWP, Silverlight etc. 
Look into the .NET 10 desktop demo application for UI-based layout visualizer on Mac and Windows, built with Avalonia.

JavaScript code is generated automatically using Bridge.Net (it's been dead for a while, but there's H5 project as its direct new incarnation).

As non-intrusive as possible, you can have your data structured and rendered in any way you want.

Does not force you into any specific rendering technique/framework - use existing or implement your own.

Rich API for extensibility, supports development of custom layout strategies.

## Notes on C# language compatibility

For JScript conversion using in Bridge.NET, the layout code had to be implemented using C# 7.x, which is very, very old.
As long as you don't need Bridge.NET, there is nothing preventing you from upgrading the code using C# refactoring tools. 

## Usage: JavaScript

Converted JS libraries are under $\JScript\OrgChart.Layout.JScript.Bridge\Bridge\output.

See [advanced demo page (multiple layout strategies, rendering, expand/collapse)](https://romanpolunin.github.io/OrgChart/www/demo.html).

If you modify C# code and want to update JS, just re-build OrgChart.Layout.JScript.Bridge project from solution.

Also, there's now a great TypeScript/React project based on this source code, converted from C#.

https://awesome-react-org-chart.vercel.app/example.html

## Usage: C# #

#### To compute chart "fresh" [see C# sample application](https://github.com/romanpolunin/OrgChart/blob/master/CSharp/OrgChart.CSharp.Test.Avalonia/MainWindow.axaml.cs):

1. Either import source code or plug in this NuGet package: http://www.nuget.org/packages/RomanPolunin.OrgChart.Net/
2. Implement two adapter interfaces: `IChartDataSource` and `IChartDataItem`.
3. Create an object of type `BoxContainer` supplying your IChartDataSource. BoxContainer will produce a set of Box objects, one per IChartDataItem. It will also add one special box (`SystemRoot`) - to support multiple visible roots in the diagram.
4. Either manually apply sizes on each Box (`Box.Size` property), or implement a callback function on `LayoutState` (see step 6). This depends on how and when you do rendering.
5. Create an object of type `Diagram` and populate properties `LayoutSettings`, `DefaultLayoutStrategyId` and `DefaultAssistantsLayoutStrategyId`.
6. Create an object of type LayoutState, optionally give it a callback function for box size, invoke `LayoutAlgorithm.Apply` on that state object.
7. Consume computed coordinates from `Diagram.VisualTree`.

#### To re-compute layout after having some `Box.IsCollapsed` set to true, or some `Box.Size` property modified:

1. Create a LayoutState object, invoke LayoutAlgorithm.Apply on it.
2. Consume computed coordinates from Diagram.VisualTree.

LayoutAlgorithm.Apply will create a visual tree of BoxTree.Node objects that have all computed coordinates,
available through VisualTree property of the Diagram object you created and supplied into LayoutAlgorithm.Apply. 
LayoutAlgorithm.Apply computes both coordinates of BoxTree.Node objects and connectors between them.

### Box and its properties

Boxes serve four purposes:

- **rendering** and content measurements. Rendering is a very different task from computing box's coordinates on screen and routing connectors. You might want to have some rich content, interactive UI etc. Also, the only way to know the size of a visual element in most UI frameworks is to render it - this is when all text sizes are measured and styles applied.
- support **data binding** for rendering.
- manage **expand/collapse** state: boxes are a natural place to store "is collapsed" state, because they survive layout runs.
- support **layout optimizations** by customizing layout strategies on box level: you can design and implement rules to assign layout strategies on each individual box to make corresponding branches taller, wider, more compact, increase or decrease spacing etc. OrgChart library supports **defaults** and **inherited settings**, but you can get very specific when needed. 

Most `Box` objects are automatically generated for each individual instance of `IChartDataItem` coming from your `IChartDataSource`. These boxes are called **data-bound** and have `Box.IsDataBound` property return true. All data-bound boxes should be stored in the `BoxContainer`.

While most boxes will be generated from your data, some others will be generated and handled by the algorithm. Such boxes will have their `DataId` set to null, `IsSpecial` set to true, their `Id` set to `Box.None` and they should not ever be added to `BoxContainer` (except BoxContainer.SystemRoot). They will only be referenced by `TreeNode.Element` property and live until chart layout is re-computed.

Properties of the Box:

- `LayoutStrategyId`: to explicitly assign a layout strategy to a specific box.
- `DataId`: identifier of the IChartDataItem used to create this Box.
- `Id`: identifier of this Box in its parent BoxContainer.
- `Size`: width and height of this box, as you want it to be. You only have to supply the size for data-bound boxes (generated from IChartDataSource).
- `IsCollapsed` flag: set it to true if you want corresponding chart node to be collapsed, hiding all children.
- `IsAssistant` flag: set it to true if you want corresponding chart node to be laid out using special assistant rule (visually separates from other normal children).
- `IsSpecial` flag: is automatically set to true on boxes auto-generated by the algorithm. 

BoxContainer will only store one special box for the SystemRoot. Other special boxes only exist within the generated visual tree.

Diagram.VisualTree is a tree of BoxTree.Node objects joined into a navigable tree structure.
Each node is a visual object on a diagram. Some of the nodes represent real data-bound boxes, some others are generated for layout purposes (spacers).

Properties of the BoxTree.Node:

- `Element`: reference to corresponding Box, which might be either data bound or auto-generated ("special").
- `AssistantsRoot`: a node to separate children with `IsAssistant` flag set to true, along with their connectors. Supports seamless re-use of layout algorithms and separation of regular and assistant layout strategies. 
- `State`: instance of NodeLayoutInfo class, holds computed coordinates and flags.
- `Children`: collection of child nodes.

Properties of NodeLayoutInfo (access via `BoxTree.Node.State`):

- `EffectiveLayoutStrategy` reference, inferred from parent node or from explicit `LayoutStrategyId` on the bound Box. May also be supplied by your very own delegate specified by `LayoutState.LayoutOptimizerFunc`.
- potentially modified `Size` of the data-bound Box bound to it (or auto-generated for special Nodes/Boxes). Sometimes the size of the node will be different from the size of the associated box - depends on layout strategy. 
- calculated `TopLeft` position of the box rectangle.
- calculated `BranchExterior` - bounding rectangle of this node with all its children and spacers.
- `Connector`, a collection of `Edge` objects that define visible connectors.
