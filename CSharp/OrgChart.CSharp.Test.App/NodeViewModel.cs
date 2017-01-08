using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using OrgChart.Layout;

namespace OrgChart.CSharp.Test.App
{
    public class NodeViewModel : INotifyPropertyChanged
    {
        private ObservableCollection<NodeViewModel> m_children;
        public BoxTree.Node Node { get; set; }

        public string Text => $"{Node.Element.Id}, ({Node.State.Left},{Node.State.Top}), {Node.State.Size.Width}x{Node.State.Size.Height}";

        public ObservableCollection<NodeViewModel> Children {
            get
            {
                if (m_children == null)
                {
                    m_children = new ObservableCollection<NodeViewModel>();
                    Node.Children?.All(x =>
                    {
                        m_children.Add(new NodeViewModel {Node = x});
                        return true;
                    });
                    if (Node.AssistantsRoot != null)
                    {
                        m_children.Add(new NodeViewModel {Node = Node.AssistantsRoot});
                    }
                }

                return m_children;
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public void Changed()
        {
            OnPropertyChanged("Text");
        }
    }
}