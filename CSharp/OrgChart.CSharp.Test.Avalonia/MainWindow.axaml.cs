/*
 * Copyright (c) Roman Polunin 2026. 
 * MIT license, see https://opensource.org/licenses/MIT. 
*/
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

using Avalonia.Controls;
using Avalonia.Controls.Shapes;
using Avalonia.Input;
using Avalonia.Interactivity;
using Avalonia.Media;
using Avalonia.Threading;

using OrgChart.CSharp.Test.Avalonia;
using OrgChart.Layout;
using OrgChart.Test;

using Point = Avalonia.Point;

namespace OrgChart.CSharp.Test.Avalonia;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    
        BtnStartWithFullReset.Click += StartWithFullReset_Click;
        BtnStartWithCleanLayout.Click += StartWithCleanLayout_Click;
        BtnProgress.Click += ProgressButton_Click;
    }

    private AutoResetEvent? _progressWaitHandle;
    private IChartDataSource? _dataSource;
    private Diagram? _diagram;
    private ObservableCollection<NodeViewModel>? _nodesForTreeCollection;
    private Stopwatch? _timer;

    private void StartWithFullReset_Click(object? sender, RoutedEventArgs e)
    {
        StartLayout(true);
    }

    public void StartWithCleanLayout_Click(object? sender, RoutedEventArgs e)
    {
        StartLayout(false);
    }

    private void StartLayout(bool resetBoxes)
    {
        TextLayoutTimeElapsed.Text = string.Empty;

        // release any existing progress on background layout
        _progressWaitHandle?.Dispose();
        _progressWaitHandle = new AutoResetEvent(true);

        // re-create source data, diagram and layout data structures
        if (resetBoxes || _diagram == null)
        {
            _dataSource = new TestDataSource();
            new TestDataGen().GenerateDataItems((TestDataSource)_dataSource, 200, 5);

            var boxContainer = new BoxContainer(_dataSource);

            TestDataGen.GenerateBoxSizes(boxContainer);

            foreach (var box in boxContainer.BoxesById.Values)
            {
                if (!box.IsSpecial)
                {
                    box.IsCollapsed = true;
                }
            }
        
            _diagram = new Diagram { Boxes = boxContainer };

            _diagram.LayoutSettings.LayoutStrategies.Add("linear",
                new LinearLayoutStrategy { ParentAlignment = BranchParentAlignment.Center });

            _diagram.LayoutSettings.LayoutStrategies.Add("hanger",
                new MultiLineHangerLayoutStrategy { ParentAlignment = BranchParentAlignment.Center });

            _diagram.LayoutSettings.LayoutStrategies.Add("singleColumn",
                new SingleColumnLayoutStrategy { ParentAlignment = BranchParentAlignment.Left });

            _diagram.LayoutSettings.LayoutStrategies.Add("fishbone1",
                new MultiLineFishboneLayoutStrategy { ParentAlignment = BranchParentAlignment.Center, MaxGroups = 1 });
            _diagram.LayoutSettings.LayoutStrategies.Add("fishbone2",
                new MultiLineFishboneLayoutStrategy { ParentAlignment = BranchParentAlignment.Center, MaxGroups = 2 });
            _diagram.LayoutSettings.LayoutStrategies.Add("hstack1",
                new StackingLayoutStrategy
                {
                    Orientation = StackOrientation.SingleRowHorizontal
                });
            _diagram.LayoutSettings.LayoutStrategies.Add("vstack1",
                new StackingLayoutStrategy
                {
                    Orientation = StackOrientation.SingleColumnVertical
                });

            _diagram.LayoutSettings.LayoutStrategies.Add("assistants",
                new FishboneAssistantsLayoutStrategy { ParentAlignment = BranchParentAlignment.Center });

            _diagram.LayoutSettings.DefaultLayoutStrategyId = "hanger";
            _diagram.LayoutSettings.DefaultAssistantLayoutStrategyId = "assistants";
        }

        var state = new LayoutState(_diagram);
    
        if (CbInteractiveMode.IsChecked.GetValueOrDefault(false))
        {
            state.BoundaryChanged += StateBoundaryChanged;
        }

        state.OperationChanged += StateOperationChanged;
        state.LayoutOptimizerFunc = LayoutOptimizer;

        Task.Factory.StartNew(() =>
            {
                _timer = Stopwatch.StartNew();
                LayoutAlgorithm.Apply(state);
                _timer.Stop();
                Dispatcher.UIThread.InvokeAsync(() => { TextLayoutTimeElapsed.Text = _timer.Elapsed.ToString(); });
            })
            .ContinueWith(
                (prev, s) =>
                {
                    _progressWaitHandle?.Dispose();
                    _progressWaitHandle = null;
                }, null, TaskContinuationOptions.None);
    }

    private void ProgressButton_Click(object? sender, RoutedEventArgs e)
    {
        _progressWaitHandle?.Set();
    }

    private void QuickLayout()
    {
        if (_diagram == null) return;

        var state = new LayoutState(_diagram)
        {
            BoxSizeFunc = dataId => _diagram.Boxes.BoxesByDataId[dataId].Size,
            LayoutOptimizerFunc = LayoutOptimizer
        };

        LayoutAlgorithm.Apply(state);

        RenderBoxes(_diagram.VisualTree, DrawCanvas);
    }

    private string? LayoutOptimizer(BoxTree.Node node)
    {
        return null;
    }

    private void BoxOnDoubleTapped(object? sender, TappedEventArgs e)
    {
        if (sender is not Rectangle shape)
        {
            return;
        }

        if (shape.DataContext is not Box box)
        {
            return;
        }

        box.IsCollapsed = !box.IsCollapsed;
        QuickLayout();
    }

    #region Layout Event Handlers

    private void StateOperationChanged(object? sender, LayoutStateOperationChangedEventArgs args)
    {
        if (args.State.CurrentOperation > LayoutState.Operation.PreprocessVisualTree && _diagram != null)
        {
            Dispatcher.UIThread.InvokeAsync(() => UpdateListView(_diagram.VisualTree));
        }

        if (args.State.CurrentOperation == LayoutState.Operation.Completed && _diagram != null)
        {
            Dispatcher.UIThread.InvokeAsync(() =>
            {
                FireListViewPropertyChanged(_diagram.VisualTree);
                RenderBoxes(_diagram.VisualTree, DrawCanvas);
            });
        }
    }

    private void StateBoundaryChanged(object? sender, BoundaryChangedEventArgs args)
    {
        if (args.State.CurrentOperation > LayoutState.Operation.VerticalLayout && 
            args.State.CurrentOperation < LayoutState.Operation.Completed &&
            _diagram != null)
        {
            Dispatcher.UIThread.InvokeAsync(() =>
            {
                FireListViewPropertyChanged(_diagram.VisualTree);
                RenderBoxes(_diagram.VisualTree, DrawCanvas);
                RenderCurrentBoundary(args, DrawCanvas);
            });

            // wait until user releases the wait handle
            try
            {
                _progressWaitHandle?.WaitOne();
            }
            catch (ObjectDisposedException)
            {
                // silently exit if this wait handle is not longer valid
                args.State.BoundaryChanged -= StateBoundaryChanged;
                args.State.OperationChanged -= StateOperationChanged;
            }
        }
    }

    #endregion

    #region Rendering

    private void UpdateListView(BoxTree visualTree)
    {
        _nodesForTreeCollection = [new NodeViewModel { Node = visualTree.Root }];
        LvBoxes.ItemsSource = _nodesForTreeCollection;
    }

    private void FireListViewPropertyChanged(BoxTree visualTree)
    {
        if (_nodesForTreeCollection != null)
        {
            foreach (var item in _nodesForTreeCollection)
            {
                item.Changed();
            }
        }

        _nodesForTreeCollection = [new NodeViewModel { Node = visualTree.Root }];
        LvBoxes.ItemsSource = _nodesForTreeCollection;
    }

    private static void RenderCurrentBoundary(BoundaryChangedEventArgs args, Canvas drawCanvas)
    {
        var boundary = args.Boundary;
        var top = boundary.BoundingRect.Top;
        if (top.IsMinValue())
        {
            return;
        }

        void render(List<Boundary.Step> steps)
        {
            foreach (var step in steps)
            {
                drawCanvas.Children.Add(new Line
                {
                    StartPoint = new Point(step.X, step.Top),
                    EndPoint = new Point(step.X, step.Bottom),
                    Stroke = Brushes.Red,
                    StrokeThickness = 2
                });
            }
        }

        render(boundary.Left);
        render(boundary.Right);
    }

    private void RenderBoxes(BoxTree visualTree, Canvas drawCanvas)
    {
        drawCanvas.Children.Clear();

        var boundingRect = LayoutAlgorithm.ComputeBranchVisualBoundingRect(visualTree);
        drawCanvas.Width = boundingRect.Size.Width;
        drawCanvas.Height = boundingRect.Size.Height;
        drawCanvas.RenderTransform = new TranslateTransform(-boundingRect.Left, -boundingRect.Top);

        bool renderBox(BoxTree.Node node)
        {
            if (node.Level == 0)
            {
                return true;
            }

            if (node.State.IsHidden)
            {
                return true;
            }

            var box = node.Element;
            var frame = node.State;

            var branchFrameRectangle = new Rectangle
            {
                RenderTransform = new TranslateTransform(node.State.BranchExterior.Left, node.State.BranchExterior.Top),
                Width = node.State.BranchExterior.Size.Width,
                Height = node.State.BranchExterior.Size.Height,
                Stroke = new SolidColorBrush(Colors.Blue, 0.6),
                StrokeThickness = 0.5,
                DataContext = box
            };

            var boxRectangle = new Rectangle
            {
                RenderTransform = new TranslateTransform(frame.Left, frame.Top),
                Width = frame.Size.Width,
                Height = frame.Size.Height,
                Fill = new SolidColorBrush(GetBoxFillColor(node), box.IsSpecial ? 0.1 : 1),
                Stroke = new SolidColorBrush(GetBoxStroke(box), box.IsSpecial ? 0.1 : 1),
                StrokeThickness = 1,
                DataContext = box
            };

            if (!box.IsSpecial)
            {
                boxRectangle.DoubleTapped += BoxOnDoubleTapped;
            }

            drawCanvas.Children.Add(boxRectangle);
            drawCanvas.Children.Add(branchFrameRectangle);

            drawCanvas.Children.Add(new TextBlock
            {
                RenderTransform = new TranslateTransform(frame.Left + 5, frame.Top + 5),
                Text = box.IsSpecial ? "" : TrimText($"{box.Id} ({box.DataId})"),
            });

            if (!box.IsCollapsed && node.State.Connector != null)
            {
                var solidBrush = Brushes.Black;
                foreach (var edge in node.State.Connector.Segments)
                {
                    var line = new Line
                    {
                        StartPoint = new Point(edge.From.X, edge.From.Y),
                        EndPoint = new Point(edge.To.X, edge.To.Y),
                        Stroke = solidBrush,
                        StrokeLineCap = PenLineCap.Round,
                        StrokeThickness = 1,
                    };
                    if (box.IsSpecial)
                    {
                        var len = Math.Max(Math.Abs(line.EndPoint.X - line.StartPoint.X), Math.Abs(line.EndPoint.Y - line.StartPoint.Y));
                        if (len > 2)
                        {
                            line.StrokeDashArray = [2];
                        }
                    }

                    drawCanvas.Children.Add(line);
                }
            }

            return true;
        }

        visualTree.IterateChildFirst(renderBox);
    }

    private static Color GetBoxStroke(Box box)
    {
        return box.IsSpecial ? Colors.DarkGray : Colors.Black;
    }

    private static Color GetBoxFillColor(BoxTree.Node node)
    {
        var box = node.Element;
        return box.IsSpecial
            ? Colors.DarkGray
            : box.IsCollapsed && (
                node.ChildCount > 0
                || (node.AssistantsRoot != null && node.AssistantsRoot.ChildCount > 0))
                ? Colors.BurlyWood
                : Colors.Beige;
    }

    private string TrimText(string? text)
    {
        return text?.Length < 10 ? text ?? string.Empty : string.Concat(text.AsSpan(0, 7), "...");
    }

    #endregion
}
