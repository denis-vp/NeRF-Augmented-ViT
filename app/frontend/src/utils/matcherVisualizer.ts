export interface MatchData {
  kptsA: number[][];
  kptsB: number[][];
  H_A: number;
  W_A: number;
  H_B: number;
  W_B: number;
}

/**
 * Loads an image from a URL and returns an HTMLImageElement.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Draws top-k feature matches between two images side by side.
 */
export async function drawMatches(
  imgAUrl: string,
  imgBUrl: string,
  matchData: MatchData,
  topK: number = 100
): Promise<HTMLCanvasElement> {
  const imgA = await loadImage(imgAUrl);
  const imgB = await loadImage(imgBUrl);

  const { kptsA, kptsB } = matchData;
  
  const totalMatches = Math.min(kptsA.length, kptsB.length, topK);
  const offsetX = imgA.naturalWidth;
  const width = imgA.naturalWidth + imgB.naturalWidth;
  const height = Math.max(imgA.naturalHeight, imgB.naturalHeight);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to get 2D context");

  // Draw both images side by side
  ctx.drawImage(imgA, 0, 0);
  ctx.drawImage(imgB, offsetX, 0);

  // Draw only the top-k matches
  for (let i = 0; i < totalMatches; i++) {
    const [x1, y1] = kptsA[i];
    const [x2, y2] = kptsB[i];

    // Line connecting match
    ctx.beginPath();
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 + offsetX, y2);
    ctx.stroke();

    // Red circle for A
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x1, y1, 2, 0, 2 * Math.PI);
    ctx.fill();

    // Blue circle for B
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(x2 + offsetX, y2, 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  return canvas;
}
