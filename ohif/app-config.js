window.config = {
  routerBasename: "/",
  showStudyList: true,

  // ✅ IMPORTANT pour éviter: appConfig.extensions is not iterable
  extensions: [
    "@ohif/extension-default",
    "@ohif/extension-cornerstone",
    "@ohif/extension-measurement-tracking",
  ],

  // ✅ Mode par défaut (viewer)
  modes: ["@ohif/mode-longitudinal"],

  dataSources: [
    {
      namespace: "@ohif/extension-default.dataSourcesModule.dicomweb",
      sourceName: "ORTHANC_VIA_BACKEND",
      configuration: {
        name: "Orthanc (via backend)",
        qidoRoot: "http://localhost:4000/public/dicom-web",
        wadoRoot: "http://localhost:4000/public/dicom-web", // WADO-RS
        wadoUriRoot: "http://localhost:4000/public/dicom-web/wado", // ✅ WADO-URI
        enableStudyLazyLoad: true,
      },
    },
  ],
  defaultDataSourceName: "ORTHANC_VIA_BACKEND",
};
