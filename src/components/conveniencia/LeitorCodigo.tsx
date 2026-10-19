import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { iniciarLeitor } from "@/lib/leitor";
import { normalizarCodigo } from "@/lib/checklist";

type Props = {
  aberto: boolean;
  onFechar: () => void;
  onLido: (codigo: string) => void;
  onFalha: () => void;
};

export function LeitorCodigo({ aberto, onFechar, onLido, onFalha }: Props) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  // Sempre a versão mais nova dos callbacks, sem religar a câmera.
  const cb = useRef({ onFechar, onLido, onFalha });
  cb.current = { onFechar, onLido, onFalha };

  useEffect(() => {
    if (!aberto || !video) return;
    let ativo = true;
    let parar: (() => void) | null = null;
    const encerrar = () => {
      ativo = false;
      parar?.();
      parar = null;
    };
    iniciarLeitor(video, (texto) => {
      if (!ativo) return;
      const codigo = normalizarCodigo(texto);
      if (!codigo) return;
      encerrar();
      cb.current.onLido(codigo);
      cb.current.onFechar();
    }).then(
      (leitura) => {
        if (ativo) parar = leitura.parar;
        else leitura.parar();
      },
      () => {
        if (!ativo) return;
        encerrar();
        cb.current.onFalha();
        cb.current.onFechar();
      },
    );
    return encerrar;
  }, [aberto, video]);

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ler código de barras</DialogTitle>
          <DialogDescription>Aponte a câmera para o código de barras.</DialogDescription>
        </DialogHeader>
        <div className="relative overflow-hidden rounded-lg bg-muted">
          <video ref={setVideo} className="aspect-[4/3] w-full object-cover" playsInline muted />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[10%] top-1/2 h-1/3 -translate-y-1/2 rounded-lg border-2 border-primary"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
