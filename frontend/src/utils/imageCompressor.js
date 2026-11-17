const MAX_WIDTH = 1280;
const QUALITY = 0.85;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export function comprimirImagemParaBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return reject(new Error('Formato inválido. Escolha uma foto JPEG, PNG ou WebP.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo selecionado.'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo corrompido ou não é uma imagem válida.'));

      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL('image/jpeg', QUALITY);
        const rawBase64 = base64.split(',')[1];
        const finalBytes = Math.ceil((rawBase64.length * 3) / 4);

        if (finalBytes > MAX_BYTES) {
          return reject(new Error('A imagem comprimida ainda ultrapassa 5MB. Tente outra foto.'));
        }

        resolve({
          base64,
          originalKB: Math.round(file.size / 1024),
          finalKB: Math.round(finalBytes / 1024),
        });
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}