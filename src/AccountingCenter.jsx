import { useEffect, useMemo, useState } from "react";
import { api, money } from "./api";
import "./AccountingCenter.css";

const today = () => new Date().toISOString().slice(0, 10);
function Dialog({ title, onClose, children, wide = false }) {
  return (
    <div className="modal-backdrop">
      <div className={`modal-card accounting-dialog ${wide ? "wide" : ""}`}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">CONTABILIDADE</span>
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
function AccountForm({ accounts, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    data.acceptsEntries = Boolean(data.acceptsEntries);
    try {
      await api("/accounting/accounts", {
        method: "POST",
        body: JSON.stringify(data),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Nova conta contábil" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <div className="form-grid">
          <label>
            Código
            <input name="code" required placeholder="Ex.: 5.2.01" />
          </label>
          <label>
            Conta superior
            <select name="parentId">
              <option value="">Sem conta superior</option>
              {accounts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Nome
          <input name="name" required />
        </label>
        <div className="form-grid">
          <label>
            Tipo
            <select name="accountType">
              <option value="asset">Ativo</option>
              <option value="liability">Passivo</option>
              <option value="equity">Patrimônio líquido</option>
              <option value="revenue">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </label>
          <label>
            Natureza
            <select name="nature">
              <option value="debit">Devedora</option>
              <option value="credit">Credora</option>
            </select>
          </label>
        </div>
        <label className="inline-check">
          <input name="acceptsEntries" type="checkbox" defaultChecked /> Aceita
          lançamentos
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar conta</button>
        </div>
      </form>
    </Dialog>
  );
}
function EntryForm({ accounts, costCenters, onClose, onSaved }) {
  const [lines, setLines] = useState([
      { accountId: "", description: "", debit: "", credit: "" },
      { accountId: "", description: "", debit: "", credit: "" },
    ]),
    [error, setError] = useState("");
  const update = (index, key, value) =>
    setLines((current) =>
      current.map((line, i) =>
        i === index ? { ...line, [key]: value } : line,
      ),
    );
  const totals = lines.reduce(
    (sum, line) => ({
      debit: sum.debit + Number(line.debit || 0),
      credit: sum.credit + Number(line.credit || 0),
    }),
    { debit: 0, credit: 0 },
  );
  const save = async (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api("/accounting/entries", {
        method: "POST",
        body: JSON.stringify({ ...fields, lines }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Novo lançamento contábil" onClose={onClose} wide>
      <form className="record-form" onSubmit={save}>
        <div className="form-grid">
          <label>
            Data
            <input
              name="entryDate"
              type="date"
              defaultValue={today()}
              required
            />
          </label>
          <label>
            Documento
            <input name="documentNumber" />
          </label>
        </div>
        <label>
          Histórico
          <input name="memo" required />
        </label>
        <div className="accounting-lines">
          <div className="line-head">
            <span>Conta</span>
            <span>Centro de custo</span>
            <span>Descrição</span>
            <span>Débito</span>
            <span>Crédito</span>
            <span />
          </div>
          {lines.map((line, index) => (
            <div className="line-row" key={index}>
              <select
                value={line.accountId}
                onChange={(e) => update(index, "accountId", e.target.value)}
                required
                aria-label={`Conta da partida ${index + 1}`}
              >
                <option value="">Selecione</option>
                {accounts
                  .filter((item) => item.accepts_entries)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} · {item.name}
                    </option>
                  ))}
              </select>
              <select
                value={line.costCenterId || ""}
                onChange={(e) => update(index, "costCenterId", e.target.value)}
                aria-label={`Centro de custo da partida ${index + 1}`}
              >
                <option value="">Sem rateio</option>
                {costCenters.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} · {item.name}
                  </option>
                ))}
              </select>
              <input
                value={line.description}
                onChange={(e) => update(index, "description", e.target.value)}
                aria-label={`Descrição da partida ${index + 1}`}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.debit}
                onChange={(e) => update(index, "debit", e.target.value)}
                aria-label={`Débito da partida ${index + 1}`}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.credit}
                onChange={(e) => update(index, "credit", e.target.value)}
                aria-label={`Crédito da partida ${index + 1}`}
              />
              <button
                type="button"
                disabled={lines.length <= 2}
                onClick={() =>
                  setLines((current) => current.filter((_, i) => i !== index))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="text-btn add-line"
          onClick={() =>
            setLines((current) => [
              ...current,
              { accountId: "", description: "", debit: "", credit: "" },
            ])
          }
        >
          ＋ Adicionar partida
        </button>
        <div
          className={`entry-totals ${Math.round(totals.debit * 100) === Math.round(totals.credit * 100) && totals.debit > 0 ? "balanced" : "unbalanced"}`}
        >
          <span>
            Débitos <strong>{money(totals.debit)}</strong>
          </span>
          <span>
            Créditos <strong>{money(totals.credit)}</strong>
          </span>
          <b>
            {Math.round(totals.debit * 100) ===
              Math.round(totals.credit * 100) && totals.debit > 0
              ? "✓ Balanceado"
              : "Diferença " + money(Math.abs(totals.debit - totals.credit))}
          </b>
        </div>
        <label>
          Situação
          <select name="status">
            <option value="draft">Salvar como rascunho</option>
            <option value="posted">Contabilizar agora</option>
          </select>
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar lançamento</button>
        </div>
      </form>
    </Dialog>
  );
}

const statementNames = {
  "general-ledger": "Livro razão",
  "cash-book": "Livro caixa",
  "balance-sheet": "Balanço patrimonial",
  "income-statement": "DRE",
  "cash-flow": "DFC",
  "equity-changes": "DMPL",
};
const cellValue = (value, key) => {
  if (value == null) return "—";
  if (
    [
      "debit",
      "credit",
      "balance",
      "opening",
      "closing",
      "inflow",
      "outflow",
      "variation",
    ].includes(key)
  )
    return money(value);
  if (key === "entry_date") return new Date(value).toLocaleDateString("pt-BR");
  const labels = {
    asset: "Ativo",
    liability: "Passivo",
    equity: "Patrimônio líquido",
    revenue: "Receita",
    expense: "Despesa",
  };
  return labels[value] || value;
};
function StatementsPanel({ period }) {
  const [type, setType] = useState("balance-sheet"),
    [report, setReport] = useState(null),
    [error, setError] = useState("");
  const load = async (next = type) => {
    try {
      setError("");
      setType(next);
      setReport(
        await api(
          `/accounting/statements/${next}?from=${period.from}&to=${period.to}`,
        ),
      );
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    load();
  }, [period.from, period.to]);
  return (
    <div className="accounting-statements">
      <div className="statement-picker">
        {Object.entries(statementNames).map(([key, label]) => (
          <button
            key={key}
            className={type === key ? "active" : ""}
            onClick={() => load(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {error ? <div className="form-error">{error}</div> : null}
      {report ? (
        <div className="panel table-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">DEMONSTRAÇÃO CONTÁBIL</span>
              <h3>{statementNames[type]}</h3>
              <p>
                {new Date(period.from + "T12:00:00").toLocaleDateString(
                  "pt-BR",
                )}{" "}
                a{" "}
                {new Date(period.to + "T12:00:00").toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                {report.columns.map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.data.map((row, index) => (
                <tr key={index}>
                  {Object.entries(row).map(([key, value]) => (
                    <td key={key}>{cellValue(value, key)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!report.data.length ? (
            <p className="empty-copy">
              Nenhum movimento contabilizado no período.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
function SettingsPanel({ accounts }) {
  const [data, setData] = useState({
      exercises: [],
      histories: [],
      professionals: [],
      openingBalances: [],
      disclosures: [],
    }),
    [kind, setKind] = useState("exercises"),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const load = () =>
    api("/accounting/settings")
      .then(setData)
      .catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);
  const save = async (event) => {
    event.preventDefault();
    const form = Object.fromEntries(
      [...new FormData(event.currentTarget)].filter(([, v]) => v !== ""),
    );
    try {
      setError("");
      await api(`/accounting/${kind}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      event.currentTarget.reset();
      setMessage("Cadastro contábil salvo.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };
  const selectedExercise =
    data.exercises.find((x) => x.status === "open")?.id ||
    data.exercises[0]?.id;
  return (
    <div className="accounting-settings-grid">
      <form className="panel record-form" onSubmit={save}>
        <span className="eyebrow">CONFIGURAÇÃO</span>
        <h3>Novo cadastro contábil</h3>
        <label>
          Tipo
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="exercises">Exercício</option>
            <option value="histories">Histórico padrão</option>
            <option value="professionals">Contabilista / representante</option>
            <option value="opening-balances">Saldo de abertura</option>
            <option value="disclosures">Nota explicativa</option>
          </select>
        </label>
        {kind === "exercises" ? (
          <>
            <label>
              Ano
              <input name="year" type="number" min="1900" max="2200" required />
            </label>
            <div className="form-grid">
              <label>
                Início
                <input name="startsOn" type="date" required />
              </label>
              <label>
                Fim
                <input name="endsOn" type="date" required />
              </label>
            </div>
          </>
        ) : null}
        {kind === "histories" ? (
          <div className="form-grid">
            <label>
              Código
              <input name="code" required />
            </label>
            <label>
              Descrição
              <input name="description" required />
            </label>
          </div>
        ) : null}
        {kind === "professionals" ? (
          <>
            <label>
              Função
              <select name="role">
                <option value="accountant">Contabilista</option>
                <option value="legal_representative">
                  Representante legal
                </option>
              </select>
            </label>
            <label>
              Nome
              <input name="name" required />
            </label>
            <div className="form-grid">
              <label>
                CPF/CNPJ
                <input name="document" />
              </label>
              <label>
                Registro profissional
                <input name="registrationNumber" />
              </label>
            </div>
            <div className="form-grid">
              <label>
                UF do registro
                <input name="registrationState" maxLength="2" />
              </label>
              <label>
                E-mail
                <input name="email" type="email" />
              </label>
            </div>
          </>
        ) : null}
        {kind === "opening-balances" ? (
          <>
            <input
              type="hidden"
              name="exerciseId"
              value={selectedExercise || ""}
            />
            <label>
              Conta
              <select name="accountId" required>
                <option value="">Selecione</option>
                {accounts
                  .filter((x) => x.accepts_entries)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.code} · {x.name}
                    </option>
                  ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Débito
                <input
                  name="debit"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                />
              </label>
              <label>
                Crédito
                <input
                  name="credit"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                />
              </label>
            </div>
          </>
        ) : null}
        {kind === "disclosures" ? (
          <>
            <input
              type="hidden"
              name="exerciseId"
              value={selectedExercise || ""}
            />
            <label>
              Demonstração
              <select name="statementType">
                <option value="general">Geral</option>
                <option value="balance_sheet">Balanço patrimonial</option>
                <option value="income_statement">DRE</option>
                <option value="cash_flow">DFC</option>
                <option value="equity_changes">DMPL</option>
              </select>
            </label>
            <label>
              Título
              <input name="title" required />
            </label>
            <label>
              Conteúdo
              <textarea name="content" rows="5" required />
            </label>
          </>
        ) : null}
        {message ? <div className="success-banner">{message}</div> : null}
        {error ? <div className="form-error">{error}</div> : null}
        <button className="primary">Salvar</button>
      </form>
      <div className="accounting-config-lists">
        <section className="panel">
          <span className="eyebrow">EXERCÍCIOS</span>
          {data.exercises.map((x) => (
            <div className="config-row" key={x.id}>
              <strong>{x.year}</strong>
              <span>{x.status === "open" ? "Aberto" : "Encerrado"}</span>
            </div>
          ))}
        </section>
        <section className="panel">
          <span className="eyebrow">RESPONSÁVEIS</span>
          {data.professionals.map((x) => (
            <div className="config-row" key={x.id}>
              <strong>{x.name}</strong>
              <span>
                {x.role === "accountant"
                  ? "Contabilista"
                  : "Representante legal"}
              </span>
            </div>
          ))}
        </section>
        <section className="panel">
          <span className="eyebrow">NOTAS EXPLICATIVAS</span>
          {data.disclosures.map((x) => (
            <div className="config-row" key={x.id}>
              <strong>{x.title}</strong>
              <span>{x.exercise_year}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default function AccountingCenter() {
  const [tab, setTab] = useState("journal"),
    [accounts, setAccounts] = useState([]),
    [entries, setEntries] = useState([]),
    [trial, setTrial] = useState([]),
    [costCenters, setCostCenters] = useState([]),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState(""),
    [period, setPeriod] = useState({ from: "2026-01-01", to: "2026-12-31" }),
    [imported, setImported] = useState("");
  const load = async () => {
    try {
      const [a, e, t, m] = await Promise.all([
        api("/accounting/accounts"),
        api("/accounting/entries"),
        api(`/accounting/trial-balance?from=${period.from}&to=${period.to}`),
        api("/finance/metadata"),
      ]);
      setAccounts(a.data);
      setEntries(e.data);
      setTrial(t.data);
      setCostCenters(m.costCenters);
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    load();
  }, [period.from, period.to]);
  const totals = useMemo(
    () =>
      trial.reduce(
        (s, x) => ({
          debit: s.debit + Number(x.debit),
          credit: s.credit + Number(x.credit),
        }),
        { debit: 0, credit: 0 },
      ),
    [trial],
  );
  const save = async () => {
    setDialog(null);
    await load();
  };
  const post = async (id) => {
    try {
      await api(`/accounting/entries/${id}/post`, {
        method: "POST",
        body: "{}",
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };
  const importFinancial = async () => {
    try {
      const result = await api("/accounting/import-financial", {
        method: "POST",
        body: JSON.stringify(period),
      });
      setImported(`${result.imported} movimentações integradas.`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <>
      <section className="module-header accounting-header">
        <div>
          <span className="eyebrow">ESCRITURAÇÃO E CONTROLE</span>
          <h1>Contábil</h1>
          <p>
            Plano de contas, partidas dobradas, diário, balancete e integração
            financeira.
          </p>
        </div>
        <div className="module-actions">
          <button className="secondary" onClick={importFinancial}>
            ↻ Integrar financeiro
          </button>
          <button className="primary" onClick={() => setDialog("entry")}>
            ＋ Lançamento
          </button>
        </div>
      </section>
      <div className="accounting-summary">
        <article>
          <span>Débitos no período</span>
          <strong>{money(totals.debit)}</strong>
        </article>
        <article>
          <span>Créditos no período</span>
          <strong>{money(totals.credit)}</strong>
        </article>
        <article>
          <span>Lançamentos contabilizados</span>
          <strong>{entries.filter((x) => x.status === "posted").length}</strong>
        </article>
        <article>
          <span>Rascunhos</span>
          <strong>{entries.filter((x) => x.status === "draft").length}</strong>
        </article>
      </div>
      {imported ? <div className="success-banner">{imported}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}
      <div className="accounting-toolbar">
        <div className="finance-tabs">
          <button
            className={tab === "journal" ? "active" : ""}
            onClick={() => setTab("journal")}
          >
            Livro diário
          </button>
          <button
            className={tab === "accounts" ? "active" : ""}
            onClick={() => setTab("accounts")}
          >
            Plano de contas
          </button>
          <button
            className={tab === "trial" ? "active" : ""}
            onClick={() => setTab("trial")}
          >
            Balancete
          </button>
          <button
            className={tab === "statements" ? "active" : ""}
            onClick={() => setTab("statements")}
          >
            Demonstrações
          </button>
          <button
            className={tab === "settings" ? "active" : ""}
            onClick={() => setTab("settings")}
          >
            Configurações
          </button>
        </div>
        <div className="period-fields">
          <input
            type="date"
            value={period.from}
            onChange={(e) => setPeriod((p) => ({ ...p, from: e.target.value }))}
          />
          <span>a</span>
          <input
            type="date"
            value={period.to}
            onChange={(e) => setPeriod((p) => ({ ...p, to: e.target.value }))}
          />
        </div>
      </div>
      {tab === "journal" ? (
        <div className="panel table-panel accounting-table">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Documento / histórico</th>
                <th>Origem</th>
                <th>Partidas</th>
                <th>Débito</th>
                <th>Crédito</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((item) => (
                <tr key={item.id}>
                  <td>
                    {new Date(item.entry_date).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <strong>{item.memo}</strong>
                    <small className="record-details">
                      {item.document_number}
                    </small>
                  </td>
                  <td>{item.source}</td>
                  <td>{item.line_count}</td>
                  <td>{money(item.total_debit)}</td>
                  <td>{money(item.total_credit)}</td>
                  <td>
                    <span className={`status ${item.status}`}>
                      {item.status === "posted"
                        ? "Contabilizado"
                        : item.status === "draft"
                          ? "Rascunho"
                          : "Estornado"}
                    </span>
                  </td>
                  <td>
                    {item.status === "draft" ? (
                      <button
                        className="text-btn"
                        onClick={() => post(item.id)}
                      >
                        Contabilizar
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "accounts" ? (
        <>
          <div className="sub-action">
            <button className="secondary" onClick={() => setDialog("account")}>
              ＋ Nova conta
            </button>
          </div>
          <div className="panel account-tree">
            {accounts.map((item) => (
              <div
                className={`account-row ${item.accepts_entries ? "posting" : "synthetic"}`}
                key={item.id}
              >
                <code>{item.code}</code>
                <strong>{item.name}</strong>
                <span>{item.account_type}</span>
                <small>
                  {item.nature === "debit" ? "Devedora" : "Credora"} ·{" "}
                  {item.accepts_entries ? "Analítica" : "Sintética"}
                </small>
              </div>
            ))}
          </div>
        </>
      ) : null}
      {tab === "trial" ? (
        <div className="panel table-panel accounting-table">
          <table>
            <thead>
              <tr>
                <th>Conta</th>
                <th>Nome</th>
                <th>Natureza</th>
                <th>Débitos</th>
                <th>Créditos</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {trial.map((item) => (
                <tr key={item.id}>
                  <td>
                    <code>{item.code}</code>
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.nature === "debit" ? "Devedora" : "Credora"}</td>
                  <td>{money(item.debit)}</td>
                  <td>{money(item.credit)}</td>
                  <td>{money(item.balance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="3">Totais</th>
                <th>{money(totals.debit)}</th>
                <th>{money(totals.credit)}</th>
                <th>
                  {Math.round(totals.debit * 100) ===
                  Math.round(totals.credit * 100)
                    ? "Balanceado"
                    : "Divergente"}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : null}
      {tab === "statements" ? <StatementsPanel period={period} /> : null}
      {tab === "settings" ? <SettingsPanel accounts={accounts} /> : null}
      {dialog === "entry" ? (
        <EntryForm
          accounts={accounts}
          costCenters={costCenters}
          onClose={() => setDialog(null)}
          onSaved={save}
        />
      ) : null}
      {dialog === "account" ? (
        <AccountForm
          accounts={accounts}
          onClose={() => setDialog(null)}
          onSaved={save}
        />
      ) : null}
    </>
  );
}
