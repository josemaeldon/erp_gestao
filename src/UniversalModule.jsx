import { useEffect, useMemo, useState } from 'react'
import { api, money } from './api'
import { isReport, moduleCatalog, slugify } from './moduleCatalog'

function Field({ field, value }) {
  const [name, label, type] = field
  if (type === 'textarea') return <label>{label}<textarea name={name} rows="3" defaultValue={value||''} /></label>
  return <label>{label}<input name={name} type={type} step={type === 'number' ? '0.01' : undefined} defaultValue={value||''} /></label>
}

function RecordDialog({ config, resource, resourceSlug, people, row, onClose, onSaved }) {
  const [error, setError] = useState('')
  const save = async event => {
    event.preventDefault()
    const raw = Object.fromEntries(new FormData(event.currentTarget))
    const data = Object.fromEntries(config.fields.map(([name]) => [name, raw[name] || '']))
    try {
      await api(`/registry/${config.slug}/${resourceSlug}${row?`/${row.id}`:''}`, { method:row?'PATCH':'POST', body:JSON.stringify({ title:raw.title,personId:raw.personId,status:raw.status,occurredAt:raw.occurredAt,amount:raw.amount,data }) })
      onSaved()
    } catch (err) { setError(err.message) }
  }
  return <div className="modal-backdrop"><div className="modal-card registry-dialog"><div className="modal-heading"><div><span className="eyebrow">{row?'EDITAR REGISTRO':config.description}</span><h2>{resource}</h2></div><button className="close-btn" onClick={onClose}>×</button></div><form className="record-form" onSubmit={save}><label>Título/identificação<input name="title" required autoFocus defaultValue={row?.title||''}/></label><div className="form-grid"><label>Pessoa vinculada<select name="personId" defaultValue={row?.person_id||''}><option value="">Sem vínculo</option>{people.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select></label><label>Situação<select name="status" defaultValue={row?.status||'active'}><option value="active">Ativo</option><option value="pending">Pendente</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select></label></div><div className="form-grid"><label>Data<input name="occurredAt" type="date" defaultValue={row?.occurred_at?.slice?.(0,10)||''}/></label><label>Valor<input name="amount" type="number" min="0" step="0.01" defaultValue={row?.amount||''}/></label></div><div className="registry-fields">{config.fields.map(field=><Field key={field[0]} field={field} value={row?.data?.[field[0]]}/>)}</div>{error?<div className="form-error">{error}</div>:null}<div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary">Salvar registro</button></div></form></div></div>
}

function RegistryDeleteDialog({ row, onClose, onConfirm, busy }) {
  return <div className="modal-backdrop"><div className="modal-card confirm-card"><div className="modal-heading"><div><span className="eyebrow">CONFIRMAÇÃO</span><h2>Excluir registro</h2></div><button className="close-btn" onClick={onClose}>×</button></div><p>Confirma a exclusão de <strong>{row.title}</strong>? O item será arquivado e permanecerá disponível na auditoria.</p><div className="modal-actions"><button className="secondary" onClick={onClose}>Voltar</button><button className="danger-button" onClick={onConfirm} disabled={busy}>{busy?'Processando…':'Confirmar exclusão'}</button></div></div></div>
}

export default function UniversalModule({ module }) {
  const config = moduleCatalog[module]
  const resources = useMemo(() => {
    const counts = config.groups.flatMap(group => group.items).reduce((result, label) => ({ ...result, [label]: (result[label] || 0) + 1 }), {})
    return config.groups.map((group, groupIndex) => ({ ...group, items: group.items.map((label, itemIndex) => ({ id:`${groupIndex}-${itemIndex}`, label, slug:counts[label] > 1 ? `${slugify(label)}-${groupIndex + 1}-${itemIndex + 1}` : slugify(label) })) }))
  }, [config])
  const [resource, setResource] = useState('0-0')
  const selectedResource = resources.flatMap(group => group.items).find(item => item.id === resource) || resources[0].items[0]
  const resourceLabel = selectedResource.label
  const [rows, setRows] = useState([])
  const [people, setPeople] = useState([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const resourceSlug = selectedResource.slug
  const report = isReport(resourceLabel)
  const load = async () => {
    setLoading(true); setError('')
    try { const [records,peopleData] = await Promise.all([api(`/registry/${config.slug}/${resourceSlug}?search=${encodeURIComponent(search)}`),api('/people')]); setRows(records.data); setPeople(peopleData.data) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [config.slug,resourceSlug,search])
  const remove = async () => { setDeletingBusy(true); setError(''); try { await api(`/registry/${config.slug}/${resourceSlug}/${deleting.id}`,{method:'DELETE'}); setDeleting(null); await load() } catch(err) { setError(err.message) } finally { setDeletingBusy(false) } }
  const generateReport = async format => {
    setError('')
    const response = await fetch('/api/reports/generate',{method:'POST',headers:{Authorization:`Bearer ${localStorage.getItem('nucleo_token')}`,'Content-Type':'application/json'},body:JSON.stringify({reportType:'operational',title:resourceLabel,format,moduleSlug:config.slug,resourceSlug})})
    if(!response.ok){const body=await response.json().catch(()=>({}));return setError(body.error||'Não foi possível gerar o relatório')}
    const url=URL.createObjectURL(await response.blob()),link=document.createElement('a');link.href=url;link.download=`${config.slug}-${resourceSlug}.${format}`;link.click();URL.revokeObjectURL(url)
  }
  const exportCsv = async () => {
    if(report)return generateReport('csv')
    const response = await fetch(`/api/registry/${config.slug}/${resourceSlug}/export.csv`,{headers:{Authorization:`Bearer ${localStorage.getItem('nucleo_token')}`}})
    if(!response.ok) return setError('Não foi possível exportar o relatório')
    const url=URL.createObjectURL(await response.blob()), link=document.createElement('a'); link.href=url; link.download=`${config.slug}-${resourceSlug}.csv`; link.click(); URL.revokeObjectURL(url)
  }
  return <><section className="module-header registry-header"><div><span className="eyebrow">MÓDULO OPERACIONAL</span><h1>{module}</h1><p>{config.description}</p></div><div className="module-actions"><button className="secondary" onClick={exportCsv}>{report?'Gerar CSV':'Exportar CSV'}</button>{report?<button className="primary" onClick={()=>generateReport('pdf')}>Gerar PDF</button>:<button className="primary" onClick={()=>setOpen({})}>＋ Novo registro</button>}</div></section><div className="registry-layout"><aside className="registry-ribbon">{resources.map(group=><section key={group.name}><h3>{group.name}</h3>{group.items.map(item=><button key={item.id} className={resource===item.id?'selected':''} onClick={()=>setResource(item.id)}>{item.label}</button>)}</section>)}</aside><div className="registry-content"><div className="module-toolbar"><div><span className="eyebrow">ROTINA</span><h2>{resourceLabel}</h2><p>{report?'Consulta e emissão de relatório':'Cadastro, acompanhamento e histórico'}</p></div><label className="table-search"><span>⌕</span><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Pesquisar registros" /></label></div>{error?<div className="form-error">{error}</div>:null}<div className="panel table-panel"><div className="table-summary"><span>{loading?'Carregando…':`${rows.length} registros`}</span><span>Auditoria e escopo paroquial ativos</span></div><table><thead><tr><th>Identificação</th><th>Pessoa</th><th>Data</th><th>Valor</th><th>Situação</th><th></th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><strong>{row.title}</strong><small className="record-details">{Object.values(row.data||{}).filter(Boolean).slice(0,2).join(' · ')}</small></td><td>{row.person_name||'—'}</td><td>{row.occurred_at?new Date(row.occurred_at).toLocaleDateString('pt-BR'):'—'}</td><td>{row.amount?money(row.amount):'—'}</td><td><span className="status active">{row.status}</span></td><td>{!report?<div className="row-buttons"><button className="text-btn" onClick={()=>setOpen(row)}>Editar</button><button className="text-btn danger-text" onClick={()=>setDeleting(row)}>Excluir</button></div>:null}</td></tr>)}</tbody></table>{!loading&&!rows.length?<div className="registry-empty"><strong>Nenhum registro em {resourceLabel}</strong><p>{report?'Gere o relatório em PDF ou CSV para conferência.':'Cadastre o primeiro item para iniciar esta rotina.'}</p>{!report&&<button className="primary" onClick={()=>setOpen({})}>＋ Criar registro</button>}</div>:null}</div></div></div>{open&&!report?<RecordDialog config={config} resource={resourceLabel} resourceSlug={resourceSlug} people={people} row={open.id?open:null} onClose={()=>setOpen(false)} onSaved={async()=>{setOpen(false);await load()}}/>:null}{deleting?<RegistryDeleteDialog row={deleting} busy={deletingBusy} onClose={()=>setDeleting(null)} onConfirm={remove}/>:null}</>
}
