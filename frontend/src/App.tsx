import { useEffect, useMemo, useState } from "react";
import {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  getPerformance,
  updateCampaign,
} from "./api";
import {
  Campaign,
  CampaignFormData,
  CampaignPerformance,
  CampaignStatus,
} from "./types";

const emptyForm: CampaignFormData = {
  name: "",
  description: "",
  segment: "",
  status: "Entwurf",
  startDate: "",
  endDate: "",
};

type View = "dashboard" | "campaigns" | "performance";

const statusOptions: CampaignStatus[] = [
  "Entwurf",
  "Aktiv",
  "Pausiert",
  "Beendet",
];

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CampaignFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [performance, setPerformance] =
    useState<CampaignPerformance | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadCampaigns(searchTerm = "") {
    setLoading(true);
    try {
      const data = await getCampaigns(searchTerm);
      setCampaigns(data);
    } catch {
      setMessage({
        type: "error",
        text: "Kampagnen konnten nicht geladen werden.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadPerformance(campaignId: string) {
    try {
      const data = await getPerformance(campaignId);
      setPerformance(data);
    } catch {
      setPerformance(null);
      setMessage({
        type: "error",
        text: "Für diese Kampagne liegen keine Performance-Daten vor.",
      });
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  const dashboardStats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "Aktiv").length;
    const draft = campaigns.filter((c) => c.status === "Entwurf").length;
    const paused = campaigns.filter((c) => c.status === "Pausiert").length;

    return {
      total: campaigns.length,
      active,
      draft,
      paused,
    };
  }, [campaigns]);

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === selectedCampaignId) ?? null,
    [campaigns, selectedCampaignId]
  );

  async function handleSubmit() {
    try {
      if (!form.name || !form.segment || !form.startDate || !form.endDate) {
        setMessage({
          type: "error",
          text: "Bitte alle Pflichtfelder ausfüllen.",
        });
        return;
      }

      if (editingId) {
        await updateCampaign(editingId, form);
        setMessage({
          type: "success",
          text: "Kampagne erfolgreich aktualisiert.",
        });
      } else {
        await createCampaign(form);
        setMessage({
          type: "success",
          text: "Kampagne erfolgreich erstellt.",
        });
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadCampaigns(search);
      setView("campaigns");
    } catch {
      setMessage({
        type: "error",
        text: "Fehler beim Speichern der Kampagne.",
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCampaign(id);
      setMessage({
        type: "success",
        text: "Kampagne wurde gelöscht.",
      });
      await loadCampaigns(search);

      if (selectedCampaignId === id) {
        setSelectedCampaignId("");
        setPerformance(null);
      }
    } catch {
      setMessage({
        type: "error",
        text: "Kampagne konnte nicht gelöscht werden.",
      });
    }
  }

  function handleEdit(campaign: Campaign) {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      description: campaign.description ?? "",
      segment: campaign.segment,
      status: campaign.status,
      startDate: campaign.startDate ?? "",
      endDate: campaign.endDate ?? "",
    });
    setView("campaigns");
    setMessage({
      type: "success",
      text: "Bearbeitungsmodus aktiviert.",
    });
  }

  async function handleSearch() {
    await loadCampaigns(search);
  }

  async function handleShowPerformance(id: string) {
    setSelectedCampaignId(id);
    await loadPerformance(id);
    setView("performance");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage({
      type: "success",
      text: "Formular zurückgesetzt.",
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Grand Pilatus</p>
          <h1 className="brand-title">E-Mail-Kampagnen-Management</h1>
          <p className="brand-copy">
            Zentrale Steuerung von Kampagnen, Zielgruppen und Performance-Daten
            für die Marketing-Sachbearbeitung.
          </p>
        </div>

        <nav className="nav-list" aria-label="Hauptnavigation">
          <button
            className={view === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={view === "campaigns" ? "nav-item active" : "nav-item"}
            onClick={() => setView("campaigns")}
          >
            Kampagnen
          </button>
          <button
            className={view === "performance" ? "nav-item active" : "nav-item"}
            onClick={() => setView("performance")}
          >
            Performance
          </button>
        </nav>

        <div className="sidebar-card">
          <span className="sidebar-label">Aktive Kampagnen</span>
          <strong>{dashboardStats.active}</strong>
          <small>Direkt aus dem aktuellen Datenbestand berechnet.</small>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Marketing Suite</p>
            <h2 className="page-title">
              {view === "dashboard"
                ? "Übersicht"
                : view === "campaigns"
                ? "Kampagnenverwaltung"
                : "Performance-Auswertung"}
            </h2>
          </div>
          <div className="topbar-chip">Marketing Sachbearbeitung</div>
        </header>

        {message && (
          <div
            className={message.type === "success" ? "banner success" : "banner error"}
          >
            <span className="banner-icon">
              {message.type === "success" ? "✓" : "!"}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        {view === "dashboard" && (
          <section className="page-section">
            <div className="hero-card">
              <div>
                <p className="eyebrow">Aktueller Status</p>
                <h3>Willkommen im Kampagnen-Cockpit</h3>
                <p>
                  Die Oberfläche bündelt die wichtigsten Kennzahlen und
                  ermöglicht einen direkten Wechsel in die operative
                  Kampagnenverwaltung.
                </p>
              </div>
              <button className="primary" onClick={() => setView("campaigns")}>
                Jetzt Kampagnen verwalten
              </button>
            </div>

            <div className="stats-grid">
              <article className="stat-card">
                <span>Gesamt Kampagnen</span>
                <strong>{dashboardStats.total}</strong>
              </article>
              <article className="stat-card">
                <span>Aktive Kampagnen</span>
                <strong>{dashboardStats.active}</strong>
              </article>
              <article className="stat-card">
                <span>Entwürfe</span>
                <strong>{dashboardStats.draft}</strong>
              </article>
              <article className="stat-card">
                <span>Pausiert</span>
                <strong>{dashboardStats.paused}</strong>
              </article>
            </div>

            <div className="dashboard-grid">
              <article className="surface-card">
                <div className="section-head">
                  <h3>Letzte Kampagnen</h3>
                  <button className="text-button" onClick={() => setView("campaigns")}>
                    Alle anzeigen
                  </button>
                </div>
                <div className="list">
                  {campaigns.slice(0, 4).map((campaign) => (
                    <div key={campaign.id} className="list-row">
                      <div>
                        <strong>{campaign.name}</strong>
                        <p>{campaign.segment}</p>
                      </div>
                      <span className={`status-pill ${campaign.status.toLowerCase()}`}>
                        {campaign.status}
                      </span>
                    </div>
                  ))}
                  {campaigns.length === 0 && (
                    <p className="muted">Noch keine Kampagnen vorhanden.</p>
                  )}
                </div>
              </article>

              <article className="surface-card">
                <div className="section-head">
                  <h3>Schnellaktion</h3>
                </div>
                <p className="muted">
                  Neue Kampagnen können direkt über die Kampagnenverwaltung
                  erstellt und im Anschluss sofort analysiert werden.
                </p>
                <button className="primary full" onClick={() => setView("campaigns")}>
                  Neue Kampagne erfassen
                </button>
              </article>
            </div>
          </section>
        )}

        {view === "campaigns" && (
          <section className="page-section">
            <div className="workspace-grid">
              <article className="surface-card">
                <div className="section-head">
                  <h3>{editingId ? "Kampagne bearbeiten" : "Neue Kampagne erstellen"}</h3>
                  {editingId && (
                    <button className="text-button" onClick={resetForm}>
                      Bearbeitung abbrechen
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <label>
                    Kampagnenname
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="z. B. Wellness-Wochenende"
                    />
                  </label>

                  <label>
                    Segment
                    <input
                      value={form.segment}
                      onChange={(e) => setForm({ ...form, segment: e.target.value })}
                      placeholder="z. B. Wellness"
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value as CampaignStatus })
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Startdatum
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </label>

                  <label>
                    Enddatum
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </label>

                  <label className="full-width">
                    Beschreibung
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Beschreibe Ziel, Angebot und Kernaussage der Kampagne."
                    />
                  </label>
                </div>

                <div className="button-row">
                  <button className="primary" onClick={handleSubmit}>
                    {editingId ? "Änderungen speichern" : "Kampagne speichern"}
                  </button>
                  <button className="secondary" onClick={resetForm}>
                    Zurücksetzen
                  </button>
                </div>
              </article>

              <article className="surface-card">
                <div className="section-head">
                  <h3>Suche & Übersicht</h3>
                </div>

                <div className="search-bar">
                  <input
                    placeholder="Nach Name, Segment oder Status suchen"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="primary" onClick={handleSearch}>
                    Suchen
                  </button>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Segment</th>
                        <th>Status</th>
                        <th>Zeitraum</th>
                        <th>Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id}>
                          <td>
                            <strong>{campaign.name}</strong>
                            <div className="table-sub">
                              {campaign.description || "Keine Beschreibung"}
                            </div>
                          </td>
                          <td>{campaign.segment}</td>
                          <td>
                            <span className={`status-pill ${campaign.status.toLowerCase()}`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td>
                            {campaign.startDate || "–"} bis {campaign.endDate || "–"}
                          </td>
                          <td className="actions">
                            <button
                              className="secondary small"
                              onClick={() => handleEdit(campaign)}
                            >
                              Bearbeiten
                            </button>
                            <button
                              className="secondary small"
                              onClick={() => handleShowPerformance(campaign.id)}
                            >
                              Performance
                            </button>
                            <button
                              className="danger small"
                              onClick={() => handleDelete(campaign.id)}
                            >
                              Löschen
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!loading && campaigns.length === 0 && (
                    <p className="empty-state">Keine Kampagnen gefunden.</p>
                  )}
                </div>
              </article>
            </div>
          </section>
        )}

        {view === "performance" && (
          <section className="page-section">
            <article className="surface-card">
              <div className="section-head">
                <h3>Performance laden</h3>
              </div>

              <div className="search-bar performance-bar">
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                >
                  <option value="">Kampagne auswählen</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>

                <button
                  className="primary"
                  onClick={() => selectedCampaignId && loadPerformance(selectedCampaignId)}
                >
                  Performance anzeigen
                </button>
              </div>

              {selectedCampaign && (
                <div className="meta-strip">
                  <span>{selectedCampaign.name}</span>
                  <span>{selectedCampaign.segment}</span>
                  <span>{selectedCampaign.status}</span>
                </div>
              )}
            </article>

            {performance ? (
              <div className="stats-grid performance-grid">
                <article className="stat-card">
                  <span>Versendet</span>
                  <strong>{performance.sentCount}</strong>
                </article>
                <article className="stat-card">
                  <span>Zugestellt</span>
                  <strong>{performance.deliveredCount}</strong>
                </article>
                <article className="stat-card">
                  <span>Öffnungen</span>
                  <strong>{performance.openCount}</strong>
                </article>
                <article className="stat-card">
                  <span>Klicks</span>
                  <strong>{performance.clickCount}</strong>
                </article>
                <article className="stat-card">
                  <span>Bounces</span>
                  <strong>{performance.bounceCount ?? 0}</strong>
                </article>
                <article className="stat-card">
                  <span>Abmeldungen</span>
                  <strong>{performance.unsubscribeCount ?? 0}</strong>
                </article>
              </div>
            ) : (
              <div className="surface-card empty-box">
                Wähle eine Kampagne aus, um die Performance-Daten anzuzeigen.
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}