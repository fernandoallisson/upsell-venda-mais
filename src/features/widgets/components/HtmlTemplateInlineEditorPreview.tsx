import { useEffect, useRef } from 'react'
import type { HtmlWidgetTemplate, HtmlWidgetTemplateContent } from '../utils/htmlWidgetTemplateTypes'
import { generateHtmlWidgetTemplateEditablePreviewHtml } from '../utils/htmlWidgetTemplateGenerator'

type Props = {
  template: HtmlWidgetTemplate
  css: string
  content: HtmlWidgetTemplateContent
  fieldOverrides: Record<string, string>
  hiddenElementIds: string[]
  compact?: boolean
  fill?: boolean
  onFieldChange: (fieldId: string, value: string) => void
  onHideElement: (elementId: string) => void
}

const HtmlTemplateInlineEditorPreview = ({
  template,
  css,
  content,
  fieldOverrides,
  hiddenElementIds,
  compact = false,
  fill = false,
  onFieldChange,
  onHideElement,
}: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument
    if (!doc) return

    const html = generateHtmlWidgetTemplateEditablePreviewHtml(template, content, fieldOverrides, hiddenElementIds)

    doc.open()
    doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; min-height: 100%; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; padding: 12px; overflow: hidden; }
  ${css}
  html, body { width: 100%; min-height: 100%; }
  body { margin: 0; overflow: hidden; }
  [data-edit-field-id] {
    cursor: text;
    border-radius: 4px;
    outline: 1px dashed rgba(37, 99, 235, .35);
    outline-offset: 2px;
    transition: background .15s, outline-color .15s;
  }
  [data-edit-field-id]:hover,
  [data-edit-field-id]:focus {
    background: rgba(37, 99, 235, .12);
    outline-color: rgba(37, 99, 235, .85);
  }
  [data-edit-field-id]:focus { box-shadow: 0 0 0 3px rgba(37, 99, 235, .12); }
  [data-hide-element-id] {
    position: relative;
  }
  [data-hide-element-id]:hover {
    box-shadow: 0 0 0 2px rgba(244, 63, 94, .25);
  }
  .inline-editor-toolbar {
    position: fixed;
    z-index: 999999;
    display: none;
    gap: 6px;
    padding: 4px;
    border-radius: 10px;
    background: rgba(15, 23, 42, .94);
    box-shadow: 0 12px 30px rgba(15, 23, 42, .3);
  }
  .inline-editor-toolbar button {
    border: 0;
    border-radius: 8px;
    background: #e11d48;
    color: #fff;
    cursor: pointer;
    font: 700 11px system-ui, -apple-system, sans-serif;
    padding: 7px 10px;
  }
</style>
</head>
<body>${html}<div class="inline-editor-toolbar" id="inlineEditorToolbar"><button type="button" id="inlineEditorHideButton">Ocultar item</button></div></body>
</html>`)
    doc.close()

    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.('a')
      if (anchor) event.preventDefault()
    }

    let activeElementId: string | null = null
    const toolbar = doc.getElementById('inlineEditorToolbar') as HTMLElement | null
    const hideButton = doc.getElementById('inlineEditorHideButton') as HTMLButtonElement | null

    const showToolbar = (target: HTMLElement) => {
      const element = target.closest('[data-hide-element-id]') as HTMLElement | null
      if (!element || !toolbar) return
      activeElementId = element.dataset.hideElementId ?? null
      const rect = element.getBoundingClientRect()
      toolbar.style.display = 'flex'
      toolbar.style.left = `${Math.max(8, Math.min(rect.left, doc.documentElement.clientWidth - 120))}px`
      toolbar.style.top = `${Math.max(8, rect.top - 38)}px`
    }

    const handlePointerOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target || target.closest('#inlineEditorToolbar')) return
      showToolbar(target)
    }

    const handleHide = (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (activeElementId) onHideElement(activeElementId)
    }

    const handleBlur = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null
      const fieldId = target?.dataset?.editFieldId
      if (!fieldId) return
      onFieldChange(fieldId, target.textContent ?? '')
    }

    doc.addEventListener('click', handleClick, true)
    doc.addEventListener('blur', handleBlur, true)
    doc.addEventListener('mouseover', handlePointerOver, true)
    hideButton?.addEventListener('click', handleHide)

    return () => {
      doc.removeEventListener('click', handleClick, true)
      doc.removeEventListener('blur', handleBlur, true)
      doc.removeEventListener('mouseover', handlePointerOver, true)
      hideButton?.removeEventListener('click', handleHide)
    }
  }, [content, css, fieldOverrides, hiddenElementIds, onFieldChange, onHideElement, template])

  return (
    <iframe
      ref={iframeRef}
      title="Editor visual do widget"
      sandbox="allow-same-origin allow-scripts"
      className={`w-full rounded-xl border-0 bg-white ${fill ? 'h-full min-h-[300px]' : compact ? 'h-[210px]' : 'h-[420px]'}`}
    />
  )
}

export default HtmlTemplateInlineEditorPreview
