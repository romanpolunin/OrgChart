using System.Collections.ObjectModel;
using System.Linq;
using Staffer.OrgChart.Layout;

namespace Staffer.OrgChart.CSharp.Test.App
{
    public class NodeViewModel
    {
        private ObservableCollection<NodeViewModel> m_children;
        public BoxTree.TreeNode Node { get; set; }

        public string Text => Node.Element.Id.ToString();

        public ObservableCollection<NodeViewModel> Children {
            get
            {
                return m_children ?? (m_children = Node.Children == null
                    ? new ObservableCollection<NodeViewModel>()
                    : new ObservableCollection<NodeViewModel>(Node.Children.Select(x => new NodeViewModel {Node = x})));
            }
        }
    }
}