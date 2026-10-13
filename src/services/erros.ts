export const SENHA_MIN = 8;

// Requisitos de senha: a lista alimenta a validação E o texto de ajuda.
// Para exigir mais (letra, número...), é só adicionar um item aqui.
export const REQUISITOS_SENHA = [
  { texto: `ter pelo menos ${SENHA_MIN} caracteres`, ok: (s: string) => s.length >= SENHA_MIN },
  // { texto: "ter pelo menos um número", ok: (s: string) => /\d/.test(s) },
  // { texto: "ter pelo menos uma letra", ok: (s: string) => /[A-Za-z]/.test(s) },
];

export function textoRequisitosSenha(): string {
  return `A senha precisa ${REQUISITOS_SENHA.map((r) => r.texto).join(", ")}.`;
}

export function validarEmail(email: string): string | null {
  if (!email) return "Informe seu e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return "Esse e-mail não parece válido. Use o formato nome@exemplo.com.";
  }
  return null;
}

export function validarSenhaCadastro(senha: string): string | null {
  if (!senha) return "Crie uma senha.";
  const faltando = REQUISITOS_SENHA.filter((r) => !r.ok(senha)).map((r) => r.texto);
  return faltando.length ? `A senha precisa ${faltando.join(" e ")}.` : null;
}

const MENSAGENS_POR_CODIGO: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos. Confira os dados e tente de novo.",
  email_not_confirmed: "Você ainda não confirmou seu e-mail. Procure o código na sua caixa de entrada (e no spam).",
  user_already_exists: "Este e-mail já está cadastrado. Tente fazer login.",
  email_exists: "Este e-mail já está cadastrado. Tente fazer login.",
  weak_password: textoRequisitosSenha(),
  email_address_invalid: "Esse e-mail não é aceito. Verifique se digitou corretamente.",
  signup_disabled: "Os cadastros estão temporariamente desativados.",
  over_request_rate_limit: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  over_email_send_rate_limit: "Muitos e-mails enviados. Aguarde alguns minutos antes de pedir outro código.",
  otp_expired: "Código inválido ou expirado. Peça um novo código.",
  user_not_found: "Não encontramos uma conta com esse e-mail.",
  same_password: "A nova senha precisa ser diferente da atual.",
};

export function traduzirErroAuth(err: unknown): string {
  const e = err as { code?: string; message?: string; status?: number } | null;

  if (e?.code && MENSAGENS_POR_CODIGO[e.code]) return MENSAGENS_POR_CODIGO[e.code];

  // Fallback por texto (versões antigas do supabase-js não enviam "code")
  const msg = (e?.message ?? "").toLowerCase();
  if (msg.includes("invalid login credentials")) return MENSAGENS_POR_CODIGO.invalid_credentials;
  if (msg.includes("email not confirmed")) return MENSAGENS_POR_CODIGO.email_not_confirmed;
  if (msg.includes("already registered")) return MENSAGENS_POR_CODIGO.user_already_exists;
  if (msg.includes("password should be")) return textoRequisitosSenha();
  if (msg.includes("rate limit") || e?.status === 429) return MENSAGENS_POR_CODIGO.over_request_rate_limit;
  if (msg.includes("token has expired") || msg.includes("invalid token")) return MENSAGENS_POR_CODIGO.otp_expired;
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "Não foi possível conectar. Verifique sua internet e tente novamente.";
  }

  return "Algo deu errado. Tente novamente em instantes.";
}