const ORTHANC_BASE = process.env.ORTHANC_DICOMWEB_BASEURL;
const ORTHANC_USER = process.env.ORTHANC_USER;
const ORTHANC_PASS = process.env.ORTHANC_PASS;

function authHeader() {
  const token = Buffer.from(`${ORTHANC_USER}:${ORTHANC_PASS}`).toString(
    "base64",
  );
  return { Authorization: `Basic ${token}` };
}

async function dicomwebGet(path) {
  const res = await fetch(`${ORTHANC_BASE}${path}`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Orthanc DICOMweb error ${res.status}: ${txt}`);
  }
  return res.json();
}

async function listStudies() {
  return dicomwebGet(`/studies?includefield=0020000D`);
}

async function listSeries(studyUid) {
  return dicomwebGet(
    `/studies/${encodeURIComponent(studyUid)}/series?includefield=0020000E`,
  );
}

async function listInstances(studyUid, seriesUid) {
  return dicomwebGet(
    `/studies/${encodeURIComponent(studyUid)}/series/${encodeURIComponent(seriesUid)}/instances?includefield=00080018`,
  );
}

module.exports = { listStudies, listSeries, listInstances };
