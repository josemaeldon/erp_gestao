import { useEffect, useState } from "react";
import { api, money } from "./api";
const today = () => new Date().toISOString().slice(0, 10);
function Dialog({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
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
export default function CemeteryServices({ graves, people }) {
  const [data, setData] = useState({ catalog: [], orders: [] }),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState("");
  const load = () =>
    api("/cemetery/services")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      await api(
        dialog === "catalog"
          ? "/cemetery/service-catalog"
          : "/cemetery/service-orders",
        {
          method: "POST",
          body: JSON.stringify(
            Object.fromEntries(
              [...new FormData(e.currentTarget)].filter(([, v]) => v !== ""),
            ),
          ),
        },
      );
      setDialog(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };
  const complete = async (x) => {
    await api(`/cemetery/service-orders/${x.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "completed" }),
    });
    load();
  };
  return (
    <>
      <div className="sub-action">
        <button className="secondary" onClick={() => setDialog("catalog")}>
          ＋ Tipo de serviço
        </button>
        <button className="primary" onClick={() => setDialog("order")}>
          ＋ Ordem e recibo
        </button>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Recibo</th>
              <th>Data</th>
              <th>Serviço</th>
              <th>Solicitante</th>
              <th>Sepultura</th>
              <th>Valor</th>
              <th>Situação</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((x) => (
              <tr key={x.id}>
                <td>REC-{x.receipt_number}</td>
                <td>{new Date(x.ordered_on).toLocaleDateString("pt-BR")}</td>
                <td>{x.service_name}</td>
                <td>{x.requester_name}</td>
                <td>{x.grave_code || "—"}</td>
                <td>{money(x.amount)}</td>
                <td>{x.status}</td>
                <td>
                  {x.status !== "completed" && x.status !== "cancelled" ? (
                    <button className="text-btn" onClick={() => complete(x)}>
                      Concluir
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dialog ? (
        <Dialog
          title={
            dialog === "catalog" ? "Cadastrar serviço" : "Nova ordem de serviço"
          }
          onClose={() => setDialog(null)}
        >
          <form className="record-form" onSubmit={save}>
            {dialog === "catalog" ? (
              <>
                <div className="form-grid">
                  <label>
                    Código
                    <input name="code" required />
                  </label>
                  <label>
                    Preço
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                    />
                  </label>
                </div>
                <label>
                  Serviço
                  <input name="name" required />
                </label>
              </>
            ) : (
              <>
                <label>
                  Serviço
                  <select name="serviceId" required>
                    <option value="">Selecione</option>
                    {data.catalog.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name} · {money(x.price)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Sepultura
                  <select name="graveId">
                    <option value="">Sem vínculo</option>
                    {graves.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.code}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Pessoa
                  <select name="requesterId">
                    <option value="">Sem vínculo</option>
                    {people.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Nome do solicitante
                  <input name="requesterName" required />
                </label>
                <div className="form-grid">
                  <label>
                    Pedido
                    <input
                      name="orderedOn"
                      type="date"
                      defaultValue={today()}
                      required
                    />
                  </label>
                  <label>
                    Agendamento
                    <input name="scheduledOn" type="date" />
                  </label>
                </div>
                <label>
                  Valor
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                  />
                </label>
              </>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setDialog(null)}
              >
                Cancelar
              </button>
              <button className="primary">Salvar</button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </>
  );
}
