import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const modules = [
  ['Visão geral', '⌂'], ['Fiéis e Cadastros', '◉'], ['Dízimos e Ofertas', '◌'],
  ['Financeiro', '₿'], ['Batismo', '✦'], ['Catequese', '✧'], ['Crisma', '✦'],
  ['Eucaristia', '◈'], ['Matrimônio', '∞'], ['Campanhas', '◎'], ['Agendas e Cursos', '◷'],
  ['Almoxarifado', '▦'], ['Cemitério', '▥'], ['Contábil', '∑'], ['Patrimônio', '◆'],
  ['Gestão Social', '♧'], ['Conectividade', '⌁'],
]

const people = [
  { name: 'Maria de Lourdes Costa', community: 'Matriz Santa Luzia', status: 'Ativo', sacrament: 'Dizimista', phone: '(91) 99142-2084' },
  { name: 'Raimundo Nonato Silva', community: 'São Francisco de Assis', status: 'Ativo', sacrament: 'Catequizando', phone: '(91) 98871-6410' },
  { name: 'Ana Paula Ferreira', community: 'N. Sra. das Graças', status: 'Ativo', sacrament: 'Ministra', phone: '(91) 98402-1772' },
  { name: 'José Carlos Ribeiro', community: 'Santa Luzia - Gleba 28', status: 'Inativo', sacrament: '—', phone: '(91) 99108-3301' },
]

const navGroups = {
  'Fiéis e Cadastros': ['Cadastro de fiéis', 'Relatórios de fiéis', 'Registro de atendimento', 'Campos do perfil'],
  'Dízimos e Ofertas': ['Lançamento de dízimo', 'Extrato de dízimo', 'Dízimos no período', 'Comparativo do dízimo', 'Lançamento de oferta'],
  Financeiro: ['Movimentação de caixa', 'Movimentação bancária', 'Conciliação', 'Prestação de contas', 'Relatórios financeiros'],
  Batismo: ['Inscrição e registro', 'Certidão de batismo', 'Livros de batismo', 'Relatórios'],
  Catequese: ['Catequizando', 'Grupos catequéticos', 'Exportar para batismo', 'Exportar para eucaristia'],
  Patrimônio: ['Bens móveis e outros', 'Imóveis', 'Veículos', 'Depreciação', 'Inventário'],
}

function Icon({ children }) { return <span className="icon" aria-hidden="true">{children}</span> }

function Sidebar({ active, onSelect }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark">N</div><div><strong>Núcleo</strong><span>Eclesial</span></div></div>
    <div className="side-caption">ÁREA DE TRABALHO</div>
    <nav className="module-nav">{modules.map(([label, glyph]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => onSelect(label)}><Icon>{glyph}</Icon><span>{label}</span>{active === label && <i />}</button>)}</nav>
    <div className="sidebar-bottom"><button onClick={() => onSelect('Configurações')}><Icon>⚙</Icon><span>Configurações</span></button><div className="sidebar-version">Núcleo Eclesial <b>v0.1</b></div></div>
  </aside>
}

function Topbar({ onSearch }) {
  return <header className="topbar"><div className="crumb"><span>Diocese de Bragança</span><b>/</b><strong>Paróquia Santa Luzia</strong></div><label className="global-search"><Icon>⌕</Icon><input placeholder="Pesquisar em todo o sistema" onChange={e => onSearch(e.target.value)} /><kbd>⌘ K</kbd></label><div className="top-actions"><button className="top-icon" aria-label="Ajuda">?</button><button className="top-icon has-dot" aria-label="Notificações">♧</button><div className="user"><div className="avatar">PS</div><div><strong>Pe. José Maeldon</strong><span>Administrador paroquial</span></div><span className="chevron">⌄</span></div></div></header>
}

function StatCard({ label, value, meta, tone = 'blue', icon }) { return <article className={`stat-card ${tone}`}><div className="stat-head"><span>{label}</span><span className="stat-icon">{icon}</span></div><strong>{value}</strong><small>{meta}</small></article> }

function RevenueChart() {
  const bars = [42, 56, 46, 68, 52, 74, 64, 83, 58, 76, 69, 92]
  return <div className="chart-card"><div className="panel-heading"><div><span className="eyebrow">MOVIMENTO FINANCEIRO</span><h3>Entradas x saídas</h3></div><select defaultValue="2026"><option>2026</option><option>2025</option></select></div><div className="chart-legend"><span><i className="legend-dot incoming" />Entradas</span><span><i className="legend-dot outgoing" />Saídas</span><b>R$ 21.990,90 <small>total de entradas</small></b></div><div className="bar-chart">{bars.map((height, index) => <div className="bar-group" key={index}><div className="bars"><i style={{ height: `${height}%` }} /><i className="out" style={{ height: `${Math.max(18, height - 21)}%` }} /></div><span>{['J','F','M','A','M','J','J','A','S','O','N','D'][index]}</span></div>)}</div></div>
}

function SacramentPanel() { return <div className="panel sacrament-panel"><div className="panel-heading"><div><span className="eyebrow">CELEBRAÇÕES</span><h3>Atividade sacramental</h3></div><button className="text-btn">Ver relatórios <span>↗</span></button></div><div className="sacrament-list">{[['Batismos','105','blue'],['Primeiras eucaristias','97','gold'],['Crisma','76','green'],['Matrimônios','19','terra']].map(([label,value,color]) => <div className="sacrament-row" key={label}><div className={`sacrament-symbol ${color}`}>{label[0]}</div><span>{label}</span><strong>{value}</strong><div className="progress"><i className={color} style={{ width: `${Math.min(100, Number(value))}%` }} /></div></div>)}</div></div> }

