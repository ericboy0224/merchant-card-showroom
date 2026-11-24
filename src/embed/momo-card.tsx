import { createRoot, type Root } from 'react-dom/client'
import { cardCss } from '@/ui/styles'
import { EmbeddedCard } from './EmbeddedCard'

export const TAG_NAME = 'momo-card'

/** `<momo-card card-id="...">`. It renders into a shadow root, so page styles do not leak in. */
export class MomoCardElement extends HTMLElement {
  static observedAttributes = ['card-id']
  #root?: Root

  connectedCallback() {
    if (!this.#root) {
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' })
      const style = document.createElement('style')
      style.textContent = `:host{display:inline-block}${cardCss}`
      const mount = document.createElement('div')
      shadow.append(style, mount)
      this.#root = createRoot(mount)
    }
    this.#render()
  }

  attributeChangedCallback() {
    if (this.#root) this.#render()
  }

  disconnectedCallback() {
    this.#root?.unmount()
    this.#root = undefined
    this.shadowRoot?.replaceChildren()
  }

  #render() {
    const cardId = this.getAttribute('card-id')
    this.#root?.render(cardId ? <EmbeddedCard cardId={cardId} /> : null)
  }
}

export function defineMomoCard(): void {
  if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, MomoCardElement)
}
