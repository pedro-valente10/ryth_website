   import { supabase } from './supabase'

   export async function cadastrar(email: string, senha: string) {
     return supabase.auth.signUp({ email, password: senha })
   }

   export async function entrar(email: string, senha: string) {
     return supabase.auth.signInWithPassword({ email, password: senha })
   }

   export async function sair() {
     return supabase.auth.signOut()
   }

   export async function usuarioAtual() {
     const { data } = await supabase.auth.getSession()
     return data.session?.user ?? null
   }