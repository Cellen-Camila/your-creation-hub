export type Tema = "claro" | "escuro";

export const CHAVE_TEMA = "tema";

/** Preferência salva vence; sem ela, segue o tema do aparelho. */
export function temaInicial(salvo: Tema | null, sistemaEscuro: boolean): Tema {
  if (salvo === "claro" || salvo === "escuro") return salvo;
  return sistemaEscuro ? "escuro" : "claro";
}

export function lerTemaSalvo(): Tema | null {
  try {
    const v = localStorage.getItem(CHAVE_TEMA);
    return v === "claro" || v === "escuro" ? v : null;
  } catch {
    return null;
  }
}

/** Aplica a classe `.dark` no <html> e guarda a escolha. */
export function aplicarTema(t: Tema) {
  document.documentElement.classList.toggle("dark", t === "escuro");
  try {
    localStorage.setItem(CHAVE_TEMA, t);
  } catch {
    /* sem armazenamento: o tema vale só nesta visita */
  }
}

export function temaAtual(): Tema {
  return document.documentElement.classList.contains("dark") ? "escuro" : "claro";
}

/** Roda no <head> antes de pintar a página, para não piscar. Mesma regra de temaInicial. */
export const SCRIPT_TEMA = `(function(){try{var s=null;try{s=localStorage.getItem("${CHAVE_TEMA}")}catch(e){}var d=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var t=(s==="claro"||s==="escuro")?s:(d?"escuro":"claro");if(t==="escuro")document.documentElement.classList.add("dark")}catch(e){}})();`;
