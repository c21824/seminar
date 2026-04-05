import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    // Keep the log for debugging without crashing the full UI.
    console.error('UI crashed in ErrorBoundary', error)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="mx-auto mt-12 w-[min(92vw,640px)] rounded-2xl border border-danger/30 bg-white p-6 shadow-card">
          <p className="font-heading text-lg font-bold text-textStrong">Something went wrong</p>
          <p className="mt-2 text-sm text-textMuted">
            The app encountered an unexpected issue. Please reload the page.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="btn-primary mt-4"
          >
            Reload
          </button>
        </section>
      )
    }

    return this.props.children
  }
}
