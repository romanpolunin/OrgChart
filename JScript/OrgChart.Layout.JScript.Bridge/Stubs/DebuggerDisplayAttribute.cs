namespace System.Diagnostics
{
    public class DebuggerDisplayAttribute : Attribute
    {
        public DebuggerDisplayAttribute(string template)
        {
        }
    }
}

namespace System.Runtime.CompilerServices
{
    public class MethodImplAttribute : Attribute
    {
        private MethodImplOptions m_options;

        public MethodImplAttribute(MethodImplOptions aggressiveInlining)
        {
            this.m_options = aggressiveInlining;
        }
    }

    public enum MethodImplOptions
    {
        AggressiveInlining
    }
}
