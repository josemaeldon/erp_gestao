import { useEffect, useState } from "react";
import { api, money } from "./api";
import SocialDistributionCenter from "./SocialDistributionCenter";
import "./SocialCenter.css";
const clean = (form) =>
    Object.fromEntries([...new FormData(form)].filter(([, v]) => v !== "")),
  labels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
    active: "Ativa",
    monitoring: "Em acompanhamento",
    closed: "Encerrada",
    open: "Aberto",
    follow_up: "Retorno",
    resolved: "Resolvido",
  };
function Dialog({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card social-dialog">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">GESTÃO SOCIAL</span>
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
function HouseholdForm({ people, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    try {
      await api("/social/households", {
        method: "POST",
        body: JSON.stringify(clean(e.currentTarget)),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Cadastrar família" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <label>
          Identificação da família
          <input
            name="familyName"
            required
            placeholder="Ex.: Família dos Santos"
          />
        </label>
        <label>
          Pessoa de referência
          <select name="referencePersonId">
            <option value="">Sem vínculo</option>
            {people.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Endereço
          <input name="address" />
        </label>
        <div className="form-grid">
          <label>
            Bairro
            <input name="neighborhood" />
          </label>
          <label>
            Cidade
            <input name="city" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Renda familiar
            <input
              name="monthlyIncome"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </label>
          <label>
            Vulnerabilidade
            <select name="vulnerabilityLevel">
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </label>
        </div>
        <label>
          Situação de moradia
          <input name="housingStatus" />
        </label>
        <label>
          Observações
          <textarea name="notes" rows="3" />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar família</button>
        </div>
      </form>
    </Dialog>
  );
}
function MemberForm({ people, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    const data = clean(e.currentTarget);
    data.dependent = Boolean(data.dependent);
    try {
      await api(onSaved.path + "/members", {
        method: "POST",
        body: JSON.stringify(data),
      });
      onSaved.done();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Adicionar membro" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <label>
          Pessoa
          <select name="personId" required>
            <option value="">Selecione</option>
            {people.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            Parentesco
            <input name="relationship" />
          </label>
          <label>
            Renda mensal
            <input
              name="monthlyIncome"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </label>
        </div>
        <label className="inline-check">
          <input name="dependent" type="checkbox" /> Dependente familiar
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Adicionar membro</button>
        </div>
      </form>
    </Dialog>
  );
}
function AssistanceForm({ household, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    const data = clean(e.currentTarget);
    data.householdId = household.id;
    data.attendedAt = new Date(data.attendedAt).toISOString();
    try {
      await api("/social/assistance", {
        method: "POST",
        body: JSON.stringify(data),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Registrar atendimento" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <div className="form-grid">
          <label>
            Data e hora
            <input name="attendedAt" type="datetime-local" required />
          </label>
          <label>
            Tipo de atendimento
            <select name="assistanceType">
              <option value="Escuta e acolhimento">Escuta e acolhimento</option>
              <option value="Visita domiciliar">Visita domiciliar</option>
              <option value="Orientação documental">
                Orientação documental
              </option>
              <option value="Encaminhamento">Encaminhamento</option>
              <option value="Ajuda emergencial">Ajuda emergencial</option>
            </select>
          </label>
        </div>
        <label>
          Profissional / agente
          <input name="professional" />
        </label>
        <label>
          Resumo do atendimento
          <textarea name="summary" rows="4" required />
        </label>
        <label>
          Encaminhamento
          <textarea name="referral" rows="2" />
        </label>
        <div className="form-grid">
          <label>
            Retorno previsto
            <input name="followUpOn" type="date" />
          </label>
          <label>
            Sigilo
            <select name="confidentiality">
              <option value="normal">Normal</option>
              <option value="restricted">Restrito</option>
              <option value="strict">Estrito</option>
            </select>
          </label>
        </div>
        <label>
          Situação
          <select name="status">
            <option value="open">Aberto</option>
            <option value="follow_up">Acompanhar</option>
            <option value="resolved">Resolvido</option>
          </select>
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar atendimento</button>
        </div>
      </form>
    </Dialog>
  );
}
function BenefitForm({ household, programs, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    try {
      await api("/social/benefits", {
        method: "POST",
        body: JSON.stringify({
          ...clean(e.currentTarget),
          householdId: household.id,
        }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Entregar benefício" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <label>
          Programa
          <select name="programId">
            <option value="">Entrega avulsa</option>
            {programs.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Benefício / item
          <input name="benefit" required placeholder="Ex.: Cesta básica" />
        </label>
        <div className="form-grid">
          <label>
            Quantidade
            <input
              name="quantity"
              type="number"
              min="0.001"
              step="0.001"
              defaultValue="1"
              required
            />
          </label>
          <label>
            Valor estimado
            <input
              name="estimatedValue"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Data
            <input
              name="deliveredOn"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
          <label>
            Entregue por
            <input name="deliveredBy" />
          </label>
        </div>
        <label>
          Recibo / referência
          <input name="receiptReference" />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Confirmar entrega</button>
        </div>
      </form>
    </Dialog>
  );
}
export default function SocialCenter() {
  const [households, setHouseholds] = useState([]),
    [people, setPeople] = useState([]),
    [programs, setPrograms] = useState([]),
    [selectedId, setSelectedId] = useState(null),
    [details, setDetails] = useState(null),
    [mode, setMode] = useState("families"),
    [tab, setTab] = useState("profile"),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState("");
  const loadBase = async () => {
    try {
      const [h, p, pr] = await Promise.all([
        api("/social/households"),
        api("/people"),
        api("/social/programs"),
      ]);
      setHouseholds(h.data);
      setPeople(p.data);
      setPrograms(pr.data);
      setSelectedId((current) => current || h.data[0]?.id || null);
    } catch (err) {
      setError(err.message);
    }
  };
  const loadDetails = async (id) => {
    if (id) setDetails(await api(`/social/households/${id}/details`));
    else setDetails(null);
  };
  useEffect(() => {
    loadBase();
  }, []);
  useEffect(() => {
    loadDetails(selectedId).catch((err) => setError(err.message));
  }, [selectedId]);
  const saved = async () => {
    setDialog(null);
    await loadBase();
    await loadDetails(selectedId);
  };
  const high = households.filter((x) =>
      ["high", "critical"].includes(x.vulnerability_level),
    ).length,
    open = households.reduce((s, x) => s + Number(x.open_assistance_count), 0),
    value = households.reduce((s, x) => s + Number(x.delivered_value), 0),
    action = { path: `/social/households/${selectedId}`, done: saved };
  return (
    <>
      <section className="module-header social-header">
        <div>
          <span className="eyebrow">ACOLHIMENTO E PROTEÇÃO</span>
          <h1>Gestão Social</h1>
          <p>
            Famílias, vulnerabilidade, atendimentos sigilosos, encaminhamentos e
            benefícios.
          </p>
        </div>
        {mode === "families" ? (
          <button className="primary" onClick={() => setDialog("household")}>
            ＋ Nova família
          </button>
        ) : null}
      </section>
      <div className="social-summary">
        <article>
          <span>Famílias acompanhadas</span>
          <strong>
            {households.filter((x) => x.status !== "closed").length}
          </strong>
        </article>
        <article className={high ? "attention" : ""}>
          <span>Alta vulnerabilidade</span>
          <strong>{high}</strong>
        </article>
        <article>
          <span>Atendimentos abertos</span>
          <strong>{open}</strong>
        </article>
        <article>
          <span>Benefícios entregues</span>
          <strong>{money(value)}</strong>
        </article>
      </div>
      <div className="finance-tabs social-main-tabs">
        <button
          className={mode === "families" ? "active" : ""}
          onClick={() => setMode("families")}
        >
          Famílias e atendimentos
        </button>
        <button
          className={mode === "distribution" ? "active" : ""}
          onClick={() => setMode("distribution")}
        >
          Produtos, kits e distribuições
        </button>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
      {mode === "families" ? (
        <div className="social-layout">
          <aside className="panel household-list">
            <strong>Famílias</strong>
            {households.map((x) => (
              <button
                key={x.id}
                className={x.id === selectedId ? "selected" : ""}
                onClick={() => setSelectedId(x.id)}
              >
                <span className={`vulnerability ${x.vulnerability_level}`} />
                <span>
                  <b>{x.family_name}</b>
                  <small>
                    {x.reference_person_name ||
                      x.neighborhood ||
                      "Sem referência"}
                  </small>
                </span>
                <em>{x.member_count}</em>
              </button>
            ))}
          </aside>
          <section className="social-workspace">
            {details ? (
              <>
                <div className="panel household-hero">
                  <div>
                    <span
                      className={`status ${details.household.vulnerability_level}`}
                    >
                      Vulnerabilidade{" "}
                      {labels[details.household.vulnerability_level]}
                    </span>
                    <h2>{details.household.family_name}</h2>
                    <p>
                      {details.household.address || "Endereço não informado"} ·{" "}
                      {details.household.neighborhood || "—"}
                    </p>
                  </div>
                  <dl>
                    <div>
                      <dt>Responsável</dt>
                      <dd>{details.household.reference_person_name || "—"}</dd>
                    </div>
                    <div>
                      <dt>Renda familiar</dt>
                      <dd>{money(details.household.monthly_income)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="social-actions">
                  <button
                    className="secondary"
                    onClick={() => setDialog("member")}
                  >
                    ＋ Membro
                  </button>
                  <button
                    className="primary"
                    onClick={() => setDialog("assistance")}
                  >
                    ＋ Atendimento
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setDialog("benefit")}
                  >
                    ＋ Benefício
                  </button>
                </div>
                <div className="finance-tabs">
                  <button
                    className={tab === "profile" ? "active" : ""}
                    onClick={() => setTab("profile")}
                  >
                    Composição familiar
                  </button>
                  <button
                    className={tab === "assistance" ? "active" : ""}
                    onClick={() => setTab("assistance")}
                  >
                    Atendimentos
                  </button>
                  <button
                    className={tab === "benefits" ? "active" : ""}
                    onClick={() => setTab("benefits")}
                  >
                    Benefícios
                  </button>
                </div>
                {tab === "profile" ? (
                  <div className="member-grid">
                    {details.members.map((x) => (
                      <article className="panel member-card" key={x.id}>
                        <div className="mini-avatar">
                          {x.person_name
                            .split(" ")
                            .map((v) => v[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <strong>{x.person_name}</strong>
                          <span>
                            {x.relationship || "Membro"}
                            {x.dependent ? " · dependente" : ""}
                          </span>
                        </div>
                        <small>{money(x.monthly_income)}</small>
                      </article>
                    ))}
                  </div>
                ) : null}
                {tab === "assistance" ? (
                  <div className="assistance-list">
                    {details.records.map((x) => (
                      <article className="panel assistance-card" key={x.id}>
                        <div>
                          <span className={`status ${x.status}`}>
                            {labels[x.status]}
                          </span>
                          <small>
                            {new Date(x.attended_at).toLocaleString("pt-BR")} ·{" "}
                            {x.confidentiality}
                          </small>
                        </div>
                        <h3>{x.assistance_type}</h3>
                        <p>{x.summary}</p>
                        {x.referral ? (
                          <footer>Encaminhamento: {x.referral}</footer>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : null}
                {tab === "benefits" ? (
                  <div className="panel table-panel social-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Benefício</th>
                          <th>Programa</th>
                          <th>Quantidade</th>
                          <th>Valor estimado</th>
                          <th>Entregue por</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.deliveries.map((x) => (
                          <tr key={x.id}>
                            <td>
                              {new Date(x.delivered_on).toLocaleDateString(
                                "pt-BR",
                              )}
                            </td>
                            <td>
                              <strong>{x.benefit}</strong>
                            </td>
                            <td>{x.program_name || "Avulso"}</td>
                            <td>{x.quantity}</td>
                            <td>{money(x.estimated_value)}</td>
                            <td>{x.delivered_by || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="panel registry-empty">
                <strong>Cadastre a primeira família</strong>
              </div>
            )}
          </section>
        </div>
      ) : (
        <SocialDistributionCenter households={households} people={people} />
      )}
      {dialog === "household" ? (
        <HouseholdForm
          people={people}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
      {dialog === "member" ? (
        <MemberForm
          people={people}
          onClose={() => setDialog(null)}
          onSaved={action}
        />
      ) : null}
      {dialog === "assistance" ? (
        <AssistanceForm
          household={details.household}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
      {dialog === "benefit" ? (
        <BenefitForm
          household={details.household}
          programs={programs}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
    </>
  );
}
