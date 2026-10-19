import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const nomeSeguro = (n: string) => n.replace(/[^\w.-]/g, "_");

export async function abrirArquivo(path: string) {
  const { data, error } = await supabase.storage.from("documentos").createSignedUrl(path, 120);
  if (error) {
    toast.error(error.message);
    return;
  }
  window.open(data.signedUrl, "_blank");
}
