import * as cornerstone from "@cornerstonejs/core";
import * as dicomImageLoader from "@cornerstonejs/dicom-image-loader";

let initialized = false;

export async function initCornerstone() {
  if (initialized) return;

  await cornerstone.init();

  // Lien cornerstone <-> loader
  dicomImageLoader.external.cornerstone = cornerstone;

  // ✅ IMPORTANT: worker + codecs depuis /public/cornerstone
  dicomImageLoader.webWorkerManager.initialize({
    webWorkerPath: "/cornerstone/decodeImageFrameWorker.js",
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: true,
        codecsPath: "/cornerstone/codecs/",
      },
    },
  });

  initialized = true;
}

// ImageId WADO-RS
export function wadorsImageId(baseUrl, studyUID, seriesUID, sopUID, frame = 1) {
  return `wadors:${baseUrl}/studies/${studyUID}/series/${seriesUID}/instances/${sopUID}/frames/${frame}`;
}
