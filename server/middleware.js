export function fazendaMiddleware(req, res, next) {
  const fazendaId = req.headers['x-fazenda-id']
  req.fazendaId = fazendaId ? parseInt(fazendaId, 10) : null
  next()
}
