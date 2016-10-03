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
            new TestDataGen().GenerateDataItems(m_dataSource, 1000);

            var boxContainer = new BoxContainer(m_dataSource);

            TestDataGen.GenerateBoxSizes(boxContainer);

            m_diagram = new Diagram();
            m_diagram.SetBoxes(boxContainer);

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

        private void StateOperationChanged(object sender, LayoutStateOperationChangedEventArgs args)
        {
            if (args.State.CurrentOperation > LayoutState.Operation.Preparing)
            {
                Dispatcher.RunAsync(CoreDispatcherPriority.High, () => UpdateListView(args.State.VisualTree));
            }

            if (args.State.CurrentOperation == LayoutState.Operation.Completed)
            {
                Dispatcher.RunAsync(CoreDispatcherPriority.High, () => RenderBoxes(args, DrawCanvas));
            }
        }

        private void StateBoundaryChanged(object sender, BoundaryChangedEventArgs args)
        {
            if (args.State.CurrentOperation > LayoutState.Operation.VerticalLayout && args.State.CurrentOperation < LayoutState.Operation.Completed)
            {
                Dispatcher.RunAsync(CoreDispatcherPriority.High, () => RenderBoxes(args, DrawCanvas));
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

        private void UpdateListView(Tree<int, Box> visualTree)
        {
            m_nodesForTreeCollection = new ObservableCollection<NodeViewModel>(visualTree.Roots.Select(x => new NodeViewModel {Node = x}));
            LvBoxes.ItemsSource = m_nodesForTreeCollection;
        }

        private static void RenderBoxes([NotNull] BoundaryChangedEventArgs args, [NotNull]Canvas drawCanvas)
        {
            RenderBoxes(args.State, drawCanvas);

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

        private static void RenderBoxes([NotNull] LayoutStateOperationChangedEventArgs args, [NotNull]Canvas drawCanvas)
        {
            RenderBoxes(args.State, drawCanvas);
        }

        private static void RenderBoxes(LayoutState state, Canvas drawCanvas)
        {
            drawCanvas.Children.Clear();

            var left = double.MaxValue;
            var right = double.MinValue;
            var top = double.MaxValue;
            var bottom = double.MinValue;

            foreach (var box in state.Diagram.Boxes.BoxesById.Values)
            {
                var frame = box.Frame;

                left = Math.Min(left, frame.Exterior.TopLeft.X);
                right = Math.Max(right, frame.Exterior.BottomRight.X);
                top = Math.Min(top, frame.Exterior.TopLeft.Y);
                bottom = Math.Max(bottom, frame.Exterior.BottomRight.Y);

                drawCanvas.Children.Add(new Rectangle
                {
                    RenderTransform = new TranslateTransform {X = frame.Exterior.TopLeft.X, Y = frame.Exterior.TopLeft.Y},
                    Width = frame.Exterior.Size.Width,
                    Height = frame.Exterior.Size.Height,
                    Fill = new SolidColorBrush(box.IsAutoGenerated ? Colors.DarkGray : Colors.Beige),
                    Stroke = new SolidColorBrush(Colors.Black),
                    StrokeThickness = 1
                });

                drawCanvas.Children.Add(new TextBlock
                {
                    RenderTransform =
                        new TranslateTransform {X = frame.Exterior.TopLeft.X + 5, Y = frame.Exterior.TopLeft.Y + 5},
                    Width = frame.Exterior.Size.Width,
                    Height = frame.Exterior.Size.Height,
                    Text = box.Id.ToString()
                });
            }

            drawCanvas.Width = right - left;
            drawCanvas.Height = bottom - top;
        }

        private void ProgressButton_Click(object sender, RoutedEventArgs e)
        {
            m_progressWaitHandle?.Set();
        }

        private void DrawCanvas_OnPointerWheelChanged(object sender, PointerRoutedEventArgs e)
        {
            var delta = e.GetCurrentPoint(DrawCanvas).Properties.MouseWheelDelta;

            var transform = DrawCanvas.RenderTransform as ScaleTransform;
            double scale;
            if (transform == null)
            {
                transform = new ScaleTransform();
                scale = 1.0;
            }
            else
            {
                scale = transform.ScaleX;
            }

            scale += delta / 500.0;
            transform.ScaleX = scale;
            transform.ScaleY = scale;

            DrawCanvas.RenderTransform = transform;
        }
    }
}
