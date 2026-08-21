import { useEffect, useMemo, useState } from "react";
import { api, money } from "./api";
import CourseOperations from "./CourseOperations";
import "./PastoralSchedule.css";

const labels = {
  appointment: "Compromisso",
  mass: "Missa",
  meeting: "Reunião",
  celebration: "Celebração",
  course: "Curso",
  other: "Outro",
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  requested: "Solicitada",
  celebrated: "Celebrada",
  planning: "Planejamento",
  enrollment: "Inscrições",
  in_progress: "Em andamento",
};
const dateTime = (value) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
const values = (form) =>
  Object.fromEntries(
    [...new FormData(form)].filter(([, value]) => value !== ""),
  );
function Dialog({ title, eyebrow = "AGENDA PASTORAL", onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card schedule-dialog">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{eyebrow}</span>
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

function EventForm({ onClose, onSaved }) {
  const [error, setError] = useState(""),
    [recurrence, setRecurrence] = useState("none");
  const save = async (event) => {
    event.preventDefault();
    const data = values(event.currentTarget);
    try {
      data.startsAt = new Date(data.startsAt).toISOString();
      data.endsAt = new Date(data.endsAt).toISOString();
      data.allDay = Boolean(data.allDay);
      await api("/agenda/events", {
        method: "POST",
        body: JSON.stringify(data),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog title="Novo compromisso ou celebração" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <div className="form-grid">
          <label>
            Tipo
            <select name="type" required>
              <option value="appointment">Compromisso</option>
              <option value="mass">Missa</option>
              <option value="meeting">Reunião</option>
              <option value="celebration">Celebração</option>
              <option value="course">Curso</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label>
            Situação
            <select name="status">
              <option value="scheduled">Agendado</option>
              <option value="confirmed">Confirmado</option>
            </select>
          </label>
        </div>
        <label>
          Título
          <input
            name="title"
            required
            placeholder="Ex.: Missa da comunidade São José"
          />
        </label>
        <div className="form-grid">
          <label>
            Início
            <input name="startsAt" type="datetime-local" required />
          </label>
          <label>
            Término
            <input name="endsAt" type="datetime-local" required />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Local
            <input name="location" />
          </label>
          <label>
            Comunidade
            <input name="community" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Celebrante
            <input name="celebrant" />
          </label>
          <label>
            Responsável
            <input name="responsible" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Recorrência
            <select
              name="recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="none">Não repetir</option>
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </label>
          {recurrence !== "none" ? (
            <label>
              Quantidade de ocorrências
              <input
                name="recurrenceCount"
                type="number"
                min="2"
                max="104"
                defaultValue="4"
              />
            </label>
          ) : (
            <span />
          )}
        </div>
        <label>
          Descrição
          <textarea name="description" rows="3" />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar na agenda</button>
        </div>
      </form>
    </Dialog>
  );
}

function IntentionForm({ events, types, people, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    try {
      await api("/agenda/intentions", {
        method: "POST",
        body: JSON.stringify(values(event.currentTarget)),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog
      eyebrow="INTENÇÕES DE MISSA"
      title="Registrar intenção"
      onClose={onClose}
    >
      <form className="record-form" onSubmit={save}>
        <label>
          Intenção por
          <input
            name="intentionFor"
            required
            placeholder="Nome da pessoa ou motivo"
          />
        </label>
        <div className="form-grid">
          <label>
            Tipo
            <select name="intentionTypeId">
              <option value="">Selecione</option>
              {types.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Solicitante
            <select name="requesterId">
              <option value="">Sem cadastro</option>
              {people.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Celebração vinculada
          <select name="eventId">
            <option value="">Agendar posteriormente</option>
            {events
              .filter(
                (item) => item.type === "mass" && item.status !== "cancelled",
              )
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {dateTime(item.starts_at)} · {item.title}
                </option>
              ))}
          </select>
        </label>
        <label>
          Texto do pedido
          <textarea
            name="requestText"
            rows="3"
            placeholder="Ação de graças, saúde, falecimento…"
          />
        </label>
        <div className="form-grid">
          <label>
            Oferta recebida
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </label>
          <label>
            Forma de pagamento
            <select name="paymentMethod">
              <option value="">Não informado</option>
              <option value="pix">PIX</option>
              <option value="cash">Dinheiro</option>
              <option value="card">Cartão</option>
              <option value="transfer">Transferência</option>
            </select>
          </label>
        </div>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Registrar intenção</button>
        </div>
      </form>
    </Dialog>
  );
}

function CourseForm({ onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    try {
      await api("/agenda/courses", {
        method: "POST",
        body: JSON.stringify(values(event.currentTarget)),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog eyebrow="FORMAÇÃO" title="Novo curso ou encontro" onClose={onClose}>
      <form className="record-form" onSubmit={save}>
        <label>
          Nome
          <input name="name" required />
        </label>
        <div className="form-grid">
          <label>
            Categoria
            <input
              name="category"
              placeholder="Liturgia, pastoral, formação…"
            />
          </label>
          <label>
            Instrutor
            <input name="instructor" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Início
            <input name="startsOn" type="date" />
          </label>
          <label>
            Término
            <input name="endsOn" type="date" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Local
            <input name="location" />
          </label>
          <label>
            Horário / frequência
            <input name="scheduleText" placeholder="Sábados, 15h" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Vagas
            <input name="capacity" type="number" min="1" />
          </label>
          <label>
            Taxa
            <input
              name="fee"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </label>
        </div>
        <label>
          Situação
          <select name="status">
            <option value="planning">Planejamento</option>
            <option value="enrollment">Inscrições abertas</option>
            <option value="in_progress">Em andamento</option>
          </select>
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
          <button className="primary">Salvar curso</button>
        </div>
      </form>
    </Dialog>
  );
}

function EnrollmentForm({ course, people, onClose, onSaved }) {
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    try {
      await api(`/agenda/courses/${course.id}/enrollments`, {
        method: "POST",
        body: JSON.stringify(values(event.currentTarget)),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Dialog
      eyebrow="INSCRIÇÕES"
      title={`Inscrever em ${course.name}`}
      onClose={onClose}
    >
      <form className="record-form" onSubmit={save}>
        <label>
          Pessoa
          <select name="personId" required>
            <option value="">Selecione</option>
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
        {course.capacity ? (
          <div className="capacity-note">
            {course.enrollment_count} de {course.capacity} vagas ocupadas.
            Excedentes entram na lista de espera.
          </div>
        ) : null}
        {error ? <div className="form-error">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Confirmar inscrição</button>
        </div>
      </form>
    </Dialog>
  );
}

export default function PastoralSchedule() {
  const [tab, setTab] = useState("agenda"),
    [events, setEvents] = useState([]),
    [intentions, setIntentions] = useState([]),
    [types, setTypes] = useState([]),
    [courses, setCourses] = useState([]),
    [people, setPeople] = useState([]),
    [dialog, setDialog] = useState(null),
    [error, setError] = useState("");
  const load = async () => {
    try {
      const now = new Date(),
        from = new Date(now.getFullYear() - 1, 0, 1).toISOString().slice(0, 10),
        to = new Date(now.getFullYear() + 2, 11, 31).toISOString().slice(0, 10);
      const [e, i, m, c, p] = await Promise.all([
        api(`/agenda/events?from=${from}&to=${to}`),
        api("/agenda/intentions"),
        api("/agenda/intentions/metadata"),
        api("/agenda/courses"),
        api("/people"),
      ]);
      setEvents(e.data);
      setIntentions(i.data);
      setTypes(m.types);
      setCourses(c.data);
      setPeople(p.data);
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const upcoming = useMemo(
    () =>
      events
        .filter(
          (item) =>
            new Date(item.ends_at) >= new Date() && item.status !== "cancelled",
        )
        .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)),
    [events],
  );
  const finishEvent = async (item) => {
    await api(`/agenda/events/${item.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "completed" }),
    });
    await load();
  };
  const finishIntention = async (item) => {
    await api(`/agenda/intentions/${item.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "celebrated" }),
    });
    await load();
  };
  const saved = async () => {
    setDialog(null);
    await load();
  };
  return (
    <>
      <section className="module-header schedule-header">
        <div>
          <span className="eyebrow">ORGANIZAÇÃO PASTORAL</span>
          <h1>Agenda, missas e formação</h1>
          <p>
            Calendário paroquial, intenções, compromissos recorrentes, cursos e
            inscrições.
          </p>
        </div>
        <button
          className="primary"
          onClick={() =>
            setDialog(
              tab === "agenda"
                ? "event"
                : tab === "intentions"
                  ? "intention"
                  : "course",
            )
          }
        >
          ＋{" "}
          {tab === "agenda"
            ? "Novo evento"
            : tab === "intentions"
              ? "Nova intenção"
              : "Novo curso"}
        </button>
      </section>
      <div className="schedule-summary">
        <article>
          <strong>{upcoming.length}</strong>
          <span>próximos eventos</span>
        </article>
        <article>
          <strong>
            {
              events.filter(
                (item) => item.type === "mass" && item.status !== "cancelled",
              ).length
            }
          </strong>
          <span>celebrações</span>
        </article>
        <article>
          <strong>
            {
              intentions.filter(
                (item) => !["celebrated", "cancelled"].includes(item.status),
              ).length
            }
          </strong>
          <span>intenções pendentes</span>
        </article>
        <article>
          <strong>
            {
              courses.filter(
                (item) => !["completed", "cancelled"].includes(item.status),
              ).length
            }
          </strong>
          <span>cursos ativos</span>
        </article>
      </div>
      <div className="finance-tabs">
        <button
          className={tab === "agenda" ? "active" : ""}
          onClick={() => setTab("agenda")}
        >
          Agenda
        </button>
        <button
          className={tab === "intentions" ? "active" : ""}
          onClick={() => setTab("intentions")}
        >
          Intenções de missa
        </button>
        <button
          className={tab === "courses" ? "active" : ""}
          onClick={() => setTab("courses")}
        >
          Cursos e inscrições
        </button>
        <button
          className={tab === "operations" ? "active" : ""}
          onClick={() => setTab("operations")}
        >
          Operações dos cursos
        </button>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
      {tab === "agenda" ? (
        <div className="schedule-layout">
          <aside className="panel schedule-calendar">
            <span className="eyebrow">PRÓXIMOS 30 DIAS</span>
            <h3>
              {new Date().toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <div className="calendar-legend">
              <i className="mass" /> Missa <i className="meeting" /> Reunião{" "}
              <i className="appointment" /> Compromisso
            </div>
          </aside>
          <div className="event-list">
            {events.map((item) => (
              <article className={`event-card ${item.type}`} key={item.id}>
                <div className="event-date">
                  <strong>{new Date(item.starts_at).getDate()}</strong>
                  <span>
                    {new Date(item.starts_at).toLocaleDateString("pt-BR", {
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="event-main">
                  <div>
                    <span className={`event-kind ${item.type}`}>
                      {labels[item.type]}
                    </span>
                    <span className={`status ${item.status}`}>
                      {labels[item.status] || item.status}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>
                    {dateTime(item.starts_at)}–
                    {new Date(item.ends_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {item.location || item.community || "Local não informado"}
                  </p>
                  <small>
                    {item.celebrant ||
                      item.responsible ||
                      item.description ||
                      "Sem responsável informado"}
                  </small>
                </div>
                {!["completed", "cancelled"].includes(item.status) ? (
                  <button
                    className="text-btn"
                    onClick={() => finishEvent(item)}
                  >
                    Concluir
                  </button>
                ) : null}
              </article>
            ))}
            {!events.length ? (
              <div className="registry-empty">
                <strong>Agenda livre</strong>
                <p>Cadastre compromissos, missas e reuniões.</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {tab === "intentions" ? (
        <div className="panel table-panel intention-table">
          <table>
            <thead>
              <tr>
                <th>Intenção</th>
                <th>Tipo</th>
                <th>Solicitante</th>
                <th>Celebração</th>
                <th>Oferta</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {intentions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.intention_for}</strong>
                    <small className="record-details">
                      {item.request_text}
                    </small>
                  </td>
                  <td>{item.intention_type_name || "—"}</td>
                  <td>{item.requester_name || "—"}</td>
                  <td>
                    {item.event_title ? (
                      <>
                        {item.event_title}
                        <small className="record-details">
                          {dateTime(item.event_starts_at)}
                        </small>
                      </>
                    ) : (
                      "A definir"
                    )}
                  </td>
                  <td>{money(item.amount)}</td>
                  <td>
                    <span className={`status ${item.status}`}>
                      {labels[item.status] || item.status}
                    </span>
                  </td>
                  <td>
                    {!["celebrated", "cancelled"].includes(item.status) ? (
                      <button
                        className="text-btn"
                        onClick={() => finishIntention(item)}
                      >
                        Celebrada
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "courses" ? (
        <div className="course-grid">
          {courses.map((course) => (
            <article className="panel course-card" key={course.id}>
              <div className="course-top">
                <span className={`status ${course.status}`}>
                  {labels[course.status] || course.status}
                </span>
                <span>{course.category || "Formação"}</span>
              </div>
              <h3>{course.name}</h3>
              <p>{course.description || "Curso pastoral cadastrado."}</p>
              <dl>
                <div>
                  <dt>Período</dt>
                  <dd>
                    {course.starts_on
                      ? new Date(course.starts_on).toLocaleDateString("pt-BR")
                      : "A definir"}
                    {course.ends_on
                      ? ` — ${new Date(course.ends_on).toLocaleDateString("pt-BR")}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt>Instrutor</dt>
                  <dd>{course.instructor || "A definir"}</dd>
                </div>
                <div>
                  <dt>Local</dt>
                  <dd>{course.location || "A definir"}</dd>
                </div>
                <div>
                  <dt>Inscrições</dt>
                  <dd>
                    {course.enrollment_count}
                    {course.capacity ? ` / ${course.capacity}` : ""}
                  </dd>
                </div>
              </dl>
              <button className="secondary" onClick={() => setDialog(course)}>
                ＋ Inscrever participante
              </button>
            </article>
          ))}
          {!courses.length ? (
            <div className="panel registry-empty">
              <strong>Nenhum curso cadastrado</strong>
              <p>Crie formações, encontros e controle as vagas.</p>
            </div>
          ) : null}
        </div>
      ) : null}
      {tab === "operations" ? (
        <CourseOperations courses={courses} people={people} />
      ) : null}
      {dialog === "event" ? (
        <EventForm onClose={() => setDialog(null)} onSaved={saved} />
      ) : null}
      {dialog === "intention" ? (
        <IntentionForm
          events={events}
          types={types}
          people={people}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
      {dialog === "course" ? (
        <CourseForm onClose={() => setDialog(null)} onSaved={saved} />
      ) : null}
      {dialog && typeof dialog === "object" ? (
        <EnrollmentForm
          course={dialog}
          people={people}
          onClose={() => setDialog(null)}
          onSaved={saved}
        />
      ) : null}
    </>
  );
}
