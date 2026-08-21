import { useEffect, useState } from "react";
import { api } from "./api";
import "./SocialDistributionCenter.css";
const today = () => new Date().toISOString().slice(0, 10),
  clean = (f) =>
    Object.fromEntries([...new FormData(f)].filter(([, v]) => v !== ""));
function Dialog({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
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
function Form({ kind, data, households, people, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    const f = clean(e.currentTarget);
    try {
      let endpoint =
        kind === "product"
          ? "products"
          : kind === "movement"
            ? "stock-movements"
            : kind === "kit"
              ? "kits"
              : kind === "distribution"
                ? "distributions"
                : kind === "schedule"
                  ? "schedules"
                  : "donors";
      if (kind === "kit") {
        f.items = [{ productId: f.productId, quantity: f.itemQuantity }];
        delete f.productId;
        delete f.itemQuantity;
      }
      if (kind === "schedule")
        f.scheduledFor = new Date(f.scheduledFor).toISOString();
      await api(`/social/${endpoint}`, {
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
          product: "Produto social",
          movement: "Entrada ou saída",
          kit: "Compor kit/cesta",
          distribution: "Registrar distribuição",
          schedule: "Agendar distribuição",
          donor: "Cadastrar doador",
        }[kind]
      }
      onClose={onClose}
    >
      <form className="record-form" onSubmit={save}>
        {kind === "product" ? (
          <>
            <div className="form-grid">
              <label>
                Código
                <input name="code" required />
              </label>
              <label>
                Tipo
                <select name="productTypeId">
                  <option value="">Sem tipo</option>
                  {data.productTypes.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Produto
              <input name="name" required />
            </label>
            <div className="form-grid">
              <label>
                Unidade
                <input name="unit" defaultValue="un" required />
              </label>
              <label>
                Estoque mínimo
                <input
                  name="minimumStock"
                  type="number"
                  min="0"
                  defaultValue="0"
                />
              </label>
            </div>
          </>
        ) : null}
        {kind === "donor" ? (
          <>
            <label>
              Pessoa cadastrada
              <select name="personId">
                <option value="">Sem vínculo</option>
                {people.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nome
              <input name="name" required />
            </label>
            <div className="form-grid">
              <label>
                Documento
                <input name="document" />
              </label>
              <label>
                Telefone
                <input name="phone" />
              </label>
            </div>
            <label>
              E-mail
              <input name="email" type="email" />
            </label>
          </>
        ) : null}
        {kind === "movement" ? (
          <>
            <label>
              Produto
              <select name="productId" required>
                <option value="">Selecione</option>
                {data.products.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.code} · {x.name} ({x.stock})
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Operação
                <select name="kind">
                  <option value="entry">Entrada / doação</option>
                  <option value="exit">Saída</option>
                  <option value="adjustment_in">Ajuste positivo</option>
                  <option value="adjustment_out">Ajuste negativo</option>
                </select>
              </label>
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
            </div>
            <div className="form-grid">
              <label>
                Data
                <input
                  name="occurredOn"
                  type="date"
                  defaultValue={today()}
                  required
                />
              </label>
              <label>
                Doador
                <select name="donorId">
                  <option value="">Sem doador</option>
                  {data.donors.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </>
        ) : null}
        {kind === "kit" ? (
          <>
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
            <label>
              Descrição
              <input name="description" />
            </label>
            <label>
              Produto da composição
              <select name="productId" required>
                <option value="">Selecione</option>
                {data.products.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantidade por kit
              <input
                name="itemQuantity"
                type="number"
                min="0.001"
                step="0.001"
                required
              />
            </label>
          </>
        ) : null}
        {kind === "distribution" ? (
          <>
            <label>
              Tipo
              <select name="distributionType">
                <option value="individual">Individual / familiar</option>
                <option value="community">Comunitária</option>
              </select>
            </label>
            <div className="form-grid">
              <label>
                Família
                <select name="householdId">
                  <option value="">Sem família</option>
                  {households.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.family_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Comunidade
                <input name="communityName" />
              </label>
            </div>
            <div className="form-grid">
              <label>
                Produto
                <select name="productId">
                  <option value="">Usar kit</option>
                  {data.products.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} ({x.stock})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Kit
                <select name="kitId">
                  <option value="">Usar produto</option>
                  {data.kits.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} ({x.available_quantity})
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
              <label>
                Data
                <input
                  name="distributedOn"
                  type="date"
                  defaultValue={today()}
                  required
                />
              </label>
            </div>
            <label>
              Entregue por
              <input name="deliveredBy" />
            </label>
          </>
        ) : null}
        {kind === "schedule" ? (
          <>
            <label>
              Título
              <input name="title" required />
            </label>
            <label>
              Data e hora
              <input name="scheduledFor" type="datetime-local" required />
            </label>
            <div className="form-grid">
              <label>
                Local
                <input name="location" />
              </label>
              <label>
                Público
                <input name="audience" />
              </label>
            </div>
            <label>
              Capacidade
              <input name="capacity" type="number" min="1" />
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
export default function SocialDistributionCenter({ households, people }) {
  const [tab, setTab] = useState("stock"),
    [data, setData] = useState({
      donors: [],
      productTypes: [],
      products: [],
      kits: [],
      kitItems: [],
      assemblies: [],
      schedules: [],
      distributions: [],
    }),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState("");
  const load = () =>
    api("/social/distribution-center")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  const saved = async () => {
    setDialog(null);
    await load();
  };
  const assemble = async (x) => {
    try {
      await api(`/social/kits/${x.id}/assemble`, {
        method: "POST",
        body: JSON.stringify({ quantity: 1, assembledOn: today() }),
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <>
      <div className="distribution-head">
        <div className="finance-tabs">
          <button
            className={tab === "stock" ? "active" : ""}
            onClick={() => setTab("stock")}
          >
            Produtos e estoque
          </button>
          <button
            className={tab === "kits" ? "active" : ""}
            onClick={() => setTab("kits")}
          >
            Kits e cestas
          </button>
          <button
            className={tab === "distributions" ? "active" : ""}
            onClick={() => setTab("distributions")}
          >
            Distribuições
          </button>
          <button
            className={tab === "schedule" ? "active" : ""}
            onClick={() => setTab("schedule")}
          >
            Agenda
          </button>
        </div>
        <div className="module-actions">
          {tab === "stock" ? (
            <>
              <button className="secondary" onClick={() => setDialog("donor")}>
                ＋ Doador
              </button>
              <button
                className="secondary"
                onClick={() => setDialog("product")}
              >
                ＋ Produto
              </button>
              <button className="primary" onClick={() => setDialog("movement")}>
                ↕ Movimentar
              </button>
            </>
          ) : null}
          {tab === "kits" ? (
            <button className="primary" onClick={() => setDialog("kit")}>
              ＋ Kit/cesta
            </button>
          ) : null}
          {tab === "distributions" ? (
            <button
              className="primary"
              onClick={() => setDialog("distribution")}
            >
              ＋ Distribuição
            </button>
          ) : null}
          {tab === "schedule" ? (
            <button className="primary" onClick={() => setDialog("schedule")}>
              ＋ Agendar
            </button>
          ) : null}
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      {tab === "stock" ? (
        <div className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Unidade</th>
                <th>Saldo</th>
                <th>Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((x) => (
                <tr key={x.id}>
                  <td>{x.code}</td>
                  <td>
                    <strong>{x.name}</strong>
                  </td>
                  <td>{x.type_name || "—"}</td>
                  <td>{x.unit}</td>
                  <td>{x.stock}</td>
                  <td>{x.minimum_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "kits" ? (
        <div className="kit-social-grid">
          {data.kits.map((x) => (
            <article className="panel" key={x.id}>
              <span>{x.code}</span>
              <h3>{x.name}</h3>
              {data.kitItems
                .filter((i) => i.kit_id === x.id)
                .map((i) => (
                  <p key={i.id}>
                    {i.product_name}: {i.quantity} {i.unit}
                  </p>
                ))}
              <strong>{x.available_quantity} montados disponíveis</strong>
              <button className="secondary" onClick={() => assemble(x)}>
                Montar 1 kit
              </button>
            </article>
          ))}
        </div>
      ) : null}
      {tab === "distributions" ? (
        <div className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Destino</th>
                <th>Item</th>
                <th>Quantidade</th>
                <th>Entregue por</th>
              </tr>
            </thead>
            <tbody>
              {data.distributions.map((x) => (
                <tr key={x.id}>
                  <td>
                    {new Date(x.distributed_on).toLocaleDateString("pt-BR")}
                  </td>
                  <td>{x.distribution_type}</td>
                  <td>{x.family_name || x.person_name || x.community_name}</td>
                  <td>{x.product_name || x.kit_name}</td>
                  <td>{x.quantity}</td>
                  <td>{x.delivered_by || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "schedule" ? (
        <div className="schedule-social-grid">
          {data.schedules.map((x) => (
            <article className="panel" key={x.id}>
              <span>{new Date(x.scheduled_for).toLocaleString("pt-BR")}</span>
              <h3>{x.title}</h3>
              <p>
                {x.location || "Local a definir"} ·{" "}
                {x.audience || "Público geral"}
              </p>
              <strong>{x.status}</strong>
            </article>
          ))}
        </div>
      ) : null}
      {dialog ? (
        <Form
          kind={dialog}
          data={data}
          households={households}
          people={people}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
    </>
  );
}
