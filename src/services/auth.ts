import { supabase } from "./supabase";

export interface Usuario {
  id?: string;
  email: string;
}

/**
 * Retorna o usuário logado (via Supabase ou localStorage de teste)
 */
export async function usuarioAtual(): Promise<Usuario | null> {
  // 1. Sessão ativa no Supabase
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      return { id: session.user.id, email: session.user.email };
    }
    return null;
  }

  // 2. Fallback para modo de teste local (só quando o Supabase não está configurado)
  const usuarioTeste = localStorage.getItem("usuario-teste");
  return usuarioTeste ? JSON.parse(usuarioTeste) : null;
}

/**
 * Realiza o login com e-mail e senha
 */
export async function fazerLogin(email: string, senha: string): Promise<Usuario> {
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

    throw new Error("Não foi possível obter os dados do usuário.");
  }

  // Fallback de teste caso o Supabase não esteja conectado
  if (email && senha.length >= 6) {
    const usuarioFake: Usuario = { id: "dev-123", email };
    localStorage.setItem("usuario-teste", JSON.stringify(usuarioFake));
    return usuarioFake;
  }

  throw new Error("E-mail ou senha incorretos.");
}

/**
 * Cria uma conta nova com e-mail e senha
 */
export async function fazerCadastro(
  email: string,
  senha: string
): Promise<{ precisaConfirmar: boolean }> {
  if (!supabase) {
    throw new Error("Cadastro indisponível: o Supabase não está configurado.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Sem sessão = o Supabase está exigindo confirmação por e-mail
  return { precisaConfirmar: !data.session };
}

/**
 * Encerra a sessão do usuário
 */
export async function fazerLogout(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem("usuario-teste");
}