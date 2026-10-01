export async function usuarioAtual() {
  return localStorage.getItem('usuario-teste') ? { email: 'teste@teste.com' } : null
}