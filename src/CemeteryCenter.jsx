import { useEffect, useState } from "react";
import { api } from "./api";
import CemeteryServices from "./CemeteryServices";
import "./CemeteryCenter.css";
const clean = (form) =>
  Object.fromEntries([...new FormData(form)].filter(([, v]) => v !== ""));
const status = {
  available: "Disponível",
  partial: "Parcial",
  full: "Lotada",
  reserved: "Reservada",
  maintenance: "Manutenção",
  buried: "Sepultado",
  exhumed: "Exumado",
};
function Dialog({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">GESTÃO DO CEMITÉRIO</span>
            <h2>{title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function GraveForm({ sectors, onClose, onSaved }) {
  const [e, setE] = useState("");
  const save = async (ev) => {
    ev.preventDefault();
    try {
      await api("/cemetery/graves", {
        method: "POST",
        body: JSON.stringify(clean(ev.currentTarget)),
      });
      onSaved();
    } catch (x) {
      setE(x.message);
    }
  };
  return (
    <Dialog title="Nova sepultura" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <div className="form-grid">
          <label>
            Quadra / setor
            <select name="sectorId">
              <option value="">Sem setor</option>
              {sectors.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.code} · {x.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Código
            <input name="code" required />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Tipo
            <select name="type">
              <option value="grave">Sepultura</option>
              <option value="tomb">Jazigo</option>
              <option value="ossuary">Ossuário</option>
              <option value="niche">Nicho</option>
            </select>
          </label>
          <label>
            Capacidade
            <input
              name="capacity"
              type="number"
              min="1"
              defaultValue="1"
              required
            />
          </label>
        </div>
        <label>
          Situação inicial
          <select name="status">
            <option value="available">Disponível</option>
            <option value="reserved">Reservada</option>
            <option value="maintenance">Manutenção</option>
          </select>
        </label>
        <label>
          Localização / referência
          <textarea name="locationNotes" rows="3" />
        </label>
        {e ? <div className="form-error">{e}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar sepultura</button>
        </div>
      </form>
    </Dialog>
  );
}
function DeceasedForm({ onClose, onSaved }) {
  const [e, setE] = useState("");
  const save = async (ev) => {
    ev.preventDefault();
    try {
      await api("/cemetery/deceased", {
        method: "POST",
        body: JSON.stringify(clean(ev.currentTarget)),
      });
      onSaved();
    } catch (x) {
      setE(x.message);
    }
  };
  return (
    <Dialog title="Cadastrar falecido" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <label>
          Nome completo
          <input name="name" required />
        </label>
        <div className="form-grid">
          <label>
            Nascimento
            <input name="birthDate" type="date" />
          </label>
          <label>
            Falecimento
            <input name="deathDate" type="date" required />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Documento
            <input name="document" />
          </label>
          <label>
            Certidão de óbito
            <input name="deathCertificate" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Nome da mãe
            <input name="motherName" />
          </label>
          <label>
            Nome do pai
            <input name="fatherName" />
          </label>
        </div>
        <label>
          Observações
          <textarea name="notes" rows="3" />
        </label>
        {e ? <div className="form-error">{e}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar falecido</button>
        </div>
      </form>
    </Dialog>
  );
}
function BurialForm({ graves, deceased, onClose, onSaved }) {
  const [e, setE] = useState("");
  const save = async (ev) => {
    ev.preventDefault();
    try {
      await api("/cemetery/burials", {
        method: "POST",
        body: JSON.stringify(clean(ev.currentTarget)),
      });
      onSaved();
    } catch (x) {
      setE(x.message);
    }
  };
  return (
    <Dialog title="Registrar sepultamento" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <label>
          Falecido
          <select name="deceasedId" required>
            <option value="">Selecione</option>
            {deceased
              .filter((x) => !x.burial_id || x.burial_status !== "buried")
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
          </select>
        </label>
        <label>
          Sepultura
          <select name="graveId" required>
            <option value="">Selecione</option>
            {graves
              .filter(
                (x) => !["full", "reserved", "maintenance"].includes(x.status),
              )
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.sector_name || "Sem setor"} · {x.code} ({x.occupied}/
                  {x.capacity})
                </option>
              ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            Data
            <input name="buriedAt" type="date" required />
          </label>
          <label>
            Posição / gaveta
            <input name="positionLabel" />
          </label>
        </div>
        <label>
          Observações
          <textarea name="notes" rows="3" />
        </label>
        {e ? <div className="form-error">{e}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Confirmar sepultamento</button>
        </div>
      </form>
    </Dialog>
  );
}
export default function CemeteryCenter() {
  const [tab, setTab] = useState("map"),
    [graves, setGraves] = useState([]),
    [deceased, setDeceased] = useState([]),
    [sectors, setSectors] = useState([]),
    [people, setPeople] = useState([]),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState("");
  const load = async () => {
    try {
      const [g, d, m, p] = await Promise.all([
        api("/cemetery/graves"),
        api("/cemetery/deceased"),
        api("/cemetery/metadata"),
        api("/people"),
      ]);
      setGraves(g.data);
      setDeceased(d.data);
      setSectors(m.sectors);
      setPeople(p.data);
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const saved = async () => {
    setDialog(null);
    await load();
  };
  const available = graves.filter((x) => x.status === "available").length,
    occupied = graves.reduce((s, x) => s + Number(x.occupied), 0);
  return (
    <>
      <section className="module-header cemetery-header">
        <div>
          <span className="eyebrow">MEMÓRIA E CUIDADO</span>
          <h1>Cemitério</h1>
          <p>
            Quadras, sepulturas, falecidos, ocupação, sepultamentos, exumações e
            concessões.
          </p>
        </div>
        <div className="module-actions">
          <button className="secondary" onClick={() => setDialog("deceased")}>
            ＋ Falecido
          </button>
          <button className="secondary" onClick={() => setDialog("grave")}>
            ＋ Sepultura
          </button>
          <button className="primary" onClick={() => setDialog("burial")}>
            Registrar sepultamento
          </button>
        </div>
      </section>
      <div className="cemetery-summary">
        <article>
          <strong>{graves.length}</strong>
          <span>sepulturas</span>
        </article>
        <article>
          <strong>{available}</strong>
          <span>disponíveis</span>
        </article>
        <article>
          <strong>{occupied}</strong>
          <span>ocupações ativas</span>
        </article>
        <article>
          <strong>{deceased.length}</strong>
          <span>falecidos cadastrados</span>
        </article>
      </div>
      <div className="finance-tabs">
        <button
          className={tab === "map" ? "active" : ""}
          onClick={() => setTab("map")}
        >
          Mapa de sepulturas
        </button>
        <button
          className={tab === "deceased" ? "active" : ""}
          onClick={() => setTab("deceased")}
        >
          Falecidos e sepultamentos
        </button>
        <button
          className={tab === "services" ? "active" : ""}
          onClick={() => setTab("services")}
        >
          Serviços e recibos
        </button>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
      {tab === "map" ? (
        <div className="grave-grid">
          {graves.map((x) => (
            <article className={`grave-card ${x.status}`} key={x.id}>
              <div>
                <span>{x.sector_name || "Sem setor"}</span>
                <strong>{x.code}</strong>
              </div>
              <small>
                {x.type} · {x.occupied}/{x.capacity} ocupadas
              </small>
              <span className={`status ${x.status}`}>{status[x.status]}</span>
            </article>
          ))}
          {!graves.length ? (
            <div className="panel registry-empty">
              <strong>Nenhuma sepultura cadastrada</strong>
            </div>
          ) : null}
        </div>
      ) : tab === "deceased" ? (
        <div className="panel table-panel cemetery-table">
          <table>
            <thead>
              <tr>
                <th>Falecido</th>
                <th>Falecimento</th>
                <th>Certidão</th>
                <th>Sepultura</th>
                <th>Sepultamento</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {deceased.map((x) => (
                <tr key={x.id}>
                  <td>
                    <strong>{x.name}</strong>
                    <small className="record-details">{x.document}</small>
                  </td>
                  <td>{new Date(x.death_date).toLocaleDateString("pt-BR")}</td>
                  <td>{x.death_certificate || "—"}</td>
                  <td>
                    {x.grave_code
                      ? `${x.sector_name} · ${x.grave_code}`
                      : "Aguardando"}
                  </td>
                  <td>
                    {x.buried_at
                      ? new Date(x.buried_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`status ${x.burial_status || "requested"}`}
                    >
                      {status[x.burial_status] || "Cadastrado"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "services" ? (
        <CemeteryServices graves={graves} people={people} />
      ) : null}
      {dialog === "grave" ? (
        <GraveForm
          sectors={sectors}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
      {dialog === "deceased" ? (
        <DeceasedForm onClose={() => setDialog(null)} onSaved={saved} />
      ) : null}
      {dialog === "burial" ? (
        <BurialForm
          graves={graves}
          deceased={deceased}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
    </>
  );
}
