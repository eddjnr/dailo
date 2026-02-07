"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { saveExcalidrawData, loadExcalidrawData } from "@/lib/excalidraw-storage";
import { useAppStore } from "@/lib/store";
import type { ExcalidrawData } from "@/lib/types";

import "@excalidraw/excalidraw/index.css";

const ExcalidrawWrapper: React.FC = () => {
  const [initialData, setInitialData] = useState<ExcalidrawData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const theme = useAppStore((state) => state.theme);

  // Load saved data on mount
  useEffect(() => {
    loadExcalidrawData()
      .then((data) => {
        setInitialData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load Excalidraw data:", error);
        setIsLoading(false);
      });
  }, []);

  // Debounced save function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // Filter out unnecessary appState properties to save space
      const essentialAppState = {
        viewBackgroundColor: appState.viewBackgroundColor,
        currentItemFontFamily: appState.currentItemFontFamily,
        currentItemFontSize: appState.currentItemFontSize,
        currentItemStrokeColor: appState.currentItemStrokeColor,
        currentItemBackgroundColor: appState.currentItemBackgroundColor,
        currentItemFillStyle: appState.currentItemFillStyle,
        currentItemStrokeWidth: appState.currentItemStrokeWidth,
        currentItemRoughness: appState.currentItemRoughness,
        currentItemOpacity: appState.currentItemOpacity,
        gridSize: appState.gridSize,
        theme: appState.theme,
      };

      saveExcalidrawData({
        elements: [...elements],
        appState: essentialAppState,
        files: files || {},
      }).catch((error) => {
        console.error("Failed to save Excalidraw data:", error);
      });
    }, 1000); // Save after 1 second of inactivity
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Build initialData with proper type casting
  const excalidrawInitialData = initialData ? {
    elements: initialData.elements,
    appState: initialData.appState,
    files: initialData.files,
  } : undefined;

  return (
    <div className="w-full h-full">
      <Excalidraw
        theme={theme}
        // @ts-expect-error - Excalidraw types are complex, we store simplified data
        initialData={excalidrawInitialData}
        onChange={handleChange}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
