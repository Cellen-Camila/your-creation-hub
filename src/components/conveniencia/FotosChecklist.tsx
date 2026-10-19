import { useEffect, useRef, useState } from "react";
import { Camera, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validarFotos } from "@/lib/checklist";

type Props = { value: File[]; onChange: (files: File[]) => void; disabled?: boolean };

export function FotosChecklist({ value, onChange, disabled }: Props) {
  const camera = useRef<HTMLInputElement>(null);
  const galeria = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const novas = value.map((f) => URL.createObjectURL(f));
    setUrls(novas);
    return () => novas.forEach((u) => URL.revokeObjectURL(u));
  }, [value]);

  function adicionar(lista: FileList | null) {
    const novos = Array.from(lista ?? []);
    if (novos.length === 0) return;
    const todos = [...value, ...novos];
    const msg = validarFotos(todos);
    setErro(msg);
    if (!msg) onChange(todos);
  }

  function remover(i: number) {
    setErro(null);
    onChange(value.filter((_, j) => j !== i));
  }

  const entrada = (ref: React.RefObject<HTMLInputElement | null>, rotulo: string, cap: boolean) => (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      multiple
      hidden
      aria-label={rotulo}
      {...(cap ? { capture: "environment" as const } : {})}
      onChange={(e) => {
        adicionar(e.target.files);
        e.target.value = "";
      }}
    />
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => camera.current?.click()}
        >
          <Camera className="h-4 w-4" aria-hidden /> Tirar foto
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => galeria.current?.click()}
        >
          <ImageIcon className="h-4 w-4" aria-hidden /> Escolher da galeria
        </Button>
        {entrada(camera, "Arquivo de foto (câmera)", true)}
        {entrada(galeria, "Arquivo de foto (galeria)", false)}
      </div>
      <p className="text-xs text-muted-foreground">{value.length} de 10 fotos</p>
      {erro && (
        <p role="alert" className="text-sm text-late">
          {erro}
        </p>
      )}
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {value.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {urls[i] && (
                <img src={urls[i]} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                aria-label={`Remover foto ${i + 1}`}
                disabled={disabled}
                onClick={() => remover(i)}
                className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
