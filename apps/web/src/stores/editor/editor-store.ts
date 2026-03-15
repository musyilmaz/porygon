import { temporal } from "zundo";
import { createStore } from "zustand";

import type { EditorInitialData, EditorStore } from "./types";

export function createEditorStore(initialData: EditorInitialData) {
  return createStore<EditorStore>()(
    temporal(
      (set) => ({
        // Initial state
        demoId: initialData.demoId,
        workspaceId: initialData.workspaceId,
        demo: initialData.demo,
        steps: initialData.steps,
        selectedStepIndex: 0,
        selectedHotspotId: null,
        selectedAnnotationId: null,
        activeTool: "select",
        leftSidebarOpen: true,
        rightSidebarOpen: true,
        isPreviewOpen: false,
        isShortcutsHelpOpen: false,
        isDirty: false,
        isSaving: false,
        lastSavedAt: null,
        saveError: null,

        // Demo
        updateDemo: (updates) =>
          set((state) => ({
            demo: { ...state.demo, ...updates },
            isDirty: true,
          })),

        // Steps
        selectStep: (index) =>
          set({
            selectedStepIndex: index,
            selectedHotspotId: null,
            selectedAnnotationId: null,
          }),

        addStep: (step) =>
          set((state) => ({
            steps: [...state.steps, step],
            isDirty: true,
          })),

        insertStep: (step, atIndex) =>
          set((state) => {
            const steps = [...state.steps];
            steps.splice(atIndex, 0, step);
            return {
              steps: steps.map((s, i) => ({ ...s, orderIndex: i })),
              isDirty: true,
            };
          }),

        removeStep: (stepId) =>
          set((state) => {
            const steps = state.steps.filter((s) => s.id !== stepId);
            const selectedStepIndex = Math.min(
              state.selectedStepIndex,
              Math.max(0, steps.length - 1),
            );
            return {
              steps,
              selectedStepIndex,
              selectedHotspotId: null,
              selectedAnnotationId: null,
              isDirty: true,
            };
          }),

        reorderSteps: (fromIndex, toIndex) =>
          set((state) => {
            const steps = [...state.steps];
            const [moved] = steps.splice(fromIndex, 1);
            if (!moved) return state;
            steps.splice(toIndex, 0, moved);
            return {
              steps: steps.map((s, i) => ({ ...s, orderIndex: i })),
              selectedStepIndex: toIndex,
              isDirty: true,
            };
          }),

        updateStep: (stepId, updates) =>
          set((state) => ({
            steps: state.steps.map((s) =>
              s.id === stepId ? { ...s, ...updates } : s,
            ),
            isDirty: true,
          })),

        // Hotspots
        addHotspot: (stepId, hotspot) =>
          set((state) => ({
            steps: state.steps.map((s) =>
              s.id === stepId
                ? { ...s, hotspots: [...s.hotspots, hotspot] }
                : s,
            ),
            isDirty: true,
          })),

        updateHotspot: (stepId, hotspotId, updates) =>
          set((state) => ({
            steps: state.steps.map((s) =>
              s.id === stepId
                ? {
                    ...s,
                    hotspots: s.hotspots.map((h) =>
                      h.id === hotspotId ? { ...h, ...updates } : h,
                    ),
                  }
                : s,
            ),
            isDirty: true,
          })),

        removeHotspot: (stepId, hotspotId) =>
          set((state) => ({
            steps: state.steps.map((s) =>
              s.id === stepId
                ? {
                    ...s,
                    hotspots: s.hotspots.filter((h) => h.id !== hotspotId),
                  }
                : s,
            ),
            selectedHotspotId:
              state.selectedHotspotId === hotspotId
                ? null
                : state.selectedHotspotId,
            isDirty: true,
          })),

        selectHotspot: (hotspotId) =>
          set({ selectedHotspotId: hotspotId, selectedAnnotationId: null }),

        // Annotations
        addAnnotation: (stepId, annotation) =>
          set((state) => ({
            steps: state.steps.map((s) =>
              s.id === stepId
                ? { ...s, annotations: [...s.annotations, annotation] }
                : s,
            ),
            isDirty: true,
          })),

        updateAnnotation: (stepId, annotationId, updates) =>
          set((state) => ({
            steps: state.steps.map((s) =>
              s.id === stepId
                ? {
                    ...s,
                    annotations: s.annotations.map((a) =>
                      a.id === annotationId ? { ...a, ...updates } : a,
                    ),
                  }
                : s,
            ),
            isDirty: true,
          })),

        removeAnnotation: (stepId, annotationId) =>
          set((state) => ({
            steps: state.steps.map((s) =>
              s.id === stepId
                ? {
                    ...s,
                    annotations: s.annotations.filter(
                      (a) => a.id !== annotationId,
                    ),
                  }
                : s,
            ),
            selectedAnnotationId:
              state.selectedAnnotationId === annotationId
                ? null
                : state.selectedAnnotationId,
            isDirty: true,
          })),

        selectAnnotation: (annotationId) =>
          set({ selectedAnnotationId: annotationId, selectedHotspotId: null }),

        // Tools & UI
        setTool: (tool) => set({ activeTool: tool }),
        setPreviewOpen: (open) => set({ isPreviewOpen: open }),
        setShortcutsHelpOpen: (open) => set({ isShortcutsHelpOpen: open }),
        toggleLeftSidebar: () =>
          set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
        toggleRightSidebar: () =>
          set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),

        // Save state
        markDirty: () => set({ isDirty: true }),
        setSaving: (isSaving) => set({ isSaving }),
        setSaved: () =>
          set({
            isDirty: false,
            isSaving: false,
            lastSavedAt: new Date(),
            saveError: null,
          }),
        setSaveError: (error) => set({ saveError: error, isSaving: false }),
      }),
      {
        partialize: (state) => ({
          demo: state.demo,
          steps: state.steps,
        }),
      },
    ),
  );
}

export type EditorStoreApi = ReturnType<typeof createEditorStore>;
