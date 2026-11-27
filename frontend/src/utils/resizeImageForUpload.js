const resizeImageForUpload = async (file, maxWidth, maxHeight) => {
  const image = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    image.close();
    throw new Error("Image resizing is not supported in this browser.");
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Could not prepare this image for upload."));
    }, "image/webp", 0.84);
  });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const extension = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
  return new File([blob], `${baseName}.${extension}`, { type: blob.type });
};

export default resizeImageForUpload;
