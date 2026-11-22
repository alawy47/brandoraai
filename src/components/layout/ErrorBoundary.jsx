import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error(error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <p className="font-display text-2xl font-semibold">This page failed to load.</p>
        <p className="mt-2 text-mute">{String(this.state.error.message || this.state.error)}</p>
        <button className="mt-6 rounded-xl bg-amethyst px-5 py-2.5 text-white" onClick={() => { this.setState({ error: null }); window.location.reload(); }}>Reload page</button>
      </div>
    );
  }
}
