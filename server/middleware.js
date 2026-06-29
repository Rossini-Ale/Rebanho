import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'rebanho-secret-dev-key-change-in-production'

export function fazendaMiddleware(req, res, next) {
  const fazendaId = req.headers['x-fazenda-id']
  req.fazendaId = fazendaId ? parseInt(fazendaId, 10) : null
  next()
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET)
    req.userId = decoded.id
    req.userPapel = decoded.papel
    if (!req.fazendaId && decoded.fazenda_id) {
      req.fazendaId = decoded.fazenda_id
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export { JWT_SECRET }
