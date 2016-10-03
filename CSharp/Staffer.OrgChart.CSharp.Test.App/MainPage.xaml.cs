using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using Windows.UI.Xaml.Shapes;
using Staffer.OrgChart.CSharp.Test.Layout;
using Staffer.OrgChart.Layout.CSharp;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace Staffer.OrgChart.CSharp.Test.App
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
        private TestDataSource m_dataSource;
        private Diagram m_diagram;
        private ObservableCollection<NodeViewModel> m_nodesForTreeCollection;

        private void StartButton_Click(object sender, RoutedEventArgs e)
        {
            // release any existing progress on background layout
            m_progressWaitHandle?.Dispose();
            m_progressWaitHandle = new AutoResetEvent(true);

            // re-create source data, diagram and layout data structures
            m_dataSource = new TestDataSource();
            new TestDataGen().GenerateDataItems(m_dataSource, 20);

            var boxContainer = new BoxContainer(m_dataSource);

            TestDataGen.GenerateBoxSizes(boxContainer);

            m_diagram = new Diagram {Boxes = boxContainer};

            m_diagram.LayoutSettings.LayoutStrategies.Add("default", new LinearLayoutStrategy { ParentAlignment = BranchParentAlignment.Center});
            m_diagram.LayoutSettings.DefaultLayoutStrategyId = "default";

            var state = new LayoutState(m_diagram);
            state.BoxSizeFunc = dataId => boxContainer.BoxesByDataId[dataId].Frame.Exterior.Size;

            if (CbInteractiveMode.IsChecked.GetValueOrDefault(false))
            {
                state.BoundaryChanged += StateBoundaryChanged;
            }

            state.OperationChanged += StateOperationChanged;

            Task.Factory.StartNew(() =>
            {
                try
                {
                    LayoutAlgorithm.Apply(state);
                }
                finally
                {
                    m_progressWaitHandle.Dispose();
                    m_progressWaitHandle = null;
                }
            });
        }

        private void QuickLayout()
        {
            var state = new LayoutState(m_diagram);
            state.BoxSizeFunc = dataId => m_diagram.Boxes.BoxesByDataId[dataId].Frame.Exterior.Size;

            LayoutAlgorithm.Apply(state);

            RenderBoxes(m_diagram.VisualTree, DrawCanvas);
        }

        private void ProgressButton_Click(object sender, RoutedEventArgs e)
        {
            m_progressWaitHandle?.Set();
        }

        private void ScrollerView_OnDoubleTapped(object sender, DoubleTappedRoutedEventArgs e)
        {
            m_diagram.Boxes.BoxesById[5].IsCollapsed = !m_diagram.Boxes.BoxesById[5].IsCollapsed;
            RenderBoxes(m_diagram.VisualTree, DrawCanvas);
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
            if (args.State.CurrentOperation > LayoutState.Operation.Preparing)
            {
                Dispatcher.RunAsync(CoreDispatcherPriority.High, () => UpdateListView(args.State.VisualTree));
            }

            if (args.State.CurrentOperation == LayoutState.Operation.Completed)
            {
                Dispatcher.RunAsync(CoreDispatcherPriority.High, () => RenderBoxes(args.State.VisualTree, DrawCanvas));
            }
        }

        private void StateBoundaryChanged(object sender, BoundaryChangedEventArgs args)
        {
            if (args.State.CurrentOperation > LayoutState.Operation.VerticalLayout && args.State.CurrentOperation < LayoutState.Operation.Completed)
            {
                Dispatcher.RunAsync(CoreDispatcherPriority.High, () =>
                {
                    RenderBoxes(args.State.VisualTree, DrawCanvas);
                    RenderCurrentBoundary(args, DrawCanvas);
                });

                // wait until user releases the wait handle
                try
                {
                    m_progressWaitHandle.WaitOne();
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

        private void UpdateListView(Tree<int, Box> visualTree)
        {
            m_nodesForTreeCollection = new ObservableCollection<NodeViewModel>(visualTree.Roots.Select(x => new NodeViewModel {Node = x}));
            LvBoxes.ItemsSource = m_nodesForTreeCollection;
        }

        private static void RenderCurrentBoundary([NotNull] BoundaryChangedEventArgs args, [NotNull]Canvas drawCanvas)
        {
            var boundary = args.Boundary;
            for (var i = 0; i < boundary.Left.Count; i++)
            {
                var step = boundary.Left[i];
                if (step.BoxId != Box.None)
                    drawCanvas.Children.Add(new Line
                    {
                        X1 = step.X,
                        Y1 = boundary.Top + i*args.State.Diagram.LayoutSettings.Resolution,
                        X2 = step.X,
                        Y2 = boundary.Top + (i + 1)*args.State.Diagram.LayoutSettings.Resolution,
                        Stroke = new SolidColorBrush(Colors.Red),
                        StrokeThickness = 2
                    });

                step = boundary.Right[i];
                if (step.BoxId != Box.None)
                    drawCanvas.Children.Add(new Line
                    {
                        X1 = step.X,
                        Y1 = boundary.Top + i*args.State.Diagram.LayoutSettings.Resolution,
                        X2 = step.X,
                        Y2 = boundary.Top + (i + 1)*args.State.Diagram.LayoutSettings.Resolution,
                        Stroke = new SolidColorBrush(Colors.Red),
                        StrokeThickness = 2
                    });
            }
        }

        private void RenderBoxes(Tree<int, Box> visualTree, Canvas drawCanvas)
        {
            drawCanvas.Children.Clear();

            var left = double.MaxValue;
            var right = double.MinValue;
            var top = double.MaxValue;
            var bottom = double.MinValue;

            Func<Tree<int, Box>.TreeNode, bool> renderBox = node =>
            {
                var box = node.Element;
                var frame = box.Frame;

                left = Math.Min(left, frame.Exterior.TopLeft.X);
                right = Math.Max(right, frame.Exterior.BottomRight.X);
                top = Math.Min(top, frame.Exterior.TopLeft.Y);
                bottom = Math.Max(bottom, frame.Exterior.BottomRight.Y);

                var visualRectangle = new Rectangle
                {
                    RenderTransform =
                        new TranslateTransform {X = frame.Exterior.TopLeft.X, Y = frame.Exterior.TopLeft.Y},
                    Width = frame.Exterior.Size.Width,
                    Height = frame.Exterior.Size.Height,
                    Fill = new SolidColorBrush(box.IsAutoGenerated ? Colors.DarkGray : Colors.Beige),
                    Stroke = new SolidColorBrush(Colors.Black),
                    StrokeThickness = 1,
                    DataContext = box
                };

                visualRectangle.DoubleTapped += BoxOnDoubleTapped;

                drawCanvas.Children.Add(visualRectangle);

                drawCanvas.Children.Add(new TextBlock
                {
                    RenderTransform =
                        new TranslateTransform {X = frame.Exterior.TopLeft.X + 5, Y = frame.Exterior.TopLeft.Y + 5},
                    Width = double.NaN,
                    Height = double.NaN,
                    Text = box.Id.ToString(),
                    IsHitTestVisible = false
                });

                if (!box.IsCollapsed && box.Frame.Connector != null)
                {
                    foreach (var edge in box.Frame.Connector.Segments)
                    {
                        drawCanvas.Children.Add(new Line
                        {
                            X1 = edge.From.X,
                            Y1 = edge.From.Y,
                            X2 = edge.To.X,
                            Y2 = edge.To.Y,
                            Stroke = new SolidColorBrush(Colors.Black),
                            StrokeThickness = 1,
                            IsHitTestVisible = false
                        });
                    }
                }

                return !box.IsCollapsed;
            };

            visualTree.IterateParentFirst(renderBox);

            drawCanvas.Width = right - left;
            drawCanvas.Height = bottom - top;
        }

        #endregion
    }
}
