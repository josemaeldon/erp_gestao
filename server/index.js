import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import { z } from 'zod'

const app = express()
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://nucleo:nucleo_local@localhost:5433/nucleo_eclesial' })
const secret = process.env.JWT_SECRET || 'local-only-secret'
app.use(cors({ origin: true }))
app.use(express.json())

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@nucleo.local'
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123'
  const client = await pool.connect()
  try {
    const org = await client.query('SELECT id FROM organizations ORDER BY created_at LIMIT 1')
    const role = await client.query("SELECT id FROM roles WHERE name='Administrador'")
    const hash = await bcrypt.hash(password, 12)
    const user = await client.query('INSERT INTO users (organization_id,name,email,password_hash) VALUES ($1,$2,$3,$4) ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash RETURNING id', [org.rows[0].id, 'Administrador local', email, hash])
    await client.query('INSERT INTO user_roles(user_id,role_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [user.rows[0].id, role.rows[0].id])
  } finally { client.release() }
}

function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) throw new Error('missing token')
    req.user = jwt.verify(token, secret)
    next()
  } catch { res.status(401).json({ error: 'Não autenticado' }) }
}
const requirePermission = code => async (req, res, next) => {
  const result = await pool.query('SELECT 1 FROM user_roles ur JOIN role_permissions rp ON rp.role_id=ur.role_id JOIN permissions p ON p.id=rp.permission_id WHERE ur.user_id=$1 AND p.code=$2', [req.user.id, code])
  if (!result.rowCount) return res.status(403).json({ error: 'Permissão insuficiente', code })
  next()
}
const audit = async (client, req, action, entity, entityId, metadata = {}) => client.query('INSERT INTO audit_logs(organization_id,user_id,action,entity,entity_id,metadata) VALUES($1,$2,$3,$4,$5,$6)', [req.user.organizationId, req.user.id, action, entity, entityId || null, metadata])

