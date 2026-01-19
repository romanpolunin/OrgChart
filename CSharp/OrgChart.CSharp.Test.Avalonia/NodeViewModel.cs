using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;

using OrgChart.Layout;

namespace OrgChart.CSharp.Test.Avalonia;

public class NodeViewModel : INotifyPropertyChanged
{
    public BoxTree.Node? Node { get; set; }

    public string Text => Node != null 
        ? $"{Node.Element.Id}, ({Node.State.Left},{Node.State.Top}), {Node.State.Size.Width}x{Node.State.Size.Height}"
        : string.Empty;

    public ObservableCollection<NodeViewModel> Children
    {
        get
        {
            if (field == null && Node != null)
            {
                field = [];
                Node.Children?.All(x =>
                {
                    field.Add(new NodeViewModel { Node = x });
                    return true;
                });
                if (Node.AssistantsRoot != null)
                {
                    field.Add(new NodeViewModel { Node = Node.AssistantsRoot });
                }
            }

            return field ?? [];
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    public void Changed()
    {
        OnPropertyChanged(nameof(Text));
    }
}
