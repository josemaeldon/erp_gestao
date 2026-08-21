import { useEffect, useState } from "react";
import { api, money } from "./api";
const today = () => new Date().toISOString().slice(0, 10),
  clean = (f) =>
    Object.fromEntries([...new FormData(f)].filter(([, v]) => v !== ""));
function Dialog({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">EVENTOS E CURSOS</span>
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
function Form({ kind, courses, people, data, enrollments, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    const f = clean(e.currentTarget);
    try {
      let endpoint;
      if (kind === "advisor") endpoint = `courses/${f.courseId}/advisors`;
      if (kind === "session") endpoint = `courses/${f.courseId}/sessions`;
      if (kind === "checkin") endpoint = `sessions/${f.sessionId}/checkins`;
      if (kind === "installment")
        endpoint = `enrollments/${f.enrollmentId}/installments`;
      if (kind === "certificate")
        endpoint = `enrollments/${f.enrollmentId}/certificate`;
      if (kind === "contact") endpoint = "contacts";
      if (kind === "tomb") endpoint = "tomb-book";
      delete f.courseId;
      delete f.sessionId;
      delete f.enrollmentId;
      if (kind === "session") {
        f.startsAt = new Date(f.startsAt).toISOString();
        if (f.endsAt) f.endsAt = new Date(f.endsAt).toISOString();
      }
      await api(`/agenda/${endpoint}`, {
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
          advisor: "Cadastrar assessor",
          session: "Criar encontro",
          checkin: "Check-in e etiqueta",
          installment: "Gerar mensalidade",
          certificate: "Emitir certificado",
          contact: "Contato da agenda",
          tomb: "Livro tombo",
        }[kind]
      }
      onClose={onClose}
    >
      <form className="record-form" onSubmit={save}>
        {["advisor", "session"].includes(kind) ? (
          <label>
            Curso
            <select name="courseId" required>
              <option value="">Selecione</option>
              {courses.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {kind === "advisor" ? (
          <>
            <label>
              Pessoa
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
                Função
                <input name="role" />
              </label>
              <label>
                E-mail
                <input name="email" type="email" />
              </label>
            </div>
          </>
        ) : null}
        {kind === "session" ? (
          <>
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
                <input name="endsAt" type="datetime-local" />
              </label>
            </div>
            <label>
              Local
              <input name="location" />
            </label>
          </>
        ) : null}
        {kind === "checkin" ? (
          <>
            <label>
              Encontro
              <select name="sessionId" required>
                <option value="">Selecione</option>
                {data.sessions.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.course_name} · {x.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Participante
              <select name="enrollmentId" required>
                <option value="">Selecione</option>
                {enrollments.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.person_name}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}
        {["installment", "certificate"].includes(kind) ? (
          <label>
            Participante
            <select name="enrollmentId" required>
              <option value="">Selecione</option>
              {enrollments.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.course_name || ""} · {x.person_name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {kind === "installment" ? (
          <>
            <div className="form-grid">
              <label>
                Competência
                <input name="competence" type="date" required />
              </label>
              <label>
                Vencimento
                <input name="dueDate" type="date" required />
              </label>
            </div>
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
          </>
        ) : null}
        {kind === "certificate" ? (
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
              Carga horária
              <input name="workloadHours" type="number" min="0.1" step="0.1" />
            </label>
          </div>
        ) : null}
        {kind === "contact" ? (
          <>
            <label>
              Pessoa
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
                Tipo
                <select name="phoneType">
                  <option>Celular</option>
                  <option>Residencial</option>
                  <option>Comercial</option>
                </select>
              </label>
              <label>
                Telefone
                <input name="phone" required />
              </label>
            </div>
            <label>
              E-mail
              <input name="email" type="email" />
            </label>
          </>
        ) : null}
        {kind === "tomb" ? (
          <>
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
                Categoria
                <input name="category" />
              </label>
            </div>
            <label>
              Título
              <input name="title" required />
            </label>
            <label>
              Registro histórico
              <textarea name="content" rows="6" required />
            </label>
            <label>
              Assinado por
              <input name="signedBy" />
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
export default function CourseOperations({ courses, people }) {
  const [data, setData] = useState({
      advisors: [],
      sessions: [],
      checkins: [],
      installments: [],
      certificates: [],
      contacts: [],
      tombEntries: [],
    }),
    [enrollments, setEnrollments] = useState([]),
    [tab, setTab] = useState("event"),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState("");
  const load = async () => {
    try {
      const operations = await api("/agenda/course-operations"),
        sets = await Promise.all(
          courses.map((c) =>
            api(`/agenda/courses/${c.id}/enrollments`).then((x) =>
              x.data.map((e) => ({ ...e, course_name: c.name })),
            ),
          ),
        );
      setData(operations);
      setEnrollments(sets.flat());
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    load();
  }, [courses.length]);
  const saved = async () => {
    setDialog(null);
    await load();
  };
  return (
    <>
      <div className="distribution-head">
        <div className="finance-tabs">
          <button
            className={tab === "event" ? "active" : ""}
            onClick={() => setTab("event")}
          >
            Assessores e check-in
          </button>
          <button
            className={tab === "billing" ? "active" : ""}
            onClick={() => setTab("billing")}
          >
            Mensalidades e certificados
          </button>
          <button
            className={tab === "contacts" ? "active" : ""}
            onClick={() => setTab("contacts")}
          >
            Telefones e livro tombo
          </button>
        </div>
        <div className="module-actions">
          {tab === "event" ? (
            <>
              <button
                className="secondary"
                onClick={() => setDialog("advisor")}
              >
                ＋ Assessor
              </button>
              <button
                className="secondary"
                onClick={() => setDialog("session")}
              >
                ＋ Encontro
              </button>
              <button className="primary" onClick={() => setDialog("checkin")}>
                ✓ Check-in
              </button>
            </>
          ) : null}
          {tab === "billing" ? (
            <>
              <button
                className="secondary"
                onClick={() => setDialog("installment")}
              >
                ＋ Mensalidade
              </button>
              <button
                className="primary"
                onClick={() => setDialog("certificate")}
              >
                ＋ Certificado
              </button>
            </>
          ) : null}
          {tab === "contacts" ? (
            <>
              <button
                className="secondary"
                onClick={() => setDialog("contact")}
              >
                ＋ Contato
              </button>
              <button className="primary" onClick={() => setDialog("tomb")}>
                ＋ Livro tombo
              </button>
            </>
          ) : null}
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      {tab === "event" ? (
        <div className="finance-dual">
          <div className="panel table-panel">
            <h3>Assessores</h3>
            <table>
              <tbody>
                {data.advisors.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <strong>{x.name}</strong>
                      <small>{x.course_name}</small>
                    </td>
                    <td>{x.role || "Assessor"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel table-panel">
            <h3>Check-ins</h3>
            <table>
              <tbody>
                {data.checkins.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <strong>{x.person_name}</strong>
                      <small>{x.session_title}</small>
                    </td>
                    <td>{x.label_code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {tab === "billing" ? (
        <div className="finance-dual">
          <div className="panel table-panel">
            <h3>Mensalidades</h3>
            <table>
              <tbody>
                {data.installments.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <strong>{x.person_name}</strong>
                      <small>{x.course_name}</small>
                    </td>
                    <td>{money(x.amount)}</td>
                    <td>{x.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel table-panel">
            <h3>Certificados</h3>
            <table>
              <tbody>
                {data.certificates.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <strong>{x.person_name}</strong>
                      <small>{x.course_name}</small>
                    </td>
                    <td>{x.certificate_code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {tab === "contacts" ? (
        <div className="finance-dual">
          <div className="panel table-panel">
            <h3>Agenda telefônica</h3>
            <table>
              <tbody>
                {data.contacts.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <strong>{x.name}</strong>
                    </td>
                    <td>{x.phone_type}</td>
                    <td>{x.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel table-panel">
            <h3>Livro tombo</h3>
            <table>
              <tbody>
                {data.tombEntries.map((x) => (
                  <tr key={x.id}>
                    <td>{x.entry_number}</td>
                    <td>
                      <strong>{x.title}</strong>
                      <small>{x.content}</small>
                    </td>
                    <td>
                      {new Date(x.entry_date).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {dialog ? (
        <Form
          kind={dialog}
          courses={courses}
          people={people}
          data={data}
          enrollments={enrollments}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
    </>
  );
}
