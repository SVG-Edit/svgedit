/*import { Crop } from 'react-image-crop';

export const getCroppedImg = async (image: HTMLImageElement, crop: Crop): Promise<string> => {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width!;
  canvas.height = crop.height!;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width! * scaleX,
    crop.height! * scaleY,
    0,
    0,
    crop.width!,
    crop.height!
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const croppedImageUrl = window.URL.createObjectURL(blob);
      resolve(croppedImageUrl);
    }, 'image/jpeg');
  });
};

export const getRotatedImage = async (image: HTMLImageElement, degree: number): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const angleInRadians = degree * (Math.PI / 180);

  canvas.width = image.height;
  canvas.height = image.width;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angleInRadians);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const rotatedImageUrl = window.URL.createObjectURL(blob);
      resolve(rotatedImageUrl);
    }, 'image/jpeg');
  });
};

*/
