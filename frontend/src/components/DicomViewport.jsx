import { useEffect, useRef } from "react";
import * as cornerstone from "@cornerstonejs/core";
import { initCornerstone, wadorsImageId } from "../dicom/initCornerstone";

export default function DicomViewport({
  baseUrl,
  studyUID,
  seriesUID,
  sopUID,
}) {
  const elRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!baseUrl || !studyUID || !seriesUID || !sopUID) return;

      await initCornerstone();
      if (cancelled) return;

      const element = elRef.current;
      if (!element) return;

      const renderingEngineId = "re1";
      const viewportId = `vp-${studyUID}-${seriesUID}-${sopUID}`; // stable

      let re = cornerstone.getRenderingEngine(renderingEngineId);
      if (!re) re = new cornerstone.RenderingEngine(renderingEngineId);

      re.enableElement({
        viewportId,
        type: cornerstone.Enums.ViewportType.STACK,
        element,
      });

      const viewport = re.getViewport(viewportId);

      const imageId = wadorsImageId(baseUrl, studyUID, seriesUID, sopUID);

      try {
        await viewport.setStack([imageId], 0);
        re.resize(true, true);
        viewport.render();
      } catch (err) {
        console.error("DICOM load failed:", { imageId, err });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [baseUrl, studyUID, seriesUID, sopUID]);

  return (
    <div
      ref={elRef}
      style={{
        width: "100%",
        height: 520,
        background: "black",
        borderRadius: 12,
      }}
    />
  );
}
