import { useEffect, useState } from "react";
import { api, money } from "./api";
import "./FinanceLegacyCenter.css";

const today = () => new Date().toISOString().slice(0, 10);
const clean = (form) =>
  Object.fromEntries([...new FormData(form)].filter(([, v]) => v !== ""));
function Dialog({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">OPERAÇÃO FINANCEIRA</span>
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
function Form({ kind, data, metadata, people, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    try {
      const endpoints = {
        voucher: "vouchers",
        check: "checks",
        transfer: "transfers",
        receipt: "receipts",
        budget: "budgets",
        "budget-structure": "budget-structures",
        master: "master-data",
      };
      await api(`/finance/${endpoints[kind]}`, {
        method: "POST",
        body: JSON.stringify(clean(e.currentTarget)),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  const accounts = metadata.accounts || [];
  return (
    <Dialog
      title={
        {
          voucher: "Novo vale ou adiantamento",
          check: "Emitir cheque",
          transfer: "Transferência entre contas",
          receipt: "Emitir recibo, RPA ou côngrua",
          budget: "Planejamento orçamentário",
          "budget-structure": "Estrutura orçamentária",
          master: "Cadastro financeiro",
        }[kind]
      }
      onClose={onClose}
    >
      <form className="record-form" onSubmit={save}>
        {kind === "voucher" ? (
          <>
            <label>
              Tipo
              <select name="voucherType">
                <option value="vale">Vale</option>
                <option value="advance">Adiantamento</option>
              </select>
            </label>
            <label>
              Pessoa cadastrada
              <select name="personId">
                <option value="">Sem vínculo</option>
                {people.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Beneficiário
              <input name="beneficiaryName" required />
            </label>
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
                Emissão
                <input
                  name="issuedOn"
                  type="date"
                  defaultValue={today()}
                  required
                />
              </label>
            </div>
            <label>
              Prestação de contas até
              <input name="dueOn" type="date" />
            </label>
          </>
        ) : null}
        {kind === "check" ? (
          <>
            <label>
              Conta bancária
              <select name="accountId" required>
                <option value="">Selecione</option>
                {accounts.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Número do cheque
                <input name="checkNumber" required />
              </label>
              <label>
                Favorecido
                <input name="payee" required />
              </label>
            </div>
            <label>
              Descrição
              <input name="description" />
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
                Emissão
                <input
                  name="issuedOn"
                  type="date"
                  defaultValue={today()}
                  required
                />
              </label>
            </div>
            <label>
              Bom para / vencimento
              <input name="dueOn" type="date" defaultValue={today()} required />
            </label>
          </>
        ) : null}
        {kind === "transfer" ? (
          <>
            <div className="form-grid">
              <label>
                Conta de origem
                <select name="fromAccountId" required>
                  <option value="">Selecione</option>
                  {accounts.map((x) => (
                    <option value={x.id} key={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Conta de destino
                <select name="toAccountId" required>
                  <option value="">Selecione</option>
                  {accounts.map((x) => (
                    <option value={x.id} key={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
                  name="transferredOn"
                  type="date"
                  defaultValue={today()}
                  required
                />
              </label>
            </div>
            <label>
              Referência
              <input name="reference" />
            </label>
          </>
        ) : null}
        {kind === "receipt" ? (
          <>
            <label>
              Tipo
              <select name="receiptType">
                <option value="receipt">Recibo avulso</option>
                <option value="rpa">RPA</option>
                <option value="congrua">Côngrua</option>
              </select>
            </label>
            <div className="form-grid">
              <label>
                Pessoa
                <select name="personId">
                  <option value="">Sem vínculo</option>
                  {people.map((x) => (
                    <option value={x.id} key={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Conta
                <select name="accountId" required>
                  <option value="">Selecione</option>
                  {accounts.map((x) => (
                    <option value={x.id} key={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-grid">
              <label>
                Recebedor / pagador
                <input name="recipientName" required />
              </label>
              <label>
                CPF/CNPJ
                <input name="recipientDocument" />
              </label>
            </div>
            <label>
              Descrição
              <input name="description" required />
            </label>
            <div className="form-grid">
              <label>
                Valor bruto
                <input
                  name="grossAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
              <label>
                Retenções
                <input
                  name="deductionAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                />
              </label>
            </div>
            <div className="form-grid">
              <label>
                Emissão
                <input
                  name="issuedOn"
                  type="date"
                  defaultValue={today()}
                  required
                />
              </label>
              <label>
                Forma
                <input name="paymentMethod" defaultValue="pix" />
              </label>
            </div>
          </>
        ) : null}
        {kind === "budget-structure" ? (
          <>
            <label>
              Conta superior
              <select name="parentId">
                <option value="">Sem conta superior</option>
                {data.structures.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.code} · {x.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Código
                <input name="code" required />
              </label>
              <label>
                Tipo
                <select name="kind">
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </label>
            </div>
            <label>
              Nome
              <input name="name" required />
            </label>
          </>
        ) : null}
        {kind === "budget" ? (
          <>
            <label>
              Estrutura
              <select name="structureId" required>
                <option value="">Selecione</option>
                {data.structures.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.code} · {x.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Ano
                <input
                  name="year"
                  type="number"
                  defaultValue={new Date().getFullYear()}
                  required
                />
              </label>
              <label>
                Mês
                <input name="month" type="number" min="1" max="12" required />
              </label>
            </div>
            <label>
              Valor planejado
              <input
                name="plannedAmount"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </label>
          </>
        ) : null}
        {kind === "master" ? (
          <>
            <label>
              Tipo
              <select name="dataType">
                <option value="payment_method">
                  Forma de pagamento/recebimento
                </option>
                <option value="document_type">Tipo de documento</option>
                <option value="supplier_group">Grupo de fornecedor</option>
                <option value="receipt_type">Tipo de recebimento</option>
                <option value="standard_entry">Lançamento padrão</option>
                <option value="cfop">CFOP</option>
                <option value="ofx_config">Configuração OFX</option>
              </select>
            </label>
            <div className="form-grid">
              <label>
                Código
                <input name="code" required />
              </label>
              <label>
                Nome
                <input name="name" required />
              </label>
            </div>
          </>
        ) : null}
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar</button>
        </div>
      </form>
    </Dialog>
  );
}

export default function FinanceLegacyCenter({ metadata, people }) {
  const [tab, setTab] = useState("cash"),
    [data, setData] = useState({
      vouchers: [],
      checks: [],
      transfers: [],
      receipts: [],
      structures: [],
      plans: [],
      masterData: [],
      budgetActual: [],
    }),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState("");
  const load = () =>
    api("/finance/operations")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  const saved = async () => {
    setDialog(null);
    await load();
  };
  const clearCheck = async (x) => {
    try {
      await api(`/finance/checks/${x.id}/clear`, {
        method: "POST",
        body: JSON.stringify({ clearedOn: today() }),
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <>
      <div className="finance-legacy-head">
        <div className="finance-tabs">
          <button
            className={tab === "cash" ? "active" : ""}
            onClick={() => setTab("cash")}
          >
            Vales e cheques
          </button>
          <button
            className={tab === "transfers" ? "active" : ""}
            onClick={() => setTab("transfers")}
          >
            Repasses
          </button>
          <button
            className={tab === "receipts" ? "active" : ""}
            onClick={() => setTab("receipts")}
          >
            Recibos, RPA e côngruas
          </button>
          <button
            className={tab === "budget" ? "active" : ""}
            onClick={() => setTab("budget")}
          >
            Orçamento
          </button>
          <button
            className={tab === "master" ? "active" : ""}
            onClick={() => setTab("master")}
          >
            Cadastros
          </button>
        </div>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
      {tab === "cash" ? (
        <>
          <div className="sub-action">
            <button className="secondary" onClick={() => setDialog("voucher")}>
              ＋ Vale / adiantamento
            </button>
            <button className="primary" onClick={() => setDialog("check")}>
              ＋ Cheque
            </button>
          </div>
          <div className="finance-dual">
            <div className="panel table-panel">
              <h3>Vales e adiantamentos</h3>
              <table>
                <thead>
                  <tr>
                    <th>Beneficiário</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vouchers.map((x) => (
                    <tr key={x.id}>
                      <td>{x.beneficiary_name}</td>
                      <td>{x.description}</td>
                      <td>{money(x.amount)}</td>
                      <td>{x.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="panel table-panel">
              <h3>Cheques emitidos</h3>
              <table>
                <thead>
                  <tr>
                    <th>Número / favorecido</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.checks.map((x) => (
                    <tr key={x.id}>
                      <td>
                        <strong>{x.check_number}</strong>
                        <small>{x.payee}</small>
                      </td>
                      <td>{new Date(x.due_on).toLocaleDateString("pt-BR")}</td>
                      <td>{money(x.amount)}</td>
                      <td>
                        {x.status === "issued" ? (
                          <button
                            className="text-btn"
                            onClick={() => clearCheck(x)}
                          >
                            Compensar
                          </button>
                        ) : (
                          x.status
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
      {tab === "transfers" ? (
        <>
          <div className="sub-action">
            <button className="primary" onClick={() => setDialog("transfer")}>
              ＋ Novo repasse
            </button>
          </div>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Origem</th>
                  <th>Destino</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.transfers.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {new Date(x.transferred_on).toLocaleDateString("pt-BR")}
                    </td>
                    <td>{x.from_account_name}</td>
                    <td>{x.to_account_name}</td>
                    <td>{x.description}</td>
                    <td>{money(x.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      {tab === "receipts" ? (
        <>
          <div className="sub-action">
            <button className="primary" onClick={() => setDialog("receipt")}>
              ＋ Emitir documento
            </button>
          </div>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Destinatário</th>
                  <th>Descrição</th>
                  <th>Bruto</th>
                  <th>Retenções</th>
                  <th>Líquido</th>
                </tr>
              </thead>
              <tbody>
                {data.receipts.map((x) => (
                  <tr key={x.id}>
                    <td>{x.receipt_number}</td>
                    <td>{x.receipt_type.toUpperCase()}</td>
                    <td>{x.recipient_name}</td>
                    <td>{x.description}</td>
                    <td>{money(x.gross_amount)}</td>
                    <td>{money(x.deduction_amount)}</td>
                    <td>{money(x.net_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      {tab === "budget" ? (
        <>
          <div className="sub-action">
            <button
              className="secondary"
              onClick={() => setDialog("budget-structure")}
            >
              ＋ Estrutura
            </button>
            <button className="primary" onClick={() => setDialog("budget")}>
              ＋ Planejamento
            </button>
          </div>
          <div className="budget-cards">
            <article>
              <span>Receitas planejadas</span>
              <strong>
                {money(
                  data.plans
                    .filter((x) => x.kind === "income")
                    .reduce((s, x) => s + Number(x.planned_amount), 0),
                )}
              </strong>
            </article>
            <article>
              <span>Despesas planejadas</span>
              <strong>
                {money(
                  data.plans
                    .filter((x) => x.kind === "expense")
                    .reduce((s, x) => s + Number(x.planned_amount), 0),
                )}
              </strong>
            </article>
            <article>
              <span>Receitas realizadas</span>
              <strong>
                {money(
                  data.budgetActual
                    .filter((x) => x.kind === "income")
                    .reduce((s, x) => s + Number(x.amount), 0),
                )}
              </strong>
            </article>
          </div>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Estrutura</th>
                  <th>Tipo</th>
                  <th>Planejado</th>
                </tr>
              </thead>
              <tbody>
                {data.plans.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {String(x.month).padStart(2, "0")}/{x.year}
                    </td>
                    <td>
                      {x.structure_code} · {x.structure_name}
                    </td>
                    <td>{x.kind === "income" ? "Receita" : "Despesa"}</td>
                    <td>{money(x.planned_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      {tab === "master" ? (
        <>
          <div className="sub-action">
            <button className="primary" onClick={() => setDialog("master")}>
              ＋ Novo cadastro
            </button>
          </div>
          <div className="master-grid">
            {data.masterData.map((x) => (
              <article className="panel" key={x.id}>
                <span>{x.data_type.replaceAll("_", " ")}</span>
                <strong>{x.code}</strong>
                <p>{x.name}</p>
              </article>
            ))}
          </div>
        </>
      ) : null}
      {dialog ? (
        <Form
          kind={dialog}
          data={data}
          metadata={metadata}
          people={people}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
    </>
  );
}
