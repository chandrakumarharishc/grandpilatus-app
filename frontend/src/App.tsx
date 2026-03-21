import { useEffect, useState } from "react";
import { createCampaign, deleteCampaign, getCampaigns, getPerformance, updateCampaign } from "./api";
import { Campaign, CampaignPerformance, CampaignStatus } from "./types";

const emptyForm = {
  name: "",
  description: "",
  segment: "",
  status: "Entwurf" as CampaignStatus,
  startDate: "",
  endDate: ""
};

type View = "dashboard" | "campaigns" | "performance" | "mobile";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(1);
  const [performance, setPerformance] = useState<CampaignPerformance | null>(null);
  const [message, setMessage] = useState("");

  async function loadCampaigns(searchTerm = "") {
    const data = await getCampaigns(searchTerm);
    setCampaigns(data);
  }

  async function loadPerformance(campaignId: number) {
    try {
      const data = await getPerformance(campaignId);
      setPerformance(data);
    } catch {
      setPerformance(null);
    }
  }

  useEffect(() => {
    loadCampaigns();
    loadPerformance(1);
  }, []);

  async function handleSubmit() {
    try {
      if (editingId) {
        await updateCampaign(editingId, form);
        setMessage("Kampagne erfolgreich aktualisiert.");
      } else {
        await createCampaign(form);
        setMessage("Kampagne erfolgreich erstellt.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadCampaigns(search);
    } catch {
      setMessage("Fehler beim Speichern.");
    }
  }

  async function handleSearch() {
    await loadCampaigns(search);
  }

  function handleEdit(campaign: Campaign) {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      description: campaign.description,
      segment: campaign.segment,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate
    });
    setView("campaigns");
    setMessage("Bearbeitungsmodus aktiv.");
  }

  async function handleDelete(id: number) {
    await deleteCampaign(id);
    setMessage("Kampagne gelöscht.");
    await loadCampaigns(search);

    if (selectedCampaignId === id) {
      setPerformance(null);
    }
  }

  async function showPerformance(id: number) {
    setSelectedCampaignId(id);
    await loadPerformance(id);
    setView("performance");
  }

  const activeCount = campaigns.filter((c) => c.status === "Aktiv").length;
  const draftCount = campaigns.filter((c) => c.status === "Entwurf").length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Grand Pilatus</h2>
        <button onClick={() => setView("dashboard")}>Dashboard</button>
        <button onClick={() => setView("campaigns")}>Kampagnen</button>
        <button onClick={() => setView("performance")}>Performance</button>
        <button onClick={() => setView("mobile")}>Mobile Screens</button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>E-Mail-Kampagnen-Management</h1>
          <div>Marketing Sachbearbeitung</div>
        </header>

        {message && <div className="message">{message}</div>}

        {view === "dashboard" && (
          <section>
            <h2>Dashboard</h2>
            <div className="card-grid">
              <div className="card">
                <h3>Gesamt Kampagnen</h3>
                <p>{campaigns.length}</p>
              </div>
              <div className="card">
                <h3>Aktive Kampagnen</h3>
                <p>{activeCount}</p>
              </div>
              <div className="card">
                <h3>Entwürfe</h3>
                <p>{draftCount}</p>
              </div>
              <div className="card">
                <h3>Aktuelle Öffnungen</h3>
                <p>{performance?.openCount ?? 0}</p>
              </div>
            </div>
          </section>
        )}

        {view === "campaigns" && (
          <section>
            <h2>Kampagnen</h2>

            <div className="panel">
              <h3>{editingId ? "Kampagne bearbeiten" : "Neue Kampagne"}</h3>

              <div className="form-grid">
                <input
                  placeholder="Kampagnenname"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  placeholder="Segment"
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value })}
                />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CampaignStatus })}
                >
                  <option value="Entwurf">Entwurf</option>
                  <option value="Aktiv">Aktiv</option>
                  <option value="Pausiert">Pausiert</option>
                  <option value="Beendet">Beendet</option>
                </select>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
                <textarea
                  placeholder="Beschreibung"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="button-row">
                <button onClick={handleSubmit}>{editingId ? "Änderungen speichern" : "Speichern"}</button>
                <button
                  className="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setMessage("Formular zurückgesetzt.");
                  }}
                >
                  Zurücksetzen
                </button>
              </div>
            </div>

            <div className="panel">
              <h3>Suche</h3>
              <div className="button-row">
                <input
                  placeholder="Suche nach Name, Segment oder Status"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={handleSearch}>Suchen</button>
              </div>
            </div>

            <div className="panel">
              <h3>Kampagnenübersicht</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Segment</th>
                    <th>Status</th>
                    <th>Start</th>
                    <th>Ende</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>{campaign.name}</td>
                      <td>{campaign.segment}</td>
                      <td>{campaign.status}</td>
                      <td>{campaign.startDate}</td>
                      <td>{campaign.endDate}</td>
                      <td className="actions">
                        <button onClick={() => handleEdit(campaign)}>Bearbeiten</button>
                        <button onClick={() => showPerformance(campaign.id)}>Performance</button>
                        <button className="danger" onClick={() => handleDelete(campaign.id)}>Löschen</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === "performance" && (
          <section>
            <h2>Performance</h2>

            <div className="panel">
              <div className="button-row">
                <label>Kampagnen-ID:</label>
                <input
                  type="number"
                  value={selectedCampaignId ?? ""}
                  onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
                />
                <button
                  onClick={() => {
                    if (selectedCampaignId) {
                      loadPerformance(selectedCampaignId);
                    }
                  }}
                >
                  Laden
                </button>
              </div>
            </div>

            {performance ? (
              <div className="card-grid">
                <div className="card">
                  <h3>Versendet</h3>
                  <p>{performance.sentCount}</p>
                </div>
                <div className="card">
                  <h3>Zugestellt</h3>
                  <p>{performance.deliveredCount}</p>
                </div>
                <div className="card">
                  <h3>Öffnungen</h3>
                  <p>{performance.openCount}</p>
                </div>
                <div className="card">
                  <h3>Klicks</h3>
                  <p>{performance.clickCount}</p>
                </div>
                <div className="card">
                  <h3>Bounces</h3>
                  <p>{performance.bounceCount ?? 0}</p>
                </div>
                <div className="card">
                  <h3>Abmeldungen</h3>
                  <p>{performance.unsubscribeCount ?? 0}</p>
                </div>
              </div>
            ) : (
              <div className="panel">Keine Performance-Daten gefunden.</div>
            )}
          </section>
        )}

        {view === "mobile" && (
          <section>
            <h2>Mobile-App Wireframe/Prototyp</h2>
            <div className="mobile-grid">
              <div className="phone">
                <div className="phone-header">Home</div>
                <div className="phone-card">
                  <strong>Wellness-Wochenende</strong>
                  <p>20 % Rabatt auf Spa-Angebote</p>
                  <button>Angebot ansehen</button>
                </div>
                <div className="phone-card">
                  <strong>Kulinarik Special</strong>
                  <p>3-Gang-Dinner inklusive</p>
                  <button>Angebot ansehen</button>
                </div>
                <div className="phone-nav">Home | Angebote | Profil</div>
              </div>

              <div className="phone">
                <div className="phone-header">Detail</div>
                <div className="phone-card">
                  <strong>Wellness-Wochenende</strong>
                  <p>Gültig vom 01.06.2026 bis 31.08.2026</p>
                  <p>Inklusive Spa-Zugang und Frühstück.</p>
                  <button>Angebot sichern</button>
                </div>
                <div className="phone-nav">Home | Angebote | Profil</div>
              </div>

              <div className="phone">
                <div className="phone-header">Präferenzen</div>
                <div className="phone-card">
                  <p><input type="checkbox" checked readOnly /> Wellness</p>
                  <p><input type="checkbox" readOnly /> Kulinarik</p>
                  <p><input type="checkbox" checked readOnly /> E-Mail</p>
                  <p><input type="checkbox" readOnly /> Push</p>
                  <button>Speichern</button>
                </div>
                <div className="phone-nav">Home | Angebote | Profil</div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}