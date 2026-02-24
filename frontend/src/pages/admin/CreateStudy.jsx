import { useEffect, useState } from "react";

export default function CreateStudy() {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("PAIRWISE");
  const [protocols, setProtocols] = useState([]);
  const [protocolId, setProtocolId] = useState("");
  const [msg, setMsg] = useState("");
  const [createdStudy, setCreatedStudy] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:4000/protocols", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProtocols(data);

          const first = data.find((p) => p.mode === mode);
          if (first) setProtocolId(first.id);
        }
      });
  }, []);

  const filteredProtocols = protocols.filter((p) => p.mode === mode);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setCreatedStudy(null);

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:4000/studies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        studyType: "QUALITY",
        protocolId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error || data.message || "Error");
      return;
    }

    setCreatedStudy(data);
    setMsg("✅ Study created");
  }

  async function uploadImages() {
    if (!images.length || !createdStudy) return;

    const token = localStorage.getItem("token");

    const formData = new FormData();

    for (let file of images) {
      formData.append("images", file);
    }

    const res = await fetch(
      `http://localhost:4000/images/upload/${createdStudy.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error || "Upload failed");
      return;
    }

    setMsg("✅ Images uploaded");
    setImages([]);
  }

  return (
    <div className="admin-page">
      <div className="admin-card wide">
        <h1 className="admin-title">Create Study</h1>

        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            className="admin-input"
            placeholder="Study name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="admin-input"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="PAIRWISE">Pairwise</option>
            <option value="RATING">Rating</option>
          </select>

          <select
            className="admin-input"
            value={protocolId}
            onChange={(e) => setProtocolId(e.target.value)}
          >
            {filteredProtocols.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button className="admin-button">Create Study</button>
        </form>

        {msg && <div className="admin-message">{msg}</div>}

        {createdStudy && (
          <div className="admin-message success">
            <div>
              <b>Study ID:</b> {createdStudy.id}
            </div>
            <div>
              <b>Status:</b> {createdStudy.status}
            </div>
          </div>
        )}

        {createdStudy && (
          <div className="admin-upload">
            <h3>Add Study Images</h3>

            <input
              type="file"
              multiple
              className="admin-file-input"
              onChange={(e) => setImages([...e.target.files])}
            />

            <button
              type="button"
              className="admin-upload-button"
              onClick={uploadImages}
            >
              Upload Images
            </button>

            {images.length > 0 && (
              <div className="admin-message">
                {images.length} images selected
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
