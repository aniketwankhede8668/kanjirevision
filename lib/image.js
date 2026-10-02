export async function prepareImage(file, max = 1600) {
  let bmp;
  try { bmp = await createImageBitmap(file); }
  catch { throw new Error("Image padhi nahi ja saki (png/jpg/webp use karein)"); }
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  return { image: c.toDataURL("image/jpeg", 0.85).split(",")[1], mime: "image/jpeg" };
}
