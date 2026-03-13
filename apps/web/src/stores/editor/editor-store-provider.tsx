"use client";

import { createContext, useContext, useRef } from "react";
import type { TemporalState } from "zundo";
import { useStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";

import { createEditorStore, type EditorStoreApi } from "./editor-store";
import type { EditorInitialData, EditorStore } from "./types";

const EditorStoreContext = createContext<EditorStoreApi | null>(null);

export function EditorStoreProvider({
  initialData,
  children,
}: {
  initialData: EditorInitialData;
  children: React.ReactNode;
}) {
  const storeRef = useRef<EditorStoreApi>(undefined);
  if (!storeRef.current) {
    storeRef.current = createEditorStore(initialData);
  }

  return (
    <EditorStoreContext.Provider value={storeRef.current}>
      {children}
    </EditorStoreContext.Provider>
  );
}

function useEditorStoreApi(): EditorStoreApi {
  const store = useContext(EditorStoreContext);
  if (!store) {
    throw new Error("useEditorStore must be used within EditorStoreProvider");
  }
  return store;
}

export function useEditorStore<T>(selector: (state: EditorStore) => T): T {
  const store = useEditorStoreApi();
  return useStore(store, selector);
}

export function useEditorTemporalStore<T>(
  selector: (state: TemporalState<Pick<EditorStore, "demo" | "steps">>) => T,
): T {
  const store = useEditorStoreApi();
  return useStoreWithEqualityFn(store.temporal, selector);
}
