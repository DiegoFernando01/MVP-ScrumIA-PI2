export default function handler(req, res) {
  // Sólo permitimos GET para esta prueba
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Only GET allowed" });
  }
  // Devolvemos exactamente la cadena que querías
  res.status(200).json({ message: "funcionooooo" });
}

