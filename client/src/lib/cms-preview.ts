/**
 * Live-preview bridge between /admin/home and the public homepage.
 *
 * The editor renders the real site in an iframe at /?cmsPreview=1 and pushes
 * the unsaved draft over postMessage on every keystroke; the page renders
 * that draft instead of what the API returned. Clicking a section inside the
 * iframe posts back the block id so the editor can open its settings.
 *
 * Only same-origin messages are accepted, and the payload is used purely as
 * render data — nothing from a message is ever executed.
 */
import { useEffect, useState } from "react";
import type { PageContent } from "@shared/home-content";

export const PREVIEW_PARAM = "cmsPreview";
const TO_PREVIEW = "rivers-cms";
const TO_EDITOR = "rivers-cms-preview";

export interface PreviewInbound {
  source: typeof TO_PREVIEW;
  type: "content";
  page: PageContent;
  selectedId?: string | null;
}

export type PreviewOutbound =
  | { source: typeof TO_EDITOR; type: "ready" }
  | { source: typeof TO_EDITOR; type: "select"; id: string }
  | { source: typeof TO_EDITOR; type: "height"; height: number };

export function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get(PREVIEW_PARAM) === "1";
  } catch {
    return false;
  }
}

function postToEditor(message: PreviewOutbound) {
  if (typeof window === "undefined" || window.parent === window) return;
  window.parent.postMessage(message, window.location.origin);
}

/** Ask the editor for its current draft, then track every update it sends. */
export function usePreviewContent(): {
  active: boolean;
  page: PageContent | null;
  selectedId: string | null;
  selectBlock: (id: string) => void;
} {
  const [active] = useState(() => isPreviewMode());
  const [page, setPage] = useState<PageContent | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as PreviewInbound | undefined;
      if (!data || data.source !== TO_PREVIEW || data.type !== "content") return;
      setPage(data.page);
      setSelectedId(data.selectedId ?? null);
    };
    window.addEventListener("message", onMessage);
    postToEditor({ source: TO_EDITOR, type: "ready" });
    return () => window.removeEventListener("message", onMessage);
  }, [active]);

  // Selecting a section in the editor scrolls the preview to it, the same
  // way clicking one in the preview opens its settings.
  useEffect(() => {
    if (!active || !selectedId) return;
    const el = document.querySelector(`[data-cms-block="${CSS.escape(selectedId)}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [active, selectedId]);

  return {
    active,
    page,
    selectedId,
    selectBlock: (id: string) => postToEditor({ source: TO_EDITOR, type: "select", id }),
  };
}
