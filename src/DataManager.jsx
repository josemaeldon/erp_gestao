import { useEffect, useMemo, useState } from 'react'
import { api } from './api'
import './DataManager.css'

const auditFields = new Set(['created_at','updated_at','created_by','updated_by'])
const stringify = value => value == null ? '' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
const inputValue = (value, column) => {
  if (value == null) return ''
  if (column.dataType === 'timestamp with time zone' || column.dataType === 'timestamp without time zone') return new Date(value).toISOString().slice(0, 16)
  if (column.dataType === 'date') return String(value).slice(0, 10)
  if (column.dataType === 'time without time zone') return String(value).slice(0, 5)
  return stringify(value)
}
const display = value => {
  if (value == null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function Field({ column, value }) {
  const common = { name:column.name, defaultValue:inputValue(value,column), required:column.required }
  if (column.options?.length) return <label>{column.label}{column.required?' *':''}<select {...common}><option value="">Selecione</option>{column.options.map(option=><option key={option.id} value={option.id}>{option.label||option.id}</option>)}</select></label>
  if (column.dataType === 'boolean') return <label>{column.label}<select {...common}><option value="true">Sim</option><option value="false">Não</option></select></label>
  if (['json','jsonb','ARRAY'].includes(column.dataType) || /notes|content|description|body|summary|settings|payload|answers|questions|instructions|errors|details/.test(column.name)) return <label className="data-field-wide">{column.label}{column.required?' *':''}<textarea {...common} rows="4" placeholder={column.dataType==='ARRAY'?'Separe os valores por vírgula':undefined}/></label>
  const type = column.dataType === 'date' ? 'date' : column.dataType.startsWith('timestamp') ? 'datetime-local' : column.dataType.startsWith('time') ? 'time' : ['smallint','integer','bigint','numeric','real','double precision'].includes(column.dataType) ? 'number' : column.name.includes('email') ? 'email' : 'text'
  return <label>{column.label}{column.required?' *':''}<input {...common} type={type} step={type==='number'?'any':undefined}/></label>
}

function Editor({ mode, row, entity, columns, onClose, onSaved }) {
  const [error,setError]=useState(''),[saving,setSaving]=useState(false)
  const save=async event=>{event.preventDefault();setSaving(true);setError('');try{const entries=[...new FormData(event.currentTarget)],values=Object.fromEntries(mode==='edit'?entries:entries.filter(([,value])=>value!==''));await api(`/data-management/${entity.key}${mode==='edit'?`/${row.id}`:''}`,{method:mode==='edit'?'PATCH':'POST',body:JSON.stringify(mode==='edit'?{changes:values}:{values})});onSaved(mode==='edit'?'Registro alterado com sucesso.':'Registro adicionado com sucesso.')}catch(err){setError(err.message);setSaving(false)}}
  return <div className="modal-backdrop"><div className="modal-card data-editor"><div className="modal-heading"><div><span className="eyebrow">{mode==='edit'?'EDIÇÃO':'INCLUSÃO'}</span><h2>{entity.label}</h2></div><button className="close-btn" onClick={onClose}>×</button></div><form onSubmit={save}><div className="data-form-grid">{columns.filter(column=>!auditFields.has(column.name)).map(column=><Field key={column.name} column={column} value={row?.[column.name]}/>)}</div>{error?<div className="form-error">{error}</div>:null}<div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={saving}>{saving?'Salvando…':'Salvar'}</button></div></form></div></div>
}

function DeleteDialog({ entity, row, onClose, onDeleted }) {
  const [error,setError]=useState(''),[busy,setBusy]=useState(false)
  const remove=async()=>{setBusy(true);try{const result=await api(`/data-management/${entity.key}/${row.id}`,{method:'DELETE'});onDeleted(result.mode)}catch(err){setError(err.message);setBusy(false)}}
  return <div className="modal-backdrop"><div className="modal-card confirm-card"><div className="modal-heading"><div><span className="eyebrow">CONFIRMAÇÃO</span><h2>Excluir registro</h2></div><button className="close-btn" onClick={onClose}>×</button></div><p>Confirma a exclusão de <strong>{entity.label}</strong>? Registros com histórico legal ou financeiro serão cancelados, arquivados ou inativados para preservar a auditoria.</p>{error?<div className="form-error">{error}</div>:null}<div className="modal-actions"><button className="secondary" onClick={onClose}>Voltar</button><button className="danger-button" onClick={remove} disabled={busy}>{busy?'Processando…':'Confirmar exclusão'}</button></div></div></div>
}

export default function DataManager({ moduleSlug }) {
  const [catalog,setCatalog]=useState({module:'',entities:[]}),[entityKey,setEntityKey]=useState(''),[data,setData]=useState({entity:null,columns:[],rows:[]}),[search,setSearch]=useState(''),[dialog,setDialog]=useState(null),[message,setMessage]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true)
  useEffect(()=>{setEntityKey('');setSearch('');setDialog(null);api(`/data-management/catalog?module=${moduleSlug}`).then(result=>{setCatalog(result);setEntityKey(result.entities[0]?.key||'')}).catch(err=>setError(err.message))},[moduleSlug])
  const load=async()=>{if(!entityKey)return;setLoading(true);setError('');try{setData(await api(`/data-management/${entityKey}?search=${encodeURIComponent(search)}`))}catch(err){setError(err.message)}finally{setLoading(false)}}
  useEffect(()=>{load()},[entityKey,search])
  const visibleColumns=useMemo(()=>data.columns.filter(column=>!column.name.endsWith('_id')&&!['json','jsonb','ARRAY'].includes(column.dataType)).slice(0,5),[data.columns])
  const saved=async text=>{setDialog(null);setMessage(text);await load()}
  const deleted=async mode=>saved({archive:'Registro arquivado.',deactivate:'Registro inativado.',cancel:'Registro cancelado.',delete:'Registro excluído.'}[mode]||'Registro removido.')
  return <><section className="module-header data-manager-header"><div><span className="eyebrow">GESTÃO COMPLETA DE DADOS</span><h1>Adicionar, editar e excluir</h1><p>Gerencie todos os cadastros e movimentos de {catalog.module||'esta área'}, com permissões e auditoria.</p></div>{data.entity?.canCreate?<button className="primary" onClick={()=>setDialog({type:'create'})}>＋ Adicionar</button>:null}</section>{message?<div className="success-banner">{message}</div>:null}{error?<div className="form-error">{error}</div>:null}<div className="data-manager-layout"><aside className="panel data-entity-list"><strong>Tipos de registro</strong>{catalog.entities.map(entity=><button key={entity.key} className={entityKey===entity.key?'selected':''} onClick={()=>setEntityKey(entity.key)}><span>{entity.label}</span>{entity.immutable?<small>somente leitura</small>:null}</button>)}</aside><section className="data-manager-content"><div className="module-toolbar"><div><span className="eyebrow">REGISTROS</span><h2>{data.entity?.label||'Selecione um tipo'}</h2><p>{loading?'Carregando…':`${data.rows.length} registro(s) encontrado(s)`}</p></div><label className="table-search">⌕ <input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Pesquisar em todos os campos"/></label></div><div className="panel table-panel"><table><thead><tr>{visibleColumns.map(column=><th key={column.name}>{column.label}</th>)}<th>Ações</th></tr></thead><tbody>{data.rows.map(row=><tr key={row.id}>{visibleColumns.map(column=><td key={column.name}>{display(row[column.name])}</td>)}<td><div className="row-buttons"><button className="text-btn" onClick={()=>setDialog({type:'edit',row})}>Editar</button>{!data.entity.immutable?<button className="text-btn danger-text" onClick={()=>setDialog({type:'delete',row})}>Excluir</button>:null}</div></td></tr>)}</tbody></table>{!loading&&!data.rows.length?<div className="registry-empty"><strong>Nenhum registro encontrado</strong><p>Use “Adicionar” para criar o primeiro registro deste tipo.</p></div>:null}</div></section></div>{dialog?.type==='create'?<Editor mode="create" entity={data.entity} columns={data.columns} onClose={()=>setDialog(null)} onSaved={saved}/>:null}{dialog?.type==='edit'?<Editor mode="edit" row={dialog.row} entity={data.entity} columns={data.columns} onClose={()=>setDialog(null)} onSaved={saved}/>:null}{dialog?.type==='delete'?<DeleteDialog row={dialog.row} entity={data.entity} onClose={()=>setDialog(null)} onDeleted={deleted}/>:null}</>
}
