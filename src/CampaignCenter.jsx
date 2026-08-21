import { useEffect, useMemo, useState } from "react";
import { api, money } from "./api";
import "./CampaignCenter.css";

const clean = (form) =>
  Object.fromEntries(
    [...new FormData(form)].filter(([, value]) => value !== ""),
  );
const statusLabels = {
  planning: "Planejamento",
  active: "Ativa",
  paused: "Pausada",
  completed: "Concluída",
  cancelled: "Cancelada",
  open: "Em aberto",
  partial: "Parcial",
  fulfilled: "Cumprido",
};
function Dialog({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card campaign-dialog">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">CAMPANHAS</span>
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
function CampaignForm({ onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    try {
      await api("/campaigns", {
        method: "POST",
        body: JSON.stringify(clean(event.currentTarget)),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Nova campanha" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <label>
          Nome da campanha
          <input name="name" required />
        </label>
        <div className="form-grid">
          <label>
            Tipo
            <select name="campaignType">
              <option value="fundraising">Arrecadação</option>
              <option value="construction">Construção ou reforma</option>
              <option value="mission">Ação missionária</option>
              <option value="social">Ação social</option>
              <option value="event">Evento</option>
            </select>
          </label>
          <label>
            Coordenador
            <input name="coordinator" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Início
            <input name="startsOn" type="date" required />
          </label>
          <label>
            Término
            <input name="endsOn" type="date" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Meta financeira
            <input
              name="targetAmount"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </label>
          <label>
            Situação
            <select name="status">
              <option value="planning">Planejamento</option>
              <option value="active">Ativa</option>
            </select>
          </label>
        </div>
        <label>
          Objetivo e descrição
          <textarea name="description" rows="4" />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar campanha</button>
        </div>
      </form>
    </Dialog>
  );
}
function PledgeForm({ people, onClose, onSaved }) {
  const [anonymous, setAnonymous] = useState(false),
    [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    try {
      await api(onSaved.path + "/pledges", {
        method: "POST",
        body: JSON.stringify(clean(event.currentTarget)),
      });
      onSaved.done();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Novo compromisso de doação" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <label className="inline-check">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />{" "}
          Doador sem cadastro
        </label>
        {anonymous ? (
          <label>
            Nome do doador
            <input name="donorName" required />
          </label>
        ) : (
          <label>
            Doador
            <select name="personId" required>
              <option value="">Selecione</option>
              {people.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="form-grid">
          <label>
            Valor prometido
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
            />
          </label>
          <label>
            Frequência
            <select name="frequency">
              <option value="once">Única</option>
              <option value="monthly">Mensal</option>
              <option value="installments">Parcelada</option>
            </select>
          </label>
        </div>
        <div className="form-grid">
          <label>
            Data do compromisso
            <input
              name="pledgedOn"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
          <label>
            Vencimento
            <input name="dueDate" type="date" />
          </label>
        </div>
        <label>
          Observações
          <textarea name="notes" rows="3" />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar compromisso</button>
        </div>
      </form>
    </Dialog>
  );
}
function DonationForm({ people, pledges, onClose, onSaved }) {
  const [pledgeId, setPledgeId] = useState(""),
    [error, setError] = useState("");
  const pledge = pledges.find((item) => item.id === pledgeId);
  const save = async (event) => {
    event.preventDefault();
    try {
      await api(onSaved.path + "/donations", {
        method: "POST",
        body: JSON.stringify(clean(event.currentTarget)),
      });
      onSaved.done();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Registrar recebimento" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <label>
          Compromisso vinculado
          <select
            name="pledgeId"
            value={pledgeId}
            onChange={(e) => setPledgeId(e.target.value)}
          >
            <option value="">Doação avulsa</option>
            {pledges
              .filter(
                (item) => !["fulfilled", "cancelled"].includes(item.status),
              )
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.person_name || item.donor_name} · saldo{" "}
                  {money(item.remaining_amount)}
                </option>
              ))}
          </select>
        </label>
        {!pledge ? (
          <>
            <label>
              Doador cadastrado
              <select name="personId">
                <option value="">Sem vínculo</option>
                {people.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nome livre do doador
              <input name="donorName" />
            </label>
          </>
        ) : (
          <div className="pledge-reference">
            <strong>{pledge.person_name || pledge.donor_name}</strong>
            <span>
              Compromisso: {money(pledge.amount)} · recebido:{" "}
              {money(pledge.received_amount)}
            </span>
          </div>
        )}
        <div className="form-grid">
          <label>
            Valor recebido
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
            />
          </label>
          <label>
            Data
            <input
              name="receivedOn"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Forma de pagamento
            <select name="paymentMethod">
              <option value="pix">PIX</option>
              <option value="cash">Dinheiro</option>
              <option value="card">Cartão</option>
              <option value="transfer">Transferência</option>
              <option value="boleto">Boleto</option>
            </select>
          </label>
          <label>
            Referência
            <input name="reference" />
          </label>
        </div>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Confirmar recebimento</button>
        </div>
      </form>
    </Dialog>
  );
}
function ExpenseForm({ people, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    try {
      await api(onSaved.path + "/expenses", {
        method: "POST",
        body: JSON.stringify(clean(event.currentTarget)),
      });
      onSaved.done();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Lançar despesa da campanha" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <label>
          Descrição
          <input name="description" required />
        </label>
        <div className="form-grid">
          <label>
            Valor
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
            />
          </label>
          <label>
            Data
            <input
              name="occurredOn"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
        </div>
        <label>
          Fornecedor
          <select name="supplierId">
            <option value="">Sem vínculo</option>
            {people.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
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
          <button className="primary">Salvar despesa</button>
        </div>
      </form>
    </Dialog>
  );
}

export default function CampaignCenter() {
  const [campaigns, setCampaigns] = useState([]),
    [people, setPeople] = useState([]),
    [selectedId, setSelectedId] = useState(null),
    [details, setDetails] = useState(null),
    [batches, setBatches] = useState([]),
    [tab, setTab] = useState("overview"),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState("");
  const loadBase = async () => {
    try {
      const [c, p] = await Promise.all([api("/campaigns"), api("/people")]);
      setCampaigns(c.data);
      setPeople(p.data);
      setSelectedId((current) => current || c.data[0]?.id || null);
    } catch (err) {
      setError(err.message);
    }
  };
  const loadDetails = async (id) => {
    if (!id) {
      setDetails(null);
      return;
    }
    try {
      const [detail, batchData] = await Promise.all([
        api(`/campaigns/${id}/details`),
        api(`/campaigns/${id}/batches`),
      ]);
      setDetails(detail);
      setBatches(batchData.data);
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    loadBase();
  }, []);
  useEffect(() => {
    loadDetails(selectedId);
  }, [selectedId]);
  const selected = campaigns.find((item) => item.id === selectedId),
    progress =
      selected?.target_amount > 0
        ? Math.min(
            100,
            (Number(selected.received_amount) /
              Number(selected.target_amount)) *
              100,
          )
        : 0;
  const totals = useMemo(
    () =>
      campaigns.reduce(
        (acc, item) => ({
          target: acc.target + Number(item.target_amount),
          received: acc.received + Number(item.received_amount),
          expenses: acc.expenses + Number(item.expense_amount),
        }),
        { target: 0, received: 0, expenses: 0 },
      ),
    [campaigns],
  );
  const saved = async () => {
      setDialog(null);
      await loadBase();
      if (selectedId) await loadDetails(selectedId);
    },
    action = { path: `/campaigns/${selectedId}`, done: saved };
  const createBatch = async () => {
    const pledgeIds = (details?.pledges || [])
      .filter((x) => !["fulfilled", "cancelled"].includes(x.status))
      .map((x) => x.id);
    if (!pledgeIds.length)
      return setError("Não há compromissos em aberto para gerar lote.");
    try {
      await api(`/campaigns/${selectedId}/batches`, {
        method: "POST",
        body: JSON.stringify({
          description: `Lote ${new Date().toLocaleDateString("pt-BR")}`,
          pledgeIds,
        }),
      });
      await loadDetails(selectedId);
    } catch (err) {
      setError(err.message);
    }
  };
  const emailBatch = async (id) => {
    try {
      await api(`/campaigns/batches/${id}/email`, {
        method: "POST",
        body: "{}",
      });
      await loadDetails(selectedId);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <>
      <section className="module-header campaign-header">
        <div>
          <span className="eyebrow">MOBILIZAÇÃO E ARRECADAÇÃO</span>
          <h1>Campanhas</h1>
          <p>
            Metas, compromissos, doadores, recebimentos, despesas e projeção
            financeira.
          </p>
        </div>
        <button className="primary" onClick={() => setDialog("campaign")}>
          ＋ Nova campanha
        </button>
      </section>
      <div className="campaign-summary">
        <article>
          <span>Meta consolidada</span>
          <strong>{money(totals.target)}</strong>
        </article>
        <article>
          <span>Total recebido</span>
          <strong>{money(totals.received)}</strong>
        </article>
        <article>
          <span>Despesas vinculadas</span>
          <strong>{money(totals.expenses)}</strong>
        </article>
        <article>
          <span>Campanhas ativas</span>
          <strong>
            {campaigns.filter((item) => item.status === "active").length}
          </strong>
        </article>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
      <div className="campaign-layout">
        <aside className="campaign-list panel">
          <div className="campaign-list-heading">
            <strong>Campanhas</strong>
            <span>{campaigns.length}</span>
          </div>
          {campaigns.map((item) => (
            <button
              className={item.id === selectedId ? "selected" : ""}
              key={item.id}
              onClick={() => setSelectedId(item.id)}
            >
              <span className={`campaign-dot ${item.status}`} />
              <span>
                <strong>{item.name}</strong>
                <small>
                  {money(item.received_amount)} de {money(item.target_amount)}
                </small>
              </span>
            </button>
          ))}
        </aside>
        <section className="campaign-workspace">
          {selected && details ? (
            <>
              <div className="panel campaign-hero">
                <div>
                  <span className={`status ${selected.status}`}>
                    {statusLabels[selected.status]}
                  </span>
                  <h2>{selected.name}</h2>
                  <p>
                    {selected.description || "Campanha paroquial cadastrada."}
                  </p>
                </div>
                <div className="campaign-goal">
                  <strong>{progress.toFixed(1)}%</strong>
                  <span>{money(selected.received_amount)} arrecadados</span>
                  <div>
                    <i style={{ width: `${progress}%` }} />
                  </div>
                  <small>Meta {money(selected.target_amount)}</small>
                </div>
              </div>
              <div className="campaign-actions">
                <button
                  className="secondary"
                  onClick={() => setDialog("pledge")}
                >
                  ＋ Compromisso
                </button>
                <button
                  className="primary"
                  onClick={() => setDialog("donation")}
                >
                  ＋ Recebimento
                </button>
                <button
                  className="secondary"
                  onClick={() => setDialog("expense")}
                >
                  ＋ Despesa
                </button>
              </div>
              <div className="finance-tabs">
                <button
                  className={tab === "overview" ? "active" : ""}
                  onClick={() => setTab("overview")}
                >
                  Visão geral
                </button>
                <button
                  className={tab === "pledges" ? "active" : ""}
                  onClick={() => setTab("pledges")}
                >
                  Compromissos
                </button>
                <button
                  className={tab === "donations" ? "active" : ""}
                  onClick={() => setTab("donations")}
                >
                  Recebimentos
                </button>
                <button
                  className={tab === "expenses" ? "active" : ""}
                  onClick={() => setTab("expenses")}
                >
                  Despesas
                </button>
                <button
                  className={tab === "batches" ? "active" : ""}
                  onClick={() => setTab("batches")}
                >
                  Lotes e boletos
                </button>
              </div>
              {tab === "overview" ? (
                <div className="campaign-kpis">
                  <article className="panel">
                    <span>Comprometido</span>
                    <strong>
                      {money(
                        details.pledges.reduce(
                          (s, x) => s + Number(x.amount),
                          0,
                        ),
                      )}
                    </strong>
                    <small>{details.pledges.length} compromissos</small>
                  </article>
                  <article className="panel">
                    <span>Recebido</span>
                    <strong>
                      {money(
                        details.donations.reduce(
                          (s, x) => s + Number(x.amount),
                          0,
                        ),
                      )}
                    </strong>
                    <small>{details.donations.length} pagamentos</small>
                  </article>
                  <article className="panel">
                    <span>Saldo líquido</span>
                    <strong>
                      {money(
                        details.donations.reduce(
                          (s, x) => s + Number(x.amount),
                          0,
                        ) -
                          details.expenses.reduce(
                            (s, x) => s + Number(x.amount),
                            0,
                          ),
                      )}
                    </strong>
                    <small>Receitas menos despesas</small>
                  </article>
                </div>
              ) : null}
              {tab === "pledges" ? (
                <div className="panel table-panel campaign-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Doador</th>
                        <th>Compromisso</th>
                        <th>Recebido</th>
                        <th>Saldo</th>
                        <th>Vencimento</th>
                        <th>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.pledges.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>
                              {item.person_name || item.donor_name}
                            </strong>
                          </td>
                          <td>{money(item.amount)}</td>
                          <td>{money(item.received_amount)}</td>
                          <td>{money(item.remaining_amount)}</td>
                          <td>
                            {item.due_date
                              ? new Date(item.due_date).toLocaleDateString(
                                  "pt-BR",
                                )
                              : "—"}
                          </td>
                          <td>
                            <span className={`status ${item.status}`}>
                              {statusLabels[item.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {tab === "donations" ? (
                <div className="panel table-panel campaign-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Doador</th>
                        <th>Valor</th>
                        <th>Forma</th>
                        <th>Referência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.donations.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {new Date(item.received_on).toLocaleDateString(
                              "pt-BR",
                            )}
                          </td>
                          <td>
                            <strong>
                              {item.person_name || item.donor_name || "Anônimo"}
                            </strong>
                          </td>
                          <td className="positive">{money(item.amount)}</td>
                          <td>{item.payment_method}</td>
                          <td>{item.reference || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {tab === "expenses" ? (
                <div className="panel table-panel campaign-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Fornecedor</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.expenses.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {new Date(item.occurred_on).toLocaleDateString(
                              "pt-BR",
                            )}
                          </td>
                          <td>
                            <strong>{item.description}</strong>
                          </td>
                          <td>{item.supplier_name || "—"}</td>
                          <td className="negative">{money(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {tab === "batches" ? (
                <div className="panel table-panel campaign-table">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">COBRANÇA EM LOTE</span>
                      <h3>Lotes da campanha</h3>
                    </div>
                    <button className="primary" onClick={createBatch}>
                      ＋ Gerar lote
                    </button>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Lote</th>
                        <th>Descrição</th>
                        <th>Compromissos</th>
                        <th>Total</th>
                        <th>Situação</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((item) => (
                        <tr key={item.id}>
                          <td>{item.batch_number}</td>
                          <td>
                            <strong>{item.description}</strong>
                          </td>
                          <td>{item.pledge_ids.length}</td>
                          <td>{money(item.total_amount)}</td>
                          <td>{item.status}</td>
                          <td>
                            {item.status === "generated" ? (
                              <button
                                className="text-btn"
                                onClick={() => emailBatch(item.id)}
                              >
                                Enviar por e-mail
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </>
          ) : (
            <div className="panel registry-empty">
              <strong>Crie a primeira campanha</strong>
              <p>Defina período, meta e responsável.</p>
            </div>
          )}
        </section>
      </div>
      {dialog === "campaign" ? (
        <CampaignForm onClose={() => setDialog(null)} onSaved={saved} />
      ) : null}
      {dialog === "pledge" ? (
        <PledgeForm
          people={people}
          onClose={() => setDialog(null)}
          onSaved={action}
        />
      ) : null}
      {dialog === "donation" ? (
        <DonationForm
          people={people}
          pledges={details?.pledges || []}
          onClose={() => setDialog(null)}
          onSaved={action}
        />
      ) : null}
      {dialog === "expense" ? (
        <ExpenseForm
          people={people}
          onClose={() => setDialog(null)}
          onSaved={action}
        />
      ) : null}
    </>
  );
}
