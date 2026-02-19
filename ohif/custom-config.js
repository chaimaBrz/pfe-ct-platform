window.config = {
  routerBasename: "/",
  showStudyList: true,

  extensions: [
    "@ohif/extension-default",
    "@ohif/extension-cornerstone",
    "@ohif/extension-measurement-tracking",
  ],

  // ✅ Force le bon mode
  modes: ["@ohif/mode-longitudinal"],
  defaultMode: "@ohif/mode-longitudinal",

  dataSources: [
    {
      namespace: "@ohif/extension-default.dataSourcesModule.dicomweb",
      sourceName: "ORTHANC_VIA_BACKEND",
      configuration: {
        name: "Orthanc (via backend)",
        qidoRoot: "http://localhost:4000/public/dicom-web",
        wadoRoot: "http://localhost:4000/public/dicom-web",
        wadoUriRoot: "http://localhost:4000/public/wado",
        enableStudyLazyLoad: true,
      },
    },
  ],

  defaultDataSourceName: "ORTHANC_VIA_BACKEND",
};
