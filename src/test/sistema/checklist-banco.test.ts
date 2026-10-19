// @vitest-environment node
// Prova de sistema (banco): roda a migração 0002 inteira num Postgres em memória (PGlite),
// com um "Supabase mínimo" (papéis anon/authenticated/service_role e auth.uid()).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { checklistSchema, paraPayload, PERGUNTAS, type PayloadEnvio } from "@/lib/checklist";

const USUARIO = "11111111-1111-4111-8111-111111111111";
const OUTRO = "22222222-2222-4222-8222-222222222222";

let db: PGlite;

async function comoPapel<T>(papel: "authenticated" | "anon", fn: () => Promise<T>): Promise<T> {
  await db.exec(
    `SET ROLE ${papel}; SELECT set_config('request.jwt.claim.sub', '${USUARIO}', false);`,
  );
  try {
    return await fn();
  } finally {
    await db.exec("RESET ROLE");
  }
}
const comoUsuario = <T>(fn: () => Promise<T>) => comoPapel("authenticated", fn);
const comoAnon = <T>(fn: () => Promise<T>) => comoPapel("anon", fn);

const contar = async (tabela: string) =>
  Number((await db.query<{ n: string }>(`SELECT count(*) AS n FROM public.${tabela}`)).rows[0]!.n);
const contagens = async () => [
  await contar("checklists"),
  await contar("checklist_fotos"),
  await contar("checklist_codigos"),
];

type CodigoEntrada = {
  codigo: string;
  providencia: "transferir" | "devolucao" | "ajuste";
  ajuste?: string;
};

function montarPayload(
  codigos: CodigoEntrada[],
  mudar: (p: Record<string, unknown>) => void = () => {},
): PayloadEnvio {
  const form: Record<string, unknown> = {
    data: "2026-01-15",
    funcionaria: "Maria",
    outras_informacoes: "Tudo certo",
    codigos: codigos.map((c) => ({ ...c, quantidade: 2 })),
  };
  for (const q of PERGUNTAS) form[q.chave] = true;
  const valido = checklistSchema.parse(form);
  const p = paraPayload(valido, [
    { path: "conveniencia/a/1.jpg", nome: "1.jpg" },
    { path: "conveniencia/a/2.jpg", nome: "2.jpg" },
  ]);
  mudar(p as unknown as Record<string, unknown>);
  return p;
}

const TRES_CODIGOS: CodigoEntrada[] = [
  { codigo: "7891234567890", providencia: "transferir" },
  { codigo: "123", providencia: "devolucao" },
  { codigo: "456", providencia: "ajuste", ajuste: "Trocar etiqueta" },
];

