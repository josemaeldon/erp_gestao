import { useEffect, useState } from "react";
import { api, money } from "./api";
import "./AssetOperations.css";

const clean = (f) =>
  Object.fromEntries(
    [...new FormData(f)]
      .filter(([, v]) => v !== "")
      .map(([key, value]) => [
        key,
        key === "startsAt" || key === "endsAt"
          ? new Date(value).toISOString()
          : value,
      ]),
  );
function Dialog({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card asset-dialog">
        <div className="modal-heading">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Form({ kind, assets, people, onClose, onSaved }) {
  const [assetId, setAssetId] = useState(""),
    [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        kind === "reservation"
          ? "/assets/reservations"
          : kind === "lease"
            ? "/assets/leases"
            : `/assets/${assetId}/${kind}`;
      await api(endpoint, {
        method: "POST",
        body: JSON.stringify({
          ...clean(e.currentTarget),
          assetId: assetId || undefined,
        }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  const picker = (
    <label>
      Bem
      <select
        value={assetId}
        onChange={(e) => setAssetId(e.target.value)}
        required
      >
        <option value="">Selecione</option>
        {assets
          .filter((x) =>
            kind === "lease"
              ? x.asset_type === "property"
              : kind === "drivers"
                ? x.asset_type === "vehicle"
                : x.status === "active",
          )
          .map((x) => (
            <option key={x.id} value={x.id}>
              {x.asset_tag} · {x.name}
            </option>
          ))}
      </select>
    </label>
  );
  return (
    <Dialog
      title={
        {
          reservation: "Reservar bem",
          lease: "Contrato de locação",
          accessories: "Adicionar acessório",
          "legal-documents": "Documento legal",
          insurance: "Apólice de seguro",
          drivers: "Vincular condutor",
        }[kind]
      }
      onClose={onClose}
    >
      <form className="record-form" onSubmit={save}>
        {picker}
        {kind === "reservation" ? (
          <>
            <label>
              Solicitante
              <select name="requesterId">
                <option value="">Sem vínculo</option>
                {people.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Título
              <input name="title" required />
            </label>
            <div className="form-grid">
              <label>
                Início
                <input name="startsAt" type="datetime-local" required />
              </label>
              <label>
                Fim
                <input name="endsAt" type="datetime-local" required />
              </label>
            </div>
            <label>
              Finalidade
              <textarea name="purpose" />
            </label>
          </>
        ) : null}
        {kind === "lease" ? (
          <>
            <label>
              Locatário cadastrado
              <select name="tenantPersonId">
                <option value="">Sem vínculo</option>
                {people.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Nome do locatário
                <input name="tenantName" required />
              </label>
              <label>
                Documento
                <input name="tenantDocument" />
              </label>
            </div>
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
            <div className="form-grid">
              <label>
                Aluguel mensal
                <input
                  name="monthlyAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
              <label>
                Dia do vencimento
                <input
                  name="dueDay"
                  type="number"
                  min="1"
                  max="28"
                  defaultValue="10"
                />
              </label>
            </div>
            <div className="form-grid">
              <label>
                Índice de reajuste
                <input name="adjustmentIndex" defaultValue="IPCA" />
              </label>
              <label>
                Caução
                <input
                  name="depositAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                />
              </label>
            </div>
          </>
        ) : null}
        {kind === "accessories" ? (
          <>
            <label>
              Acessório
              <input name="name" required />
            </label>
            <div className="form-grid">
              <label>
                Número de série
                <input name="serialNumber" />
              </label>
              <label>
                Quantidade
                <input
                  name="quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  defaultValue="1"
                />
              </label>
            </div>
            <label>
              Estado de conservação
              <input name="condition" />
            </label>
          </>
        ) : null}
        {kind === "legal-documents" ? (
          <>
            <div className="form-grid">
              <label>
                Tipo
                <input name="documentType" required />
              </label>
              <label>
                Número
                <input name="documentNumber" />
              </label>
            </div>
            <label>
              Cartório / órgão
              <input name="registryOffice" />
            </label>
            <div className="form-grid">
              <label>
                Emissão
                <input name="issuedOn" type="date" />
              </label>
              <label>
                Validade
                <input name="expiresOn" type="date" />
              </label>
            </div>
            <label>
              Referência
              <input name="reference" />
            </label>
          </>
        ) : null}
        {kind === "insurance" ? (
          <>
            <div className="form-grid">
              <label>
                Seguradora
                <input name="insurer" required />
              </label>
              <label>
                Apólice
                <input name="policyNumber" required />
              </label>
            </div>
            <label>
              Cobertura
              <textarea name="coverage" />
            </label>
            <div className="form-grid">
              <label>
                Valor segurado
                <input
                  name="insuredAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                />
              </label>
              <label>
                Prêmio
                <input
                  name="premiumAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                />
              </label>
            </div>
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
        {kind === "drivers" ? (
          <>
            <label>
              Condutor
              <select name="personId" required>
                <option value="">Selecione</option>
                {people.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                CNH
                <input name="licenseNumber" required />
              </label>
              <label>
                Categoria
                <input name="licenseCategory" />
              </label>
            </div>
            <div className="form-grid">
              <label>
                Validade
                <input name="licenseExpiresOn" type="date" />
              </label>
              <label>
                Atribuição
                <input name="assignedOn" type="date" required />
              </label>
            </div>
          </>
        ) : null}
        {error && <div className="form-error">{error}</div>}
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

export default function AssetOperations({ assets, people }) {
  const [tab, setTab] = useState("reservations"),
    [data, setData] = useState({
      reservations: [],
      leases: [],
      installments: [],
      documents: [],
      policies: [],
      drivers: [],
      accessories: [],
    }),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState("");
  const load = () =>
    api("/assets/operations")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  const saved = async () => {
    setDialog(null);
    await load();
  };
  const status = async (x) => {
    await api(`/assets/reservations/${x.id}/status`, {
      method: "POST",
      body: JSON.stringify({
        status:
          x.status === "requested"
            ? "approved"
            : x.status === "approved"
              ? "checked_out"
              : "returned",
      }),
    });
    load();
  };
  return (
    <>
      <div className="asset-operation-actions">
        <div className="finance-tabs">
          <button
            className={tab === "reservations" ? "active" : ""}
            onClick={() => setTab("reservations")}
          >
            Reservas
          </button>
          <button
            className={tab === "leases" ? "active" : ""}
            onClick={() => setTab("leases")}
          >
            Locações
          </button>
          <button
            className={tab === "documents" ? "active" : ""}
            onClick={() => setTab("documents")}
          >
            Documentos e seguros
          </button>
          <button
            className={tab === "vehicles" ? "active" : ""}
            onClick={() => setTab("vehicles")}
          >
            Veículos e acessórios
          </button>
        </div>
        <button
          className="primary"
          onClick={() =>
            setDialog(
              tab === "reservations"
                ? "reservation"
                : tab === "leases"
                  ? "lease"
                  : tab === "documents"
                    ? "legal-documents"
                    : "drivers",
            )
          }
        >
          ＋ Novo
        </button>
      </div>
      {error && <div className="form-error">{error}</div>}
      {tab === "reservations" ? (
        <div className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Período</th>
                <th>Bem</th>
                <th>Reserva</th>
                <th>Solicitante</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.reservations.map((x) => (
                <tr key={x.id}>
                  <td>
                    {new Date(x.starts_at).toLocaleString("pt-BR")}
                    <small>
                      até {new Date(x.ends_at).toLocaleString("pt-BR")}
                    </small>
                  </td>
                  <td>
                    {x.asset_tag} · {x.asset_name}
                  </td>
                  <td>
                    <strong>{x.title}</strong>
                    <small>{x.purpose}</small>
                  </td>
                  <td>{x.requester_name || "—"}</td>
                  <td>
                    <span className={`status ${x.status}`}>{x.status}</span>
                  </td>
                  <td>
                    {["requested", "approved", "checked_out"].includes(
                      x.status,
                    ) && (
                      <button className="text-btn" onClick={() => status(x)}>
                        {x.status === "requested"
                          ? "Aprovar"
                          : x.status === "approved"
                            ? "Entregar"
                            : "Devolver"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "leases" ? (
        <>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Imóvel</th>
                  <th>Locatário</th>
                  <th>Vigência</th>
                  <th>Aluguel</th>
                  <th>Parcelas</th>
                </tr>
              </thead>
              <tbody>
                {data.leases.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <strong>{x.asset_name}</strong>
                      <small>{x.asset_tag}</small>
                    </td>
                    <td>{x.tenant_name}</td>
                    <td>
                      {new Date(x.starts_on).toLocaleDateString("pt-BR")} a{" "}
                      {new Date(x.ends_on).toLocaleDateString("pt-BR")}
                    </td>
                    <td>{money(x.monthly_amount)}</td>
                    <td>
                      {x.settled_count}/{x.installment_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>Parcelas no contas a receber</h3>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Vencimento</th>
                  <th>Imóvel / locatário</th>
                  <th>Valor</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {data.installments.map((x) => (
                  <tr key={x.id}>
                    <td>{new Date(x.due_date).toLocaleDateString("pt-BR")}</td>
                    <td>
                      {x.asset_name} · {x.tenant_name}
                    </td>
                    <td>{money(x.amount)}</td>
                    <td>
                      <span className={`status ${x.obligation_status}`}>
                        {x.obligation_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      {tab === "documents" ? (
        <>
          <div className="sub-action">
            <button
              className="secondary"
              onClick={() => setDialog("legal-documents")}
            >
              ＋ Documento legal
            </button>
            <button className="primary" onClick={() => setDialog("insurance")}>
              ＋ Apólice
            </button>
          </div>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Bem</th>
                  <th>Documento</th>
                  <th>Cartório</th>
                  <th>Validade</th>
                </tr>
              </thead>
              <tbody>
                {data.documents.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {x.asset_tag} · {x.asset_name}
                    </td>
                    <td>
                      <strong>{x.document_type}</strong>
                      <small>{x.document_number}</small>
                    </td>
                    <td>{x.registry_office || "—"}</td>
                    <td>
                      {x.expires_on
                        ? new Date(x.expires_on).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>Apólices</h3>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Bem</th>
                  <th>Seguradora / apólice</th>
                  <th>Cobertura</th>
                  <th>Valor</th>
                  <th>Vigência</th>
                </tr>
              </thead>
              <tbody>
                {data.policies.map((x) => (
                  <tr key={x.id}>
                    <td>{x.asset_name}</td>
                    <td>
                      <strong>{x.insurer}</strong>
                      <small>{x.policy_number}</small>
                    </td>
                    <td>{x.coverage || "—"}</td>
                    <td>{money(x.insured_amount)}</td>
                    <td>{new Date(x.ends_on).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      {tab === "vehicles" ? (
        <>
          <div className="sub-action">
            <button
              className="secondary"
              onClick={() => setDialog("accessories")}
            >
              ＋ Acessório
            </button>
            <button className="primary" onClick={() => setDialog("drivers")}>
              ＋ Condutor
            </button>
          </div>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Veículo</th>
                  <th>Condutor</th>
                  <th>CNH</th>
                  <th>Categoria</th>
                  <th>Validade</th>
                </tr>
              </thead>
              <tbody>
                {data.drivers.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {x.asset_tag} · {x.asset_name}
                    </td>
                    <td>
                      <strong>{x.person_name}</strong>
                    </td>
                    <td>{x.license_number}</td>
                    <td>{x.license_category || "—"}</td>
                    <td>
                      {x.license_expires_on
                        ? new Date(x.license_expires_on).toLocaleDateString(
                            "pt-BR",
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>Acessórios</h3>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Bem</th>
                  <th>Acessório</th>
                  <th>Série</th>
                  <th>Quantidade</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.accessories.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {x.asset_tag} · {x.asset_name}
                    </td>
                    <td>
                      <strong>{x.name}</strong>
                    </td>
                    <td>{x.serial_number || "—"}</td>
                    <td>{x.quantity}</td>
                    <td>{x.condition || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      {dialog && (
        <Form
          kind={dialog}
          assets={assets}
          people={people}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      )}
    </>
  );
}
