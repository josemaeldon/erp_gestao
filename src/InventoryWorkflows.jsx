import { useEffect, useState } from "react";
import { api, money } from "./api";

const today = () => new Date().toISOString().slice(0, 10);
function Dialog({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">ALMOXARIFADO</span>
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
function WorkflowForm({
  kind,
  data,
  products,
  metadata,
  people,
  onClose,
  onSaved,
}) {
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(
      [...new FormData(e.currentTarget)].filter(([, v]) => v !== ""),
    );
    try {
      let endpoint =
        kind === "requisition"
          ? "requisitions"
          : kind === "order"
            ? "purchase-orders"
            : kind === "return"
              ? "returns"
              : "writeoffs";
      if (kind === "requisition")
        f.items = [{ productId: f.productId, quantity: f.quantity }];
      if (kind === "order")
        f.items = [
          {
            productId: f.productId,
            quantity: f.quantity,
            unitCost: f.unitCost,
          },
        ];
      delete f.productId;
      if (["requisition", "order"].includes(kind)) delete f.quantity;
      if (kind === "order") delete f.unitCost;
      await api(`/inventory/${endpoint}`, {
        method: "POST",
        body: JSON.stringify(f),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog
      title={
        {
          requisition: "Nova requisição",
          order: "Novo pedido de compra",
          return: "Devolução de material",
          writeoff: "Baixa definitiva",
        }[kind]
      }
      onClose={onClose}
    >
      <form className="record-form" onSubmit={save}>
        {kind === "requisition" ? (
          <>
            <div className="form-grid">
              <label>
                Departamento
                <select name="departmentId">
                  <option value="">Selecione</option>
                  {data.departments.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Requisitante
                <select name="requesterId">
                  <option value="">Selecione</option>
                  {people.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Finalidade
              <input name="purpose" required />
            </label>
            <div className="form-grid">
              <label>
                Solicitação
                <input
                  name="requestedOn"
                  type="date"
                  defaultValue={today()}
                  required
                />
              </label>
              <label>
                Necessário em
                <input name="neededOn" type="date" />
              </label>
            </div>
          </>
        ) : null}
        {kind === "order" ? (
          <>
            <label>
              Fornecedor
              <input name="supplierName" required />
            </label>
            <div className="form-grid">
              <label>
                Pedido em
                <input
                  name="orderedOn"
                  type="date"
                  defaultValue={today()}
                  required
                />
              </label>
              <label>
                Previsão
                <input name="expectedOn" type="date" />
              </label>
            </div>
          </>
        ) : null}
        {["requisition", "order", "return", "writeoff"].includes(kind) ? (
          <>
            <label>
              Produto
              <select name="productId" required>
                <option value="">Selecione</option>
                {products.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.sku} · {x.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Quantidade
                <input
                  name="quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  required
                />
              </label>
              {kind === "order" ? (
                <label>
                  Custo unitário
                  <input
                    name="unitCost"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                  />
                </label>
              ) : null}
            </div>
          </>
        ) : null}
        {["return", "writeoff"].includes(kind) ? (
          <label>
            Local
            <select name="locationId" required>
              <option value="">Selecione</option>
              {metadata.locations.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {kind === "return" ? (
          <>
            <label>
              Requisição
              <select name="requisitionId">
                <option value="">Sem vínculo</option>
                {data.requisitions.map((x) => (
                  <option key={x.id} value={x.id}>
                    REQ-{x.number} · {x.purpose}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Devolvido por
              <select name="personId">
                <option value="">Sem vínculo</option>
                {people.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Data
                <input
                  name="returnedOn"
                  type="date"
                  defaultValue={today()}
                  required
                />
              </label>
              <label>
                Conservação
                <input name="condition" />
              </label>
            </div>
          </>
        ) : null}
        {kind === "writeoff" ? (
          <>
            <label>
              Data
              <input
                name="writtenOffOn"
                type="date"
                defaultValue={today()}
                required
              />
            </label>
            <label>
              Motivo
              <input name="reason" required />
            </label>
            <label>
              Autorização
              <input name="authorization" />
            </label>
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

export default function InventoryWorkflows({
  products,
  metadata,
  people,
  onChanged,
}) {
  const [tab, setTab] = useState("requests"),
    [data, setData] = useState({
      departments: [],
      requisitions: [],
      requisitionItems: [],
      purchaseOrders: [],
      purchaseOrderItems: [],
      returns: [],
      writeoffs: [],
    }),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState("");
  const load = () =>
    api("/inventory/workflows")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  const saved = async () => {
    setDialog(null);
    await load();
    onChanged();
  };
  const approve = async (x) => {
    try {
      await api(`/inventory/requisitions/${x.id}/approve`, {
        method: "POST",
        body: "{}",
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  const fulfill = async (x) => {
    const items = data.requisitionItems
      .filter((i) => i.requisition_id === x.id)
      .map((i) => ({
        itemId: i.id,
        quantity: Number(i.requested_quantity) - Number(i.fulfilled_quantity),
      }))
      .filter((i) => i.quantity > 0);
    try {
      await api(`/inventory/requisitions/${x.id}/fulfill`, {
        method: "POST",
        body: JSON.stringify({
          locationId: metadata.locations[0]?.id,
          occurredAt: today(),
          items,
        }),
      });
      await load();
      onChanged();
    } catch (e) {
      setError(e.message);
    }
  };
  const receive = async (x) => {
    const items = data.purchaseOrderItems
      .filter((i) => i.purchase_order_id === x.id)
      .map((i) => ({
        itemId: i.id,
        quantity: Number(i.quantity) - Number(i.received_quantity),
      }))
      .filter((i) => i.quantity > 0);
    try {
      await api(`/inventory/purchase-orders/${x.id}/receive`, {
        method: "POST",
        body: JSON.stringify({
          locationId: metadata.locations[0]?.id,
          receivedOn: today(),
          items,
        }),
      });
      await load();
      onChanged();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <>
      <div className="inventory-workflow-head">
        <div className="finance-tabs">
          <button
            className={tab === "requests" ? "active" : ""}
            onClick={() => setTab("requests")}
          >
            Requisições
          </button>
          <button
            className={tab === "orders" ? "active" : ""}
            onClick={() => setTab("orders")}
          >
            Pedidos de compra
          </button>
          <button
            className={tab === "returns" ? "active" : ""}
            onClick={() => setTab("returns")}
          >
            Devoluções e baixas
          </button>
        </div>
        <div className="module-actions">
          {tab === "requests" ? (
            <button
              className="primary"
              onClick={() => setDialog("requisition")}
            >
              ＋ Requisição
            </button>
          ) : null}
          {tab === "orders" ? (
            <button className="primary" onClick={() => setDialog("order")}>
              ＋ Pedido
            </button>
          ) : null}
          {tab === "returns" ? (
            <>
              <button className="secondary" onClick={() => setDialog("return")}>
                ＋ Devolução
              </button>
              <button className="primary" onClick={() => setDialog("writeoff")}>
                ＋ Baixa definitiva
              </button>
            </>
          ) : null}
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      {tab === "requests" ? (
        <div className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Solicitação</th>
                <th>Departamento / requisitante</th>
                <th>Finalidade</th>
                <th>Itens</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.requisitions.map((x) => (
                <tr key={x.id}>
                  <td>REQ-{x.number}</td>
                  <td>
                    {new Date(x.requested_on).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <strong>{x.department_name || "—"}</strong>
                    <small>{x.requester_name}</small>
                  </td>
                  <td>{x.purpose}</td>
                  <td>
                    {data.requisitionItems
                      .filter((i) => i.requisition_id === x.id)
                      .map((i) => (
                        <small key={i.id}>
                          {i.product_name}: {i.fulfilled_quantity}/
                          {i.requested_quantity} {i.unit}
                        </small>
                      ))}
                  </td>
                  <td>{x.status}</td>
                  <td>
                    {x.status === "requested" ? (
                      <button className="text-btn" onClick={() => approve(x)}>
                        Aprovar
                      </button>
                    ) : ["approved", "partially_fulfilled"].includes(
                        x.status,
                      ) ? (
                      <button className="text-btn" onClick={() => fulfill(x)}>
                        Atender
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "orders" ? (
        <div className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Fornecedor</th>
                <th>Data / previsão</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.purchaseOrders.map((x) => {
                const items = data.purchaseOrderItems.filter(
                  (i) => i.purchase_order_id === x.id,
                );
                return (
                  <tr key={x.id}>
                    <td>PED-{x.number}</td>
                    <td>{x.supplier_name}</td>
                    <td>
                      {new Date(x.ordered_on).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      {items.map((i) => (
                        <small key={i.id}>
                          {i.product_name}: {i.received_quantity}/{i.quantity}
                        </small>
                      ))}
                    </td>
                    <td>
                      {money(
                        items.reduce(
                          (s, i) =>
                            s + Number(i.quantity) * Number(i.unit_cost),
                          0,
                        ),
                      )}
                    </td>
                    <td>{x.status}</td>
                    <td>
                      {["approved", "partially_received"].includes(x.status) ? (
                        <button className="text-btn" onClick={() => receive(x)}>
                          Receber saldo
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "returns" ? (
        <div className="finance-dual">
          <div className="panel table-panel">
            <h3>Devoluções</h3>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Conservação</th>
                </tr>
              </thead>
              <tbody>
                {data.returns.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {new Date(x.returned_on).toLocaleDateString("pt-BR")}
                    </td>
                    <td>{x.product_name}</td>
                    <td>
                      {x.quantity} {x.unit}
                    </td>
                    <td>{x.condition || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel table-panel">
            <h3>Baixas definitivas</h3>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {data.writeoffs.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {new Date(x.written_off_on).toLocaleDateString("pt-BR")}
                    </td>
                    <td>{x.product_name}</td>
                    <td>
                      {x.quantity} {x.unit}
                    </td>
                    <td>{x.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {dialog ? (
        <WorkflowForm
          kind={dialog}
          data={data}
          products={products}
          metadata={metadata}
          people={people}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
    </>
  );
}
