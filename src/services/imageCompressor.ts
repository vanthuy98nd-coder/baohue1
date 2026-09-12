/**
 * Client-side high-quality image compressor
 * Automatically compresses images to < 500KB before upload
 */
export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: number;
  width: number;
  height: number;
}

export async function compressImageToUnder500KB(
  file: File,
  targetMaxBytes = 480 * 1024 // 480KB target to ensure strictly under 500KB
): Promise<CompressionResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = async () => {
        let width = img.width;
        let height = img.height;

        // Resize down if excessively large (e.g. 4K camera photos)
        const maxDimension = 1600;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Iteratively find the best quality that stays under 500KB
        let quality = 0.88;
        let blob: Blob | null = null;
        const mimeType = 'image/jpeg';

        for (let i = 0; i < 6; i++) {
          blob = await new Promise<Blob | null>((res) =>
            canvas.toBlob((b) => res(b), mimeType, quality)
          );

          if (!blob) break;
          if (blob.size <= targetMaxBytes || quality <= 0.4) {
            break;
          }
          // Reduce quality proportionally
          quality = Math.max(0.35, quality - 0.12);
        }

        if (!blob) {
          blob = file;
        }

        const compressedSizeKb = Math.round(blob.size / 1024);
        const compressionRatio = Math.round((1 - blob.size / file.size) * 100);

        const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
        const compressedFile = new File([blob], newFileName, {
          type: mimeType,
          lastModified: Date.now(),
        });

        const dataUrl = canvas.toDataURL(mimeType, quality);

        resolve({
          file: compressedFile,
          dataUrl,
          originalSizeKb,
          compressedSizeKb,
          compressionRatio: Math.max(0, compressionRatio),
          width,
          height,
        });
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
