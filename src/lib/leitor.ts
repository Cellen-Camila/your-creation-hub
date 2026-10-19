import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

export type Leitura = { parar: () => void };

const FORMATOS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
];

/**
 * Liga a câmera traseira no <video> e chama aoLer a cada código lido.
 * Rejeita se a câmera for negada ou não existir. `parar` libera a câmera.
 */
export async function iniciarLeitor(
  video: HTMLVideoElement,
  aoLer: (texto: string) => void,
): Promise<Leitura> {
  const hints = new Map<DecodeHintType, unknown>([[DecodeHintType.POSSIBLE_FORMATS, FORMATOS]]);
  const reader = new BrowserMultiFormatReader(hints);
  const controles = await reader.decodeFromConstraints(
    { video: { facingMode: { ideal: "environment" } }, audio: false },
    video,
    (resultado) => {
      if (resultado) aoLer(resultado.getText());
    },
  );
  return {
    parar: () => {
      controles.stop();
      const fluxo = video.srcObject;
      if (fluxo instanceof MediaStream) fluxo.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    },
  };
}