function ActivityTable() { return <div className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">ACOMPANHAMENTO</span><h3>Próximas atividades</h3></div><button className="text-btn">Ver agenda <span>↗</span></button></div><table><thead><tr><th>Atividade</th><th>Data e horário</th><th>Local</th><th>Status</th></tr></thead><tbody>{[['Encontro de catequese','Hoje · 18:30','Salão paroquial','Confirmado'],['Missa pelos dizimistas','Amanhã · 19:00','Matriz Santa Luzia','Agendado'],['Curso de ministros','24/08 · 08:00','Centro pastoral','Inscrições']].map(row => <tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td>{row[2]}</td><td><span className={`status ${row[3].toLowerCase()}`}>{row[3]}</span></td></tr>)}</tbody></table></div> }

function Dashboard() { return <><section className="welcome"><div><p className="eyebrow">QUINTA-FEIRA, 20 DE AGOSTO DE 2026</p><h1>Bom dia, Pe. José.</h1><p>Acompanhe o movimento da sua paróquia e mantenha cada cuidado em dia.</p></div><button className="primary"><span>＋</span> Novo lançamento</button></section><div className="filter-row"><button className="filter-select">Paróquia Santa Luzia <span>⌄</span></button><button className="filter-select">Todas as comunidades <span>⌄</span></button><button className="filter-select">Janeiro — Dezembro 2026 <span>⌄</span></button><span className="sync">● Atualizado agora</span></div><div className="stat-grid"><StatCard label="Fiéis cadastrados" value="2.569" meta="+8,2% neste ano" tone="blue" icon="◉" /><StatCard label="Dizimistas ativos" value="636" meta="24,8% da comunidade" tone="gold" icon="◌" /><StatCard label="Saldo disponível" value="R$ 153.547,56" meta="+12,4% vs. período anterior" tone="green" icon="₿" /><StatCard label="A pagar" value="R$ 13.240,00" meta="8 lançamentos pendentes" tone="terra" icon="↗" /></div><div className="dashboard-grid"><RevenueChart /><SacramentPanel /></div><ActivityTable /></> }

function ModulePage({ module }) {
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState(navGroups[module]?.[0] || 'Visão geral');
  const group = navGroups[module] || ['Resumo', 'Cadastros', 'Relatórios', 'Configurações'];
  const filtered = people.filter(p => `${p.name} ${p.community} ${p.sacrament}`.toLowerCase().includes(query.toLowerCase()));
  return <><section className="module-header"><div><span className="eyebrow">MÓDULO</span><h1>{module}</h1><p>Organize rotinas, registros e relatórios da sua paróquia em um só lugar.</p></div><div className="module-actions"><button className="secondary">Exportar</button><button className="primary">＋ Novo registro</button></div></section><div className="module-layout"><div className="module-menu">{group.map(item => <button key={item} className={selected === item ? 'selected' : ''} onClick={() => setSelected(item)}>{item}<span>›</span></button>)}</div><div className="module-content"><div className="module-toolbar"><div><h2>{selected}</h2><span>Dados da Paróquia Santa Luzia · período 2026</span></div><div className="toolbar-actions"><label className="table-search"><Icon>⌕</Icon><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Pesquisar registros" /></label><button className="secondary">Filtros <span>＋</span></button></div></div>{module === 'Fiéis e Cadastros' ? <div className="panel table-panel"><div className="table-summary"><span>{filtered.length} registros exibidos</span><span>Última atualização hoje, 00:49</span></div><table><thead><tr><th>Nome completo</th><th>Comunidade</th><th>Contato</th><th>Vínculo eclesial</th><th>Status</th></tr></thead><tbody>{filtered.map(p => <tr key={p.name}><td><div className="person-cell"><div className="mini-avatar">{p.name.split(' ').map(x => x[0]).slice(0,2).join('')}</div><strong>{p.name}</strong></div></td><td>{p.community}</td><td>{p.phone}</td><td><span className="soft-tag">{p.sacrament}</span></td><td><span className={`status ${p.status.toLowerCase()}`}>{p.status}</span></td></tr>)}</tbody></table></div> : <div className="empty-module"><div className="empty-orbit">{module === 'Financeiro' ? '₿' : module === 'Dízimos e Ofertas' ? '◌' : '✦'}</div><h3>{selected}</h3><p>O espaço está pronto para receber os fluxos integrados de {module.toLowerCase()}.</p><button className="primary">＋ Criar primeiro registro</button><div className="empty-note">As movimentações serão integradas automaticamente ao histórico da paróquia.</div></div>}</div></div></> }

function App() { const [active, setActive] = useState('Visão geral'); const [search, setSearch] = useState(''); const isDashboard = active === 'Visão geral'; return <div className="app-shell"><Sidebar active={active} onSelect={setActive} /><div className="main-shell"><Topbar onSearch={setSearch} /><main className="main-content">{search && <div className="search-banner">Pesquisando por <strong>“{search}”</strong><button onClick={() => setSearch('')}>Limpar</button></div>}{isDashboard ? <Dashboard /> : <ModulePage module={active} />}</main><footer className="footer"><span>Núcleo Eclesial · Ambiente de produção assistida</span><span>Exercício 2026 · <a href="#auditoria">Auditoria ativa</a></span></footer></div></div> }

export default App

createRoot(document.getElementById('root')).render(<App />)
