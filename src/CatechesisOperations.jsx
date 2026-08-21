import { useEffect, useState } from 'react'
import { api } from './api'

const today = () => new Date().toISOString().slice(0, 10)
const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function Dialog({ title, onClose, children }) {
  return <div className="modal-backdrop"><div className="modal-card catechesis-dialog"><div className="modal-heading"><div><span className="eyebrow">CATEQUESE</span><h2>{title}</h2></div><button className="close-btn" onClick={onClose}>×</button></div>{children}</div></div>
}

function EnrollmentSelect({ enrollments }) {
  return <label>Catequizando<select name="enrollmentId" required><option value="">Selecione</option>{enrollments.map(x => <option value={x.id} key={x.id}>{x.person_name} · {x.status}</option>)}</select></label>
}

export default function CatechesisOperations({ groupId, enrollments, onChanged }) {
  const [data, setData] = useState({ certificateRequests: [], bookEntries: [], fees: [] })
  const [dialog, setDialog] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const load = async () => setData(await api(`/catechesis/operations?groupId=${groupId}`))
  useEffect(() => { load().catch(err => setError(err.message)) }, [groupId])
  const done = async text => { setDialog(null); setMessage(text); setError(''); await load(); await onChanged?.() }
  const submit = async event => {
    event.preventDefault()
    const values = Object.fromEntries([...new FormData(event.currentTarget)].filter(([, value]) => value !== ''))
    const enrollmentId = values.enrollmentId
    delete values.enrollmentId
    try {
      if (dialog === 'request') await api(`/catechesis/enrollments/${enrollmentId}/certificate-request`, { method: 'POST', body: JSON.stringify(values) })
      if (dialog === 'book') await api(`/catechesis/enrollments/${enrollmentId}/book-entry`, { method: 'POST', body: JSON.stringify(values) })
      if (dialog === 'fee') await api(`/catechesis/enrollments/${enrollmentId}/fees`, { method: 'POST', body: JSON.stringify(values) })
      if (dialog === 'cancel') await api(`/catechesis/enrollments/${enrollmentId}/cancel`, { method: 'POST', body: JSON.stringify(values) })
      await done('Operação registrada com auditoria.')
    } catch (err) { setError(err.message) }
  }
  const issue = async enrollmentId => { try { const result = await api(`/catechesis/enrollments/${enrollmentId}/certificate`, { method: 'POST', body: '{}' }); await done(`Certificado emitido: ${result.data.validation_code}`) } catch (err) { setError(err.message) } }
  const issueRequest = async row => { try { const result = await api(`/catechesis/enrollments/${row.enrollment_id}/certificate`, { method: 'POST', body: JSON.stringify({ requestId: row.id }) }); await done(`Pedido atendido: ${result.data.validation_code}`) } catch (err) { setError(err.message) } }
  const exportSacrament = async enrollmentId => { try { const result = await api(`/catechesis/enrollments/${enrollmentId}/export-sacrament`, { method: 'POST', body: JSON.stringify({ requestedOn: today() }) }); await done(`Pedido sacramental criado: ${result.data.protocol}`) } catch (err) { setError(err.message) } }
  const pay = async feeId => { try { const result = await api(`/catechesis/fees/${feeId}/pay`, { method: 'POST', body: JSON.stringify({ paidOn: today(), paymentMethod: 'Dinheiro' }) }); await done(`Pagamento recebido: ${result.receipt}`) } catch (err) { setError(err.message) } }
  return <div className="catechesis-operations">
    {message && <div className="success-banner">{message}</div>}{error && <div className="form-error">{error}</div>}
    <div className="sub-action"><button className="secondary" onClick={() => setDialog('request')}>＋ Pedido de certidão</button><button className="secondary" onClick={() => setDialog('book')}>＋ Livro</button><button className="secondary" onClick={() => setDialog('fee')}>＋ Oblação</button><button className="secondary" onClick={() => setDialog('cancel')}>Cancelar matrícula</button></div>
    <section className="panel table-panel"><div className="section-heading"><div><h2>Conclusões e exportação sacramental</h2><p>Certificado verificável e envio direto para Eucaristia ou Crisma.</p></div></div><table><thead><tr><th>Catequizando</th><th>Etapa</th><th>Situação</th><th>Destino sacramental</th><th></th></tr></thead><tbody>{enrollments.map(x => <tr key={x.id}><td><strong>{x.person_name}</strong></td><td>{x.completed_at ? new Date(x.completed_at).toLocaleDateString('pt-BR') : 'Em formação'}</td><td><span className={`status ${x.status}`}>{x.status}</span></td><td>{x.sacramental_application_id ? 'Exportado' : 'Pendente'}</td><td>{x.status === 'completed' && <div className="row-buttons"><button className="text-btn" onClick={() => issue(x.id)}>Certificado</button><button className="text-btn" disabled={Boolean(x.sacramental_application_id)} onClick={() => exportSacrament(x.id)}>Exportar</button></div>}</td></tr>)}</tbody></table></section>
    <div className="people-columns equal"><section className="panel table-panel"><h2>Pedidos de certidão</h2><table><thead><tr><th>Fiel</th><th>Pedido</th><th>Situação</th><th></th></tr></thead><tbody>{data.certificateRequests.map(x => <tr key={x.id}><td><strong>{x.person_name}</strong><small>{x.purpose || x.stage_name}</small></td><td>{new Date(x.requested_on).toLocaleDateString('pt-BR')}</td><td>{x.validation_code || x.status}</td><td>{x.status === 'requested' && <button className="text-btn" onClick={() => issueRequest(x)}>Emitir</button>}</td></tr>)}</tbody></table></section><section className="panel table-panel"><h2>Livro catequético</h2><table><thead><tr><th>Fiel</th><th>Livro</th><th>Página / nº</th></tr></thead><tbody>{data.bookEntries.map(x => <tr key={x.id}><td><strong>{x.person_name}</strong></td><td>{x.book}</td><td>{x.page} / {x.entry_number}</td></tr>)}</tbody></table></section></div>
    <section className="panel table-panel"><h2>Recibos e oblações</h2><table><thead><tr><th>Catequizando</th><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Situação / recibo</th><th></th></tr></thead><tbody>{data.fees.map(x => <tr key={x.id}><td><strong>{x.person_name}</strong></td><td>{x.description}</td><td>{money(x.amount)}</td><td>{x.due_on ? new Date(x.due_on).toLocaleDateString('pt-BR') : '—'}</td><td>{x.receipt_number || x.status}</td><td>{x.status === 'open' && <button className="text-btn" onClick={() => pay(x.id)}>Receber</button>}</td></tr>)}</tbody></table></section>
    {dialog && <Dialog title={{ request: 'Pedido de certidão', book: 'Registro no livro', fee: 'Nova oblação', cancel: 'Cancelar matrícula' }[dialog]} onClose={() => setDialog(null)}><form className="record-form" onSubmit={submit}><EnrollmentSelect enrollments={dialog === 'cancel' ? enrollments.filter(x => x.status === 'active') : enrollments}/>{dialog === 'request' && <><label>Data do pedido<input name="requestedOn" type="date" defaultValue={today()} required /></label><label>Finalidade<textarea name="purpose" /></label></>}{dialog === 'book' && <><div className="form-grid"><label>Livro<input name="book" required /></label><label>Página<input name="page" required /></label></div><div className="form-grid"><label>Número<input name="entryNumber" required /></label><label>Data<input name="recordedOn" type="date" defaultValue={today()} required /></label></div><label>Observações<textarea name="notes" /></label></>}{dialog === 'fee' && <><label>Descrição<input name="description" defaultValue="Oblação de catequese" required /></label><div className="form-grid"><label>Valor<input name="amount" type="number" min="0.01" step="0.01" required /></label><label>Vencimento<input name="dueOn" type="date" /></label></div></>}{dialog === 'cancel' && <label>Motivo<textarea name="reason" minLength="3" required /></label>}{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary" onClick={() => setDialog(null)}>Cancelar</button><button className="primary">Salvar</button></div></form></Dialog>}
  </div>
}
