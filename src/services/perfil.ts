/* --------------------------------------------------------------------------
   Serviço de perfil (fonte única de leitura e gravação)

   Por enquanto salva no localStorage, separado por usuário (e-mail).
   Quando o backend estiver pronto, troque APENAS o corpo de lerPerfil
   e salvarPerfil: edicao.ts e perfil.ts continuam funcionando igual.
   -------------------------------------------------------------------------- */

export interface DadosPerfil {
  nome: string;
  bio: string;
  estilos: string[];
  instagram: string;
  tiktok: string;
}

function chaveStorage(email: string): string {
  return `ryth:perfil:${email}`;
}

export function lerPerfil(email: string): Partial<DadosPerfil> {
  try {
    const bruto = localStorage.getItem(chaveStorage(email));
    return bruto ? (JSON.parse(bruto) as Partial<DadosPerfil>) : {};
  } catch {
    return {};
  }
}

export async function salvarPerfil(email: string, dados: DadosPerfil): Promise<void> {
  localStorage.setItem(chaveStorage(email), JSON.stringify(dados));
}