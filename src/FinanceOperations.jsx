import { useEffect, useState } from "react";
import { api, money } from "./api";
import PaymentComplianceCenter from "./PaymentComplianceCenter";
import FinanceLegacyCenter from "./FinanceLegacyCenter";

function Dialog({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">FINANCEIRO</span>
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
function ObligationForm({ type, metadata, people, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    try {
      await api("/finance/obligations", {
        method: "POST",
        body: JSON.stringify({
          type,
          ...Object.fromEntries(new FormData(event.currentTarget)),
        }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog
      title={type === "payable" ? "Nova conta a pagar" : "Nova conta a receber"}
      onClose={onClose}
    >
      <form className="record-form" onSubmit={save}>
        <label>
          Descrição
          <input name="description" required />
        </label>
        <div className="form-grid">
          <label>
            Pessoa/fornecedor
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
            Documento
            <input name="documentNumber" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Categoria
            <select name="categoryId">
              <option value="">Selecione</option>
              {metadata.categories
                .filter(
                  (item) =>
                    item.kind ===
                      type
                        .replace("payable", "expense")
                        .replace("receivable", "income") ||
                    item.kind === "both",
                )
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Centro de custo
            <select name="costCenterId">
              <option value="">Selecione</option>
              {metadata.costCenters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
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
            Vencimento
            <input name="dueDate" type="date" required />
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
          <button className="primary">Salvar título</button>
        </div>
      </form>
    </Dialog>
  );
}
function SettlementForm({ obligation, metadata, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    try {
      await api(`/finance/obligations/${obligation.id}/settle`, {
        method: "POST",
        body: JSON.stringify(
          Object.fromEntries(new FormData(event.currentTarget)),
        ),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Liquidar título" onClose={onClose}>
      <div className="settlement-summary">
        <strong>{obligation.description}</strong>
        <span>Saldo: {money(obligation.remaining_amount)}</span>
      </div>
      <form className="record-form" onSubmit={save}>
        <label>
          Conta financeira
          <select name="accountId" required>
            <option value="">Selecione</option>
            {metadata.accounts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            Valor
            <input
              name="amount"
              type="number"
              min="0.01"
              max={obligation.remaining_amount}
              step="0.01"
              defaultValue={obligation.remaining_amount}
              required
            />
          </label>
          <label>
            Data
            <input
              name="settlementDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
        </div>
        <label>
          Forma de pagamento
          <select name="paymentMethod">
            <option value="pix">PIX</option>
            <option value="cash">Dinheiro</option>
            <option value="transfer">Transferência</option>
            <option value="card">Cartão</option>
            <option value="boleto">Boleto</option>
          </select>
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Confirmar liquidação</button>
        </div>
      </form>
    </Dialog>
  );
}
function ObligationTable({ rows, onSettle }) {
  return (
    <div className="panel table-panel">
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Pessoa</th>
            <th>Vencimento</th>
            <th>Categoria</th>
            <th>Valor</th>
            <th>Saldo</th>
            <th>Situação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <strong>{row.description}</strong>
                <small className="record-details">{row.document_number}</small>
              </td>
              <td>{row.person_name || "—"}</td>
              <td>{new Date(row.due_date).toLocaleDateString("pt-BR")}</td>
              <td>{row.category_name || "—"}</td>
              <td>{money(row.amount)}</td>
              <td>{money(row.remaining_amount)}</td>
              <td>
                <span className={`status ${row.display_status}`}>
                  {row.display_status}
                </span>
              </td>
              <td>
                {!["settled", "cancelled"].includes(row.status) ? (
                  <button className="text-btn" onClick={() => onSettle(row)}>
                    Liquidar
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? (
        <div className="registry-empty">
          <strong>Nenhum título encontrado</strong>
          <p>Cadastre contas com vencimento, categoria e centro de custo.</p>
        </div>
      ) : null}
    </div>
  );
}

export default function FinanceOperations() {
  const [tab, setTab] = useState("transactions"),
    [transactions, setTransactions] = useState([]),
    [obligations, setObligations] = useState([]),
    [metadata, setMetadata] = useState({
      accounts: [],
      categories: [],
      costCenters: [],
    }),
    [people, setPeople] = useState([]),
    [closings, setClosings] = useState([]),
    [newType, setNewType] = useState(null),
    [settlement, setSettlement] = useState(null),
    [error, setError] = useState("");
  const load = async () => {
    try {
      const [t, o, m, p, c] = await Promise.all([
        api("/financial/transactions"),
        api("/finance/obligations"),
        api("/finance/metadata"),
        api("/people"),
        api("/finance/closings"),
      ]);
      setTransactions(t.data);
      setObligations(o.data);
      setMetadata(m);
      setPeople(p.data);
      setClosings(c.data);
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const closePeriod = async (event) => {
    event.preventDefault();
    try {
      await api("/finance/closings", {
        method: "POST",
        body: JSON.stringify(
          Object.fromEntries(new FormData(event.currentTarget)),
        ),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };
  const filtered =
    tab === "payable"
      ? obligations.filter((item) => item.type === "payable")
      : obligations.filter((item) => item.type === "receivable");
  const openPayables = obligations
      .filter(
        (item) =>
          item.type === "payable" &&
          !["settled", "cancelled"].includes(item.status),
      )
      .reduce((sum, item) => sum + Number(item.remaining_amount), 0),
    openReceivables = obligations
      .filter(
        (item) =>
          item.type === "receivable" &&
          !["settled", "cancelled"].includes(item.status),
      )
      .reduce((sum, item) => sum + Number(item.remaining_amount), 0);
  return (
    <>
      <section className="module-header accent-green">
        <div>
          <span className="eyebrow">GESTÃO FINANCEIRA</span>
          <h1>Financeiro</h1>
          <p>
            Caixa, bancos, contas, cobranças, conciliação, fiscal e obrigações
            regulatórias.
          </p>
        </div>
        {["payable", "receivable"].includes(tab) ? (
          <button className="primary" onClick={() => setNewType(tab)}>
            ＋ Novo título
          </button>
        ) : null}
      </section>
      <div className="finance-summary">
        <article>
          <span>A pagar em aberto</span>
          <strong>{money(openPayables)}</strong>
        </article>
        <article>
          <span>A receber em aberto</span>
          <strong>{money(openReceivables)}</strong>
        </article>
        <article>
          <span>Movimentações</span>
          <strong>{transactions.length}</strong>
        </article>
        <article>
          <span>Períodos fechados</span>
          <strong>
            {closings.filter((item) => item.status === "closed").length}
          </strong>
        </article>
      </div>
      <div className="finance-tabs">
        <button
          className={tab === "transactions" ? "active" : ""}
          onClick={() => setTab("transactions")}
        >
          Movimentações
        </button>
        <button
          className={tab === "payable" ? "active" : ""}
          onClick={() => setTab("payable")}
        >
          A pagar
        </button>
        <button
          className={tab === "receivable" ? "active" : ""}
          onClick={() => setTab("receivable")}
        >
          A receber
        </button>
        <button
          className={tab === "closing" ? "active" : ""}
          onClick={() => setTab("closing")}
        >
          Fechamento
        </button>
        <button
          className={tab === "operations" ? "active" : ""}
          onClick={() => setTab("operations")}
        >
          Caixa, recibos e orçamento
        </button>
        <button
          className={tab === "payments" ? "active" : ""}
          onClick={() => setTab("payments")}
        >
          Pagamentos, fiscal e SPED
        </button>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
      {tab === "transactions" ? (
        <div className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Data</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.description}</strong>
                  </td>
                  <td>{item.kind === "income" ? "Entrada" : "Saída"}</td>
                  <td>{item.category}</td>
                  <td>
                    {new Date(item.occurred_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td
                    className={item.kind === "income" ? "positive" : "negative"}
                  >
                    {money(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {["payable", "receivable"].includes(tab) ? (
        <ObligationTable rows={filtered} onSettle={setSettlement} />
      ) : null}
      {tab === "closing" ? (
        <div className="closing-grid">
          <div className="panel closing-form">
            <h3>Fechar período</h3>
            <p>Impede novos lançamentos e liquidações dentro do intervalo.</p>
            <form className="record-form" onSubmit={closePeriod}>
              <label>
                Início
                <input name="periodStart" type="date" required />
              </label>
              <label>
                Fim
                <input name="periodEnd" type="date" required />
              </label>
              <button className="primary">Fechar período</button>
            </form>
          </div>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Situação</th>
                  <th>Responsável</th>
                </tr>
              </thead>
              <tbody>
                {closings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(item.period_start).toLocaleDateString("pt-BR")}{" "}
                      a {new Date(item.period_end).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      <span className="status active">{item.status}</span>
                    </td>
                    <td>{item.closed_by_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {tab === "payments" ? <PaymentComplianceCenter /> : null}
      {tab === "operations" ? (
        <FinanceLegacyCenter metadata={metadata} people={people} />
      ) : null}
      {newType ? (
        <ObligationForm
          type={newType}
          metadata={metadata}
          people={people}
          onClose={() => setNewType(null)}
          onSaved={async () => {
            setNewType(null);
            await load();
          }}
        />
      ) : null}
      {settlement ? (
        <SettlementForm
          obligation={settlement}
          metadata={metadata}
          onClose={() => setSettlement(null)}
          onSaved={async () => {
            setSettlement(null);
            await load();
          }}
        />
      ) : null}
    </>
  );
}
