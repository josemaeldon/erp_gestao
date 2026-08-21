import { useEffect, useMemo, useState } from "react";
import { api, money } from "./api";
import InventoryWorkflows from "./InventoryWorkflows";
import "./InventoryCenter.css";

const clean = (form) =>
  Object.fromEntries([...new FormData(form)].filter(([, v]) => v !== ""));
const kinds = {
  entry: "Entrada",
  exit: "Saída",
  transfer_in: "Transferência recebida",
  transfer_out: "Transferência enviada",
  adjustment_in: "Ajuste positivo",
  adjustment_out: "Ajuste negativo",
};
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
function ProductForm({ metadata, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    try {
      await api("/inventory/products", {
        method: "POST",
        body: JSON.stringify(clean(event.currentTarget)),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Cadastrar produto" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <div className="form-grid">
          <label>
            Código / SKU
            <input name="sku" required />
          </label>
          <label>
            Código de barras
            <input name="barcode" />
          </label>
        </div>
        <label>
          Nome do produto
          <input name="name" required />
        </label>
        <div className="form-grid">
          <label>
            Categoria
            <select name="categoryId">
              <option value="">Sem categoria</option>
              {metadata.categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Unidade
            <select name="unit">
              <option value="un">Unidade</option>
              <option value="cx">Caixa</option>
              <option value="kg">Quilograma</option>
              <option value="l">Litro</option>
              <option value="m">Metro</option>
              <option value="pct">Pacote</option>
            </select>
          </label>
        </div>
        <label>
          Estoque mínimo
          <input
            name="minimumStock"
            type="number"
            min="0"
            step="0.001"
            defaultValue="0"
          />
        </label>
        <label>
          Descrição
          <textarea name="description" rows="3" />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar produto</button>
        </div>
      </form>
    </Dialog>
  );
}
function MovementForm({ products, metadata, people, onClose, onSaved }) {
  const [kind, setKind] = useState("entry"),
    [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    try {
      await api("/inventory/movements", {
        method: "POST",
        body: JSON.stringify(clean(event.currentTarget)),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Movimentar estoque" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <div className="form-grid">
          <label>
            Operação
            <select
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="entry">Entrada</option>
              <option value="exit">Saída</option>
              <option value="transfer">Transferência</option>
            </select>
          </label>
          <label>
            Data
            <input
              name="occurredAt"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
        </div>
        <label>
          Produto
          <select name="productId" required>
            <option value="">Selecione</option>
            {products.map((item) => (
              <option key={item.id} value={item.id}>
                {item.sku} · {item.name} ({item.stock} {item.unit})
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            {kind === "transfer" ? "Local de origem" : "Local"}
            <select name="locationId" required>
              <option value="">Selecione</option>
              {metadata.locations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {kind === "transfer" ? (
            <label>
              Local de destino
              <select name="destinationLocationId" required>
                <option value="">Selecione</option>
                {metadata.locations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
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
          )}
        </div>
        {kind === "transfer" ? (
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
        ) : null}
        <div className="form-grid">
          <label>
            Custo unitário
            <input
              name="unitCost"
              type="number"
              min="0"
              step="0.0001"
              disabled={kind !== "entry"}
            />
          </label>
          <label>
            Documento
            <input name="documentNumber" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Lote
            <input name="batch" />
          </label>
          <label>
            Validade
            <input name="expiresOn" type="date" />
          </label>
        </div>
        <label>
          Retirado por / fornecedor
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
          Observações
          <textarea name="notes" rows="2" />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Confirmar movimentação</button>
        </div>
      </form>
    </Dialog>
  );
}
export default function InventoryCenter() {
  const [tab, setTab] = useState("stock"),
    [products, setProducts] = useState([]),
    [movements, setMovements] = useState([]),
    [metadata, setMetadata] = useState({ categories: [], locations: [] }),
    [people, setPeople] = useState([]),
    [dialog, setDialog] = useState(null),
    [query, setQuery] = useState(""),
    [error, setError] = useState("");
  const load = async () => {
    try {
      const [p, m, meta, pe] = await Promise.all([
        api("/inventory/products"),
        api("/inventory/movements"),
        api("/inventory/metadata"),
        api("/people"),
      ]);
      setProducts(p.data);
      setMovements(m.data);
      setMetadata(meta);
      setPeople(pe.data);
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(
    () =>
      products.filter(
        (item) =>
          (item.name + " " + item.sku)
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (tab !== "low" || item.low_stock),
      ),
    [products, query, tab],
  );
  const totalValue = products.reduce(
      (sum, item) => sum + Number(item.stock) * Number(item.average_cost),
      0,
    ),
    low = products.filter((item) => item.low_stock).length;
  const saved = async () => {
    setDialog(null);
    await load();
  };
  return (
    <>
      <section className="module-header inventory-header">
        <div>
          <span className="eyebrow">CONTROLE DE MATERIAIS</span>
          <h1>Almoxarifado</h1>
          <p>
            Produtos, locais, entradas, saídas, transferências, lotes, validade
            e estoque mínimo.
          </p>
        </div>
        <div className="module-actions">
          <button className="secondary" onClick={() => setDialog("product")}>
            ＋ Produto
          </button>
          <button className="primary" onClick={() => setDialog("movement")}>
            ↕ Movimentar
          </button>
        </div>
      </section>
      <div className="inventory-summary">
        <article>
          <span>Itens cadastrados</span>
          <strong>{products.length}</strong>
        </article>
        <article>
          <span>Unidades em estoque</span>
          <strong>
            {products
              .reduce((s, i) => s + Number(i.stock), 0)
              .toLocaleString("pt-BR")}
          </strong>
        </article>
        <article className={low ? "warning" : ""}>
          <span>Abaixo do mínimo</span>
          <strong>{low}</strong>
        </article>
        <article>
          <span>Valor estimado</span>
          <strong>{money(totalValue)}</strong>
        </article>
      </div>
      <div className="inventory-toolbar">
        <div className="finance-tabs">
          <button
            className={tab === "stock" ? "active" : ""}
            onClick={() => setTab("stock")}
          >
            Posição de estoque
          </button>
          <button
            className={tab === "movements" ? "active" : ""}
            onClick={() => setTab("movements")}
          >
            Movimentações
          </button>
          <button
            className={tab === "low" ? "active" : ""}
            onClick={() => setTab("low")}
          >
            Estoque mínimo
          </button>
          <button
            className={tab === "workflows" ? "active" : ""}
            onClick={() => setTab("workflows")}
          >
            Requisições e compras
          </button>
        </div>
        {["stock", "low"].includes(tab) ? (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto ou SKU"
          />
        ) : null}
      </div>
      {error ? <div className="form-error">{error}</div> : null}
      {["stock", "low"].includes(tab) ? (
        <div className="panel table-panel inventory-table">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Unidade</th>
                <th>Saldo</th>
                <th>Mínimo</th>
                <th>Custo médio</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <small className="record-details">
                      {item.sku}
                      {item.barcode ? ` · ${item.barcode}` : ""}
                    </small>
                  </td>
                  <td>{item.category_name || "—"}</td>
                  <td>{item.unit}</td>
                  <td className="stock-number">
                    {Number(item.stock).toLocaleString("pt-BR")}
                  </td>
                  <td>{Number(item.minimum_stock).toLocaleString("pt-BR")}</td>
                  <td>{money(item.average_cost)}</td>
                  <td>
                    <span
                      className={`status ${item.low_stock ? "low-stock" : "active"}`}
                    >
                      {item.low_stock ? "Repor" : "Regular"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? (
            <div className="registry-empty">
              <strong>Nenhum item encontrado</strong>
              <p>Cadastre um produto ou ajuste a pesquisa.</p>
            </div>
          ) : null}
        </div>
      ) : tab === "movements" ? (
        <div className="panel table-panel inventory-table">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Operação</th>
                <th>Local</th>
                <th>Quantidade</th>
                <th>Custo</th>
                <th>Documento / lote</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((item) => (
                <tr key={item.id}>
                  <td>
                    {new Date(item.occurred_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <strong>{item.product_name}</strong>
                    <small className="record-details">{item.sku}</small>
                  </td>
                  <td>
                    <span className={`movement-kind ${item.kind}`}>
                      {kinds[item.kind]}
                    </span>
                  </td>
                  <td>{item.location_name}</td>
                  <td>
                    {item.quantity} {item.unit}
                  </td>
                  <td>
                    {item.unit_cost === null ? "—" : money(item.unit_cost)}
                  </td>
                  <td>{item.document_number || item.batch || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "workflows" ? (
        <InventoryWorkflows
          products={products}
          metadata={metadata}
          people={people}
          onChanged={load}
        />
      ) : null}
      {dialog === "product" ? (
        <ProductForm
          metadata={metadata}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
      {dialog === "movement" ? (
        <MovementForm
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