const enviar = (p: unknown) =>
  comoUsuario(() =>
    db.query<{ id: string }>("select enviar_checklist($1::jsonb) as id", [JSON.stringify(p)]),
  );

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated;
    GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
  `);
  const sql = readFileSync(
    resolve(__dirname, "../../../drizzle/migrations/0002_checklist_conveniencia.sql"),
    "utf8",
  );
  await db.exec(sql);
}, 60_000);

afterAll(async () => {
  await db?.close();
});

describe("banco do checklist da conveniência", () => {
  it("grava 1 checklist, 2 fotos e 3 códigos, com enviado_por = login", async () => {
    const antes = await contagens();
    const r = await enviar(montarPayload(TRES_CODIGOS));
    expect(r.rows[0]!.id).toMatch(/^[0-9a-f-]{36}$/);
    const depois = await contagens();
    expect(depois.map((n, i) => n - antes[i]!)).toEqual([1, 2, 3]);
    const linha = await db.query<{ enviado_por: string }>(
      "SELECT enviado_por FROM public.checklists WHERE id = $1",
      [r.rows[0]!.id],
    );
    expect(linha.rows[0]!.enviado_por).toBe(USUARIO);
  });

  it("código inválido no fim desfaz tudo (nada gravado pela metade)", async () => {
    const antes = await contagens();
    const p = montarPayload(TRES_CODIGOS);
    p.codigos.push({ codigo: "78A9", providencia: "transferir", quantidade: 1, ajuste: null });
    await expect(enviar(p)).rejects.toThrow();
    expect(await contagens()).toEqual(antes);
  });

  it("recusa ajuste sem texto", async () => {
    const p = montarPayload(TRES_CODIGOS);
    p.codigos[2]!.ajuste = null;
    await expect(enviar(p)).rejects.toThrow();
    p.codigos[2]!.ajuste = "   ";
    await expect(enviar(p)).rejects.toThrow();
  });

  it("recusa data futura", async () => {
    const p = montarPayload(TRES_CODIGOS, (x) => {
      x["data"] = "2999-01-01";
    });
    await expect(enviar(p)).rejects.toThrow();
  });

  it("recusa pergunta ausente", async () => {
    const antes = await contagens();
    const p = montarPayload(TRES_CODIGOS, (x) => {
      delete x["loja_limpa"];
    });
    await expect(enviar(p)).rejects.toThrow();
    expect(await contagens()).toEqual(antes);
  });

  it("nega UPDATE nas respostas e DELETE em qualquer tabela", async () => {
    await enviar(montarPayload(TRES_CODIGOS));
    await expect(
      comoUsuario(() => db.query("UPDATE public.checklists SET loja_limpa = false")),
    ).rejects.toThrow(/permission denied/i);
    await expect(
      comoUsuario(() => db.query("UPDATE public.checklist_codigos SET codigo = '1'")),
    ).rejects.toThrow(/permission denied/i);
    for (const t of ["checklists", "checklist_fotos", "checklist_codigos"]) {
      await expect(comoUsuario(() => db.query(`DELETE FROM public.${t}`))).rejects.toThrow(
        /permission denied/i,
      );
    }
  });

  it("dá baixa e desfaz a baixa de um código", async () => {
    await enviar(montarPayload(TRES_CODIGOS));
    const dar = await comoUsuario(() =>
      db.query(
        `UPDATE public.checklist_codigos SET resolvido_em = now(), resolvido_por = '${USUARIO}' RETURNING id`,
      ),
    );
    expect(dar.rows.length).toBeGreaterThan(0);
    const marcados = await db.query(
      "SELECT 1 FROM public.checklist_codigos WHERE resolvido_em IS NOT NULL AND resolvido_por = $1",
      [USUARIO],
    );
    expect(marcados.rows.length).toBe(dar.rows.length);
    await comoUsuario(() =>
      db.query("UPDATE public.checklist_codigos SET resolvido_em = NULL, resolvido_por = NULL"),
    );
    const limpos = await db.query(
      "SELECT 1 FROM public.checklist_codigos WHERE resolvido_em IS NOT NULL",
    );
    expect(limpos.rows.length).toBe(0);
  });

  it("dá baixa e desfaz a baixa do que precisa ser feito", async () => {
    await enviar(
      montarPayload(TRES_CODIGOS, (x) => {
        x["a_fazer"] = "Chamar o técnico";
      }),
    );
    await comoUsuario(() =>
      db.query(
        `UPDATE public.checklists SET a_fazer_resolvido_em = now(), a_fazer_resolvido_por = '${USUARIO}'`,
      ),
    );
    const feito = await db.query(
      "SELECT 1 FROM public.checklists WHERE a_fazer_resolvido_em IS NOT NULL",
    );
    expect(feito.rows.length).toBeGreaterThan(0);
    await comoUsuario(() =>
      db.query(
        "UPDATE public.checklists SET a_fazer_resolvido_em = NULL, a_fazer_resolvido_por = NULL",
      ),
    );
    const limpo = await db.query(
      "SELECT 1 FROM public.checklists WHERE a_fazer_resolvido_em IS NOT NULL",
    );
    expect(limpo.rows.length).toBe(0);
  });

  it("recusa baixa pela metade (só um dos dois campos)", async () => {
    await enviar(montarPayload(TRES_CODIGOS));
    await expect(
      comoUsuario(() =>
        db.query(
          `UPDATE public.checklist_codigos SET resolvido_por = '${OUTRO}', resolvido_em = NULL`,
        ),
      ),
    ).rejects.toThrow();
  });

  it("anon não lê nenhuma tabela nem executa a função", async () => {
    for (const t of ["checklists", "checklist_fotos", "checklist_codigos"]) {
      await expect(comoAnon(() => db.query(`SELECT * FROM public.${t}`))).rejects.toThrow(
        /permission denied/i,
      );
    }
    await expect(
      comoAnon(() =>
        db.query("select enviar_checklist($1::jsonb)", [
          JSON.stringify(montarPayload(TRES_CODIGOS)),
        ]),
      ),
    ).rejects.toThrow(/permission denied/i);
  });
});
