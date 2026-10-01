import { supabase } from "./supabase";

export interface Usuario {
  id?: string;
  email: string;
}

/**
  Retorna o usuário logado (via Supabase ou localStorage de teste)
 */
export async function usuarioAtual(): Promise<Usuario | null> {
  // 1. Tenta obter sessão ativa no Supabase
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      return { id: session.user.id, email: session.user.email };
    }
  }

  // 2. Fallback para modo de teste local
  const usuarioTeste = localStorage.getItem("usuario-teste");
  return usuarioTeste ? JSON.parse(usuarioTeste) : null;
}

/**
  Realiza o login com e-mail e senha
 */
export async function fazerLogin(email: string, senha: string): Promise<Usuario> {
  // Tenta autenticar via Supabase
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      throw new Error(error.message || "Credenciais inválidas.");
    }

    if (data.user?.email) {
      return { id: data.user.id, email: data.user.email };
    }
  }

  // Fallback de teste caso Supabase não esteja conectado
  if (email && senha.length >= 6) {
    const usuarioFake: Usuario = { id: "dev-123", email };
    localStorage.setItem("usuario-teste", JSON.stringify(usuarioFake));
    return usuarioFake;
  }

  throw new Error("E-mail ou senha incorretos.");
}

/**
  Encerra a sessão do usuário
 */
export async function fazerLogout(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem("usuario-teste");
}