app.get('/api/health', async (_req, res) => { const db = await pool.query('SELECT 1'); res.json({ ok: true, database: db.rowCount === 1 }) })
app.post('/api/auth/login', async (req, res) => {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' })
  const result = await pool.query('SELECT u.*, o.name organization_name FROM users u JOIN organizations o ON o.id=u.organization_id WHERE lower(u.email)=lower($1) AND u.active', [parsed.data.email])
  const user = result.rows[0]
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) return res.status(401).json({ error: 'Credenciais inválidas' })
  const token = jwt.sign({ id: user.id, organizationId: user.organization_id, name: user.name, email: user.email, organizationName: user.organization_name }, secret, { expiresIn: '8h' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, organizationName: user.organization_name } })
})
app.get('/api/me', auth, (req, res) => res.json({ user: req.user }))
app.get('/api/dashboard', auth, requirePermission('finance.view'), async (req, res) => {
  const [people, income, expenses, tithe, recent] = await Promise.all([
    pool.query('SELECT count(*)::int count FROM people WHERE organization_id=$1 AND status=\'active\'', [req.user.organizationId]),
    pool.query("SELECT coalesce(sum(amount),0)::numeric total FROM financial_transactions WHERE organization_id=$1 AND kind='income'", [req.user.organizationId]),
    pool.query("SELECT coalesce(sum(amount),0)::numeric total FROM financial_transactions WHERE organization_id=$1 AND kind='expense'", [req.user.organizationId]),
    pool.query('SELECT coalesce(sum(amount),0)::numeric total, count(*)::int count FROM tithe_payments WHERE organization_id=$1', [req.user.organizationId]),
    pool.query('SELECT ft.*, p.name person_name FROM financial_transactions ft LEFT JOIN people p ON p.id=ft.person_id WHERE ft.organization_id=$1 ORDER BY ft.created_at DESC LIMIT 8', [req.user.organizationId])
  ])
  res.json({ metrics: { people: people.rows[0].count, income: income.rows[0].total, expenses: expenses.rows[0].total, tithe: tithe.rows[0].total, titheCount: tithe.rows[0].count }, recent: recent.rows })
})
app.get('/api/people', auth, requirePermission('people.view'), async (req, res) => { const q = String(req.query.search || '').trim(); const result = await pool.query('SELECT * FROM people WHERE organization_id=$1 AND ($2=\'\' OR name ILIKE $3 OR coalesce(document,\'\') ILIKE $3) ORDER BY name LIMIT 100', [req.user.organizationId, q, `%${q}%`]); res.json({ data: result.rows }) })
const personSchema = z.object({ name: z.string().min(2), document: z.string().optional(), birthDate: z.string().optional(), phone: z.string().optional(), email: z.string().email().optional().or(z.literal('')), notes: z.string().optional() })
app.post('/api/people', auth, requirePermission('people.create'), async (req, res) => { const parsed = personSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message }); const x=parsed.data; const result=await pool.query('INSERT INTO people(organization_id,name,document,birth_date,phone,email,notes) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[req.user.organizationId,x.name,x.document||null,x.birthDate||null,x.phone||null,x.email||null,x.notes||null]); await audit(pool,req,'create','people',result.rows[0].id,{name:x.name}); res.status(201).json({ data: result.rows[0] }) })
app.patch('/api/people/:id', auth, requirePermission('people.update'), async (req, res) => { const parsed=personSchema.partial().safeParse(req.body); if(!parsed.success) return res.status(400).json({error:'Dados inválidos'}); const x=parsed.data; const result=await pool.query('UPDATE people SET name=coalesce($1,name),document=coalesce($2,document),birth_date=coalesce($3,birth_date),phone=coalesce($4,phone),email=coalesce($5,email),notes=coalesce($6,notes),updated_at=now() WHERE id=$7 AND organization_id=$8 RETURNING *',[x.name,x.document,x.birthDate,x.phone,x.email,x.notes,req.params.id,req.user.organizationId]); if(!result.rowCount)return res.status(404).json({error:'Pessoa não encontrada'}); await audit(pool,req,'update','people',req.params.id); res.json({data:result.rows[0]}) })
app.get('/api/financial/transactions', auth, requirePermission('finance.view'), async (req,res)=>{ const result=await pool.query('SELECT ft.*,p.name person_name FROM financial_transactions ft LEFT JOIN people p ON p.id=ft.person_id WHERE ft.organization_id=$1 ORDER BY occurred_at DESC,created_at DESC LIMIT 200',[req.user.organizationId]); res.json({data:result.rows}) })
app.post('/api/financial/transactions', auth, requirePermission('finance.create'), async (req,res)=>{ const parsed=z.object({kind:z.enum(['income','expense']),category:z.string().min(2),description:z.string().min(2),amount:z.coerce.number().positive(),occurredAt:z.string().optional(),personId:z.string().uuid().optional()}).safeParse(req.body); if(!parsed.success)return res.status(400).json({error:'Preencha descrição, categoria e um valor válido'}); const x=parsed.data; const account=await pool.query('SELECT id FROM financial_accounts WHERE organization_id=$1 ORDER BY name LIMIT 1',[req.user.organizationId]); const result=await pool.query('INSERT INTO financial_transactions(organization_id,account_id,person_id,kind,category,description,amount,occurred_at,source) VALUES($1,$2,$3,$4,$5,$6,$7,coalesce($8,current_date),\'manual\') RETURNING *',[req.user.organizationId,account.rows[0]?.id||null,x.personId||null,x.kind,x.category,x.description,x.amount,x.occurredAt||null]); await audit(pool,req,'create','financial_transactions',result.rows[0].id,{kind:x.kind,amount:x.amount}); res.status(201).json({data:result.rows[0]}) })
app.get('/api/tithe/payments', auth, requirePermission('tithe.view'), async (req,res)=>{ const result=await pool.query('SELECT tp.*,p.name person_name FROM tithe_payments tp LEFT JOIN people p ON p.id=tp.person_id WHERE tp.organization_id=$1 ORDER BY payment_date DESC LIMIT 200',[req.user.organizationId]); res.json({data:result.rows}) })
app.post('/api/tithe/payments', auth, requirePermission('tithe.create'), async (req,res)=>{ const parsed=z.object({personId:z.string().uuid().optional(),amount:z.coerce.number().positive(),paymentDate:z.string().optional(),paymentMethod:z.string().default('pix'),reference:z.string().optional()}).safeParse(req.body); if(!parsed.success)return res.status(400).json({error:'Informe um valor válido'}); const x=parsed.data, client=await pool.connect(); try { await client.query('BEGIN'); const account=await client.query('SELECT id FROM financial_accounts WHERE organization_id=$1 ORDER BY name LIMIT 1',[req.user.organizationId]); const ft=await client.query("INSERT INTO financial_transactions(organization_id,account_id,person_id,kind,category,description,amount,occurred_at,source,external_id) VALUES($1,$2,$3,'income','tithe','Dízimo/oferta',$4,coalesce($5,current_date),'tithe',$6) RETURNING id",[req.user.organizationId,account.rows[0]?.id||null,x.personId||null,x.amount,x.paymentDate||null,x.reference||null]); const tp=await client.query('INSERT INTO tithe_payments(organization_id,person_id,amount,payment_date,payment_method,reference,financial_transaction_id) VALUES($1,$2,$3,coalesce($4,current_date),$5,$6,$7) RETURNING *',[req.user.organizationId,x.personId||null,x.amount,x.paymentDate||null,x.paymentMethod,x.reference||null,ft.rows[0].id]); await audit(client,req,'create','tithe_payments',tp.rows[0].id,{amount:x.amount}); await client.query('COMMIT'); res.status(201).json({data:tp.rows[0]}) } catch(e) { await client.query('ROLLBACK'); res.status(400).json({error:e.message}) } finally { client.release() } })

const port = Number(process.env.PORT || 4000)
if (process.env.NODE_ENV !== 'test') pool.connect().then(c=>{c.release(); return seedAdmin()}).then(()=>app.listen(port,()=>console.log(`API Núcleo Eclesial em http://localhost:${port}`))).catch(error=>{console.error(error); process.exit(1)})
export { app, pool }
