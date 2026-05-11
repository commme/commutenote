// =========================================================
// transparentImage.ts
// GPT 가 만든 PNG 는 알파 채널이 없고 흰색이 실제 픽셀로 박혀 있음.
// 런타임에 canvas 로 가장자리부터 flood-fill 해서 흰 배경만 투명 처리.
// 캐릭터 흰 티셔츠 등 *내부* 흰색은 보존됨 (가장자리에서 시작하니 둘러싸인 영역은 못 닿음).
// =========================================================

const cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

const WHITE_THRESHOLD = 235; // 235 이상 RGB 모두면 "흰색"으로 간주

/**
 * 주어진 src 의 흰 배경을 투명으로 바꾼 blob URL 을 돌려준다.
 * 동일 src 는 캐시 — 한 번만 처리.
 */
export function makeTransparent(src: string): Promise<string> {
  const existing = cache.get(src);
  if (existing) return Promise.resolve(existing);
  const pending = inFlight.get(src);
  if (pending) return pending;

  const promise = process(src).then((url) => {
    cache.set(src, url);
    inFlight.delete(src);
    return url;
  });
  inFlight.set(src, promise);
  return promise;
}

function process(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    img.onload = () => {
      try {
        const W = img.naturalWidth;
        const H = img.naturalHeight;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, W, H);
        const data = imageData.data;
        const total = W * H;
        const visited = new Uint8Array(total);

        const isWhite = (idx: number) => {
          const pi = idx << 2;
          return (
            data[pi] >= WHITE_THRESHOLD &&
            data[pi + 1] >= WHITE_THRESHOLD &&
            data[pi + 2] >= WHITE_THRESHOLD
          );
        };

        // BFS-style flood fill from 4 edges
        const stack: number[] = [];
        for (let x = 0; x < W; x++) {
          stack.push(x);              // top row
          stack.push((H - 1) * W + x); // bottom row
        }
        for (let y = 0; y < H; y++) {
          stack.push(y * W);            // left col
          stack.push(y * W + W - 1);    // right col
        }

        while (stack.length) {
          const idx = stack.pop() as number;
          if (visited[idx]) continue;
          if (!isWhite(idx)) continue;
          visited[idx] = 1;
          data[(idx << 2) + 3] = 0; // alpha = 0

          const x = idx % W;
          const y = (idx - x) / W;
          if (x > 0) stack.push(idx - 1);
          if (x < W - 1) stack.push(idx + 1);
          if (y > 0) stack.push(idx - W);
          if (y < H - 1) stack.push(idx + W);
        }

        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(src);
              return;
            }
            resolve(URL.createObjectURL(blob));
          },
          "image/png",
        );
      } catch (err) {
        console.warn("[transparentImage] process failed", src, err);
        resolve(src);
      }
    };

    img.onerror = () => {
      console.warn("[transparentImage] image load failed", src);
      resolve(src);
    };
    img.src = src;
  });
}
