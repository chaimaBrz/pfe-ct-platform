import { useEffect, useRef } from "react";
import {
  RenderingEngine,
  Enums,
  volumeLoader,
  setVolumesForViewports,
  init as initCornerstone,
} from "@cornerstonejs/core";

import {
  init as initTools,
  ToolGroupManager,
  Enums as ToolEnums,
  PanTool,
  ZoomTool,
  WindowLevelTool,
  StackScrollTool,
  CrosshairsTool,
} from "@cornerstonejs/tools";

import dicomParser from "dicom-parser";
import * as dicomImageLoader from "@cornerstonejs/dicom-image-loader";

const { ViewportType, OrientationAxis } = Enums;

let initialized = false;

async function initAll() {
  if (initialized) return;
  initialized = true;

  // externals
  dicomImageLoader.external.dicomParser = dicomParser;

  // init core + tools
  await initCornerstone();
  initTools();

  // init loader (certaines versions = init() n'existe pas => on protège)
  if (typeof dicomImageLoader.init === "function") {
    dicomImageLoader.init({
      maxWebWorkers: navigator.hardwareConcurrency || 4,
      startWebWorkersOnDemand: true,
    });
  }
}

export default function MPRViewer({
  apiBaseUrl,
  sessionId,
  studyInstanceUID,
  seriesInstanceUID,
}) {
  const axialRef = useRef(null);
  const sagittalRef = useRef(null);
  const coronalRef = useRef(null);
  const auxRef = useRef(null);

  useEffect(() => {
    let renderingEngine;
    let toolGroup;
    let cancelled = false;

    async function run() {
      if (!sessionId || !studyInstanceUID || !seriesInstanceUID) return;

      await initAll();
      if (cancelled) return;

      // 1) get instances list (backend)
      const r = await fetch(
        `${apiBaseUrl}/public/session/${sessionId}/series/${seriesInstanceUID}/instances`,
      );
      if (!r.ok) throw new Error("Cannot load instances list");
      const data = await r.json();
      const instances = data.instances || [];
      if (!instances.length) throw new Error("No instances returned");

      // 2) build WADO-RS imageIds
      const dicomWebBase = `${apiBaseUrl}/public/dicom-web`;
      const imageIds = instances.map((it) => {
        const sop = it.sopInstanceUID;
        const url =
          `${dicomWebBase}/studies/${encodeURIComponent(studyInstanceUID)}` +
          `/series/${encodeURIComponent(seriesInstanceUID)}` +
          `/instances/${encodeURIComponent(sop)}`;
        // ✅ IMPORTANT: use /instances/<sop> (pas /frames/1) => plus compatible
        return `wadors:${url}`;
      });

      // 3) volume
      const volumeId = "cornerstoneStreamingImageVolume:ctVolume";
      const volume = await volumeLoader.createAndCacheVolume(volumeId, {
        imageIds,
      });
      await volume.load();

      // 4) viewports
      renderingEngine = new RenderingEngine("mpr-engine");
      renderingEngine.setViewports([
        {
          viewportId: "AXIAL",
          type: ViewportType.ORTHOGRAPHIC,
          element: axialRef.current,
          defaultOptions: { orientation: OrientationAxis.AXIAL },
        },
        {
          viewportId: "SAGITTAL",
          type: ViewportType.ORTHOGRAPHIC,
          element: sagittalRef.current,
          defaultOptions: { orientation: OrientationAxis.SAGITTAL },
        },
        {
          viewportId: "CORONAL",
          type: ViewportType.ORTHOGRAPHIC,
          element: coronalRef.current,
          defaultOptions: { orientation: OrientationAxis.CORONAL },
        },
        {
          viewportId: "AUX",
          type: ViewportType.ORTHOGRAPHIC,
          element: auxRef.current,
          defaultOptions: { orientation: OrientationAxis.AXIAL },
        },
      ]);

      await setVolumesForViewports(
        renderingEngine,
        [{ volumeId }],
        ["AXIAL", "SAGITTAL", "CORONAL", "AUX"],
      );

      renderingEngine.renderViewports(["AXIAL", "SAGITTAL", "CORONAL", "AUX"]);

      // tools
      toolGroup = ToolGroupManager.createToolGroup("mpr-tool-group");
      toolGroup.addTool(PanTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(StackScrollTool.toolName);
      toolGroup.addTool(CrosshairsTool.toolName);

      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }],
      });
      toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Wheel }],
      });
      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Secondary }],
      });
      toolGroup.setToolActive(PanTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Auxiliary }],
      });
      toolGroup.setToolActive(CrosshairsTool.toolName, {
        bindings: [
          {
            mouseButton: ToolEnums.MouseBindings.Primary,
            modifierKey: "Shift",
          },
        ],
      });

      toolGroup.addViewport("AXIAL", renderingEngine.id);
      toolGroup.addViewport("SAGITTAL", renderingEngine.id);
      toolGroup.addViewport("CORONAL", renderingEngine.id);
      toolGroup.addViewport("AUX", renderingEngine.id);
    }

    run().catch((e) => console.error("MPR error:", e));

    return () => {
      cancelled = true;
      try {
        toolGroup?.destroy();
        renderingEngine?.destroy();
      } catch (e) {
        console.warn("Cleanup error:", e);
      }
    };
  }, [apiBaseUrl, sessionId, studyInstanceUID, seriesInstanceUID]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "10px",
        height: "70vh",
      }}
    >
      <div ref={axialRef} style={{ background: "black", borderRadius: 12 }} />
      <div
        ref={sagittalRef}
        style={{ background: "black", borderRadius: 12 }}
      />
      <div ref={coronalRef} style={{ background: "black", borderRadius: 12 }} />
      <div ref={auxRef} style={{ background: "black", borderRadius: 12 }} />
    </div>
  );
}
