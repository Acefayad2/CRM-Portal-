"use client"

import React, { type ReactNode } from "react"

type Props = {
  children: ReactNode
  fallback: ReactNode
}

type State = { hasError: boolean }

/** Catches R3F / WebGL errors so the rest of the page (marketing copy, nav) still renders. */
export class WebGLErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn("[WebGL]", error.message)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
