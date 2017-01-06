/*
 * Copyright (c) Roman Polunin 2016. 
 * MIT license, see https://opensource.org/licenses/MIT. 
*/
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Windows.UI;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Shapes;
using OrgChart.Annotations;
using OrgChart.Layout;
using OrgChart.Test;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace OrgChart.CSharp.Test.App
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
        }

        private AutoResetEvent m_progressWaitHandle = new AutoResetEvent(false);
        private IChartDataSource m_dataSource;
        private Diagram m_diagram;
        private ObservableCollection<NodeViewModel> m_nodesForTreeCollection;
        private Stopwatch m_timer;

        private void StartWithFullReset_Click(object sender, RoutedEventArgs e)
        {
            StartLayout(true);
        }
        
        public void StartWithCleanLayout_Click(object sender, RoutedEventArgs e)
        {
            StartLayout(false);
        }

        private void StartLayout(bool resetBoxes)
        {
            TextLayoutTimeElapsed.Text = string.Empty;

            // release any existing progress on background layout
            m_progressWaitHandle?.Dispose();
            m_progressWaitHandle = new AutoResetEvent(true);

            // re-create source data, diagram and layout data structures
            if (resetBoxes || m_diagram == null)
            {
                m_dataSource = new TestDataSource();
                new TestDataGen().GenerateDataItems((TestDataSource)m_dataSource, 200);
                //m_dataSource = new DebugDataSource();
                //await ((DebugDataSource)m_dataSource).Load();

                var boxContainer = new BoxContainer(m_dataSource);

                TestDataGen.GenerateBoxSizes(boxContainer);
                //await ((DebugDataSource)m_dataSource).ApplyState(boxContainer);

                foreach (var box in boxContainer.BoxesById.Values)
                {
                    if (!box.IsSpecial)
                    {
                        box.IsCollapsed = true;
                    }
                }
                
                m_diagram = new Diagram {Boxes = boxContainer};

                m_diagram.LayoutSettings.LayoutStrategies.Add("linear",
                    new LinearLayoutStrategy {ParentAlignment = BranchParentAlignment.Center});

                m_diagram.LayoutSettings.LayoutStrategies.Add("hanger",
                    new MultiLineHangerLayoutStrategy {ParentAlignment = BranchParentAlignment.Center });

                m_diagram.LayoutSettings.LayoutStrategies.Add("singleColumn",
                    new SingleColumnLayoutStrategy {ParentAlignment = BranchParentAlignment.Left });

                m_diagram.LayoutSettings.LayoutStrategies.Add("fishbone1",
                    new MultiLineFishboneLayoutStrategy {ParentAlignment = BranchParentAlignment.Center, MaxGroups = 1});
                m_diagram.LayoutSettings.LayoutStrategies.Add("fishbone2",
                    new MultiLineFishboneLayoutStrategy {ParentAlignment = BranchParentAlignment.Center, MaxGroups = 2});
                m_diagram.LayoutSettings.LayoutStrategies.Add("hstack1",
                    new StackingLayoutStrategy
                    {
                        Orientation = StackOrientation.SingleRowHorizontal
                    });
                m_diagram.LayoutSettings.LayoutStrategies.Add("vstack1",
                    new StackingLayoutStrategy
                    {
                        Orientation = StackOrientation.SingleColumnVertical
                    });

                m_diagram.LayoutSettings.LayoutStrategies.Add("assistants",
                    new FishboneAssistantsLayoutStrategy { ParentAlignment = BranchParentAlignment.Center });

                m_diagram.LayoutSettings.DefaultLayoutStrategyId = "hanger";
                m_diagram.LayoutSettings.DefaultAssistantLayoutStrategyId = "assistants";
                m_diagram.LayoutSettings.BranchSpacing = 5;
            }

            var state = new LayoutState(m_diagram);
            
            if (CbInteractiveMode.IsChecked.GetValueOrDefault(false))
            {
                state.BoundaryChanged += StateBoundaryChanged;
            }

            state.OperationChanged += StateOperationChanged;
            state.LayoutOptimizerFunc = LayoutOptimizer;

            Task.Factory.StartNew(() =>
                {
                    m_timer = Stopwatch.StartNew();
                    LayoutAlgorithm.Apply(state);
                    m_timer.Stop();
                    Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () => { TextLayoutTimeElapsed.Text = m_timer.Elapsed.ToString(); });
                })
                .ContinueWith(
                    (prev, s) =>
                    {
                        m_progressWaitHandle.Dispose();
                        m_progressWaitHandle = null;
                    }, null, TaskContinuationOptions.None);
        }

        private void ProgressButton_Click(object sender, RoutedEventArgs e)
        {
            m_progressWaitHandle?.Set();
        }

        private void QuickLayout()
        {
            var state = new LayoutState(m_diagram);
            state.BoxSizeFunc = dataId => m_diagram.Boxes.BoxesByDataId[dataId].Size;
            state.LayoutOptimizerFunc = LayoutOptimizer;

            LayoutAlgorithm.Apply(state);

            RenderBoxes(m_diagram.VisualTree, DrawCanvas);
        }

        private string LayoutOptimizer(BoxTree.TreeNode node)
        {
            if (node.IsAssistantRoot)
            {
                return null;
            }
            return node.Level % 2 == 1 ? "hstack1" : "vstack1";
        }

        private void BoxOnDoubleTapped(object sender, DoubleTappedRoutedEventArgs doubleTappedRoutedEventArgs)
        {
            var shape = (Rectangle) sender;
            var box = (Box) shape.DataContext;
            box.IsCollapsed = !box.IsCollapsed;
            QuickLayout();
        }

        #region Layout Event Handlers

        private void StateOperationChanged(object sender, LayoutStateOperationChangedEventArgs args)
        {
            if (args.State.CurrentOperation > LayoutState.Operation.PreprocessVisualTree)
            {
                Dispatcher.RunAsync(CoreDispatcherPriority.High, () => UpdateListView(m_diagram.VisualTree));
            }

            if (args.State.CurrentOperation == LayoutState.Operation.Completed)
            {
                Dispatcher.RunAsync(CoreDispatcherPriority.High, () =>
                {
                    FireListViewPropertyChanged(m_diagram.VisualTree);
                    RenderBoxes(m_diagram.VisualTree, DrawCanvas);
                });
            }
        }

        private void StateBoundaryChanged(object sender, BoundaryChangedEventArgs args)
        {
            if (args.State.CurrentOperation > LayoutState.Operation.VerticalLayout && args.State.CurrentOperation < LayoutState.Operation.Completed)
            {
                Dispatcher.RunAsync(CoreDispatcherPriority.High, () =>
                 {
                     FireListViewPropertyChanged(m_diagram.VisualTree);
                     RenderBoxes(m_diagram.VisualTree, DrawCanvas);
                     RenderCurrentBoundary(args, DrawCanvas);
                 });

                // wait until user releases the wait handle
                try
                {
                    m_progressWaitHandle?.WaitOne();
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
            m_nodesForTreeCollection = new ObservableCollection<NodeViewModel>(visualTree.Roots.Select(x => new NodeViewModel {Node = x}));
            LvBoxes.ItemsSource = m_nodesForTreeCollection;
        }

        private void FireListViewPropertyChanged(BoxTree visualTree)
        {
            if (m_nodesForTreeCollection != null)
            {
                foreach (var item in m_nodesForTreeCollection)
                {
                    item.Changed();
                }
            }
            m_nodesForTreeCollection = new ObservableCollection<NodeViewModel>(visualTree.Roots.Select(x => new NodeViewModel {Node = x}));
            LvBoxes.ItemsSource = m_nodesForTreeCollection;
        }

        private static void RenderCurrentBoundary([NotNull] BoundaryChangedEventArgs args, [NotNull]Canvas drawCanvas)
        {
            var boundary = args.Boundary;
            var top = boundary.BoundingRect.Top;
            if (top.IsMinValue())
            {
                return;
            }

            Action<List<Boundary.Step>> render = steps =>
            {
                foreach (var step in steps)
                {
                    drawCanvas.Children.Add(new Line
                    {
                        X1 = step.X,
                        Y1 = step.Top,
                        X2 = step.X,
                        Y2 = step.Bottom,
                        Stroke = new SolidColorBrush(Colors.Red),
                        StrokeThickness = 2
                    });
                }
            };

            render(boundary.Left);
            render(boundary.Right);
        }

        private void RenderBoxes(BoxTree visualTree, Canvas drawCanvas)
        {
            drawCanvas.Children.Clear();

            var boundingRect = LayoutAlgorithm.ComputeBranchVisualBoundingRect(visualTree);
            drawCanvas.Width = boundingRect.Size.Width;
            drawCanvas.Height = boundingRect.Size.Height;
            drawCanvas.RenderTransform = new TranslateTransform
            {
                X = -boundingRect.Left,
                Y = -boundingRect.Top
            };

            Func<BoxTree.TreeNode, bool> renderBox = node =>
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
                    RenderTransform =
                        new TranslateTransform {X = node.State.BranchExterior.Left, Y = node.State.BranchExterior.Top},
                    Width = node.State.BranchExterior.Size.Width,
                    Height = node.State.BranchExterior.Size.Height,
                    Stroke = new SolidColorBrush(Colors.Blue) { Opacity = 0.6 },
                    StrokeThickness = 0.5,
                    DataContext = box
                };

                var boxRectangle = new Rectangle
                {
                    RenderTransform =
                        new TranslateTransform {X = frame.Left, Y = frame.Top},
                    Width = frame.Size.Width,
                    Height = frame.Size.Height,
                    Fill = new SolidColorBrush(GetBoxFillColor(node))
                    {
                        Opacity = box.IsSpecial ? 0.1 : 1
                    },
                    Stroke = new SolidColorBrush(GetBoxStroke(box))
                    {
                        Opacity = box.IsSpecial ? 0.1 : 1
                    },
                    IsHitTestVisible = !box.IsSpecial,
                    StrokeThickness = 1,
                    DataContext = box
                };

                boxRectangle.DoubleTapped += BoxOnDoubleTapped;

                drawCanvas.Children.Add(boxRectangle);
                drawCanvas.Children.Add(branchFrameRectangle);

                drawCanvas.Children.Add(new TextBlock
                {
                    RenderTransform =
                        new TranslateTransform {X = frame.Left + 5, Y = frame.Top + 5},
                    Width = double.NaN,
                    Height = double.NaN,
                    Text = box.IsSpecial ? "" : TrimText($"{box.Id} ({box.DataId})"),
                    IsHitTestVisible = false
                });

                if (!box.IsCollapsed && node.State.Connector != null)
                {
                    var solidBrush = new SolidColorBrush(Colors.Black);
                    foreach (var edge in node.State.Connector.Segments)
                    {
                        var line = new Line
                        {
                            X1 = edge.From.X,
                            Y1 = edge.From.Y,
                            X2 = edge.To.X,
                            Y2 = edge.To.Y,
                            Stroke = solidBrush,
                            StrokeEndLineCap = PenLineCap.Round,
                            StrokeThickness = 1,
                            IsHitTestVisible = false
                        };
                        if (box.IsSpecial)
                        {
                            var len = Math.Max(Math.Abs(line.X2 - line.X1), Math.Abs(line.Y2 - line.Y1));
                            if (len > 2)
                            {
                                line.StrokeDashArray = new DoubleCollection {2};
                            }
                        }
                        drawCanvas.Children.Add(line);
                    }
                }

                return true;
            };

            visualTree.IterateChildFirst(renderBox);
        }

        private static Color GetBoxStroke(Box box)
        {
            return box.IsSpecial ? Colors.DarkGray : Colors.Black;
        }

        private static Color GetBoxFillColor(BoxTree.TreeNode node)
        {
            var box = node.Element;
            return box.IsSpecial
                ? Colors.DarkGray
                : box.IsCollapsed && (
                    node.ChildCount > 0
                    || node.AssistantsRoot != null
                    && node.AssistantsRoot.ChildCount > 0)
                    ? Colors.BurlyWood
                    : Colors.Beige;
        }

        private string TrimText(string text)
        {
            if (text?.Length < 10)
            {
                return text;
            }
            return text.Substring(0, 7) + "...";
        }

        #endregion
    }
}
