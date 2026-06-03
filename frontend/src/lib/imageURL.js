/**
 * imageUrl.js
 *
 * Utility untuk membangun URL gambar dari path relatif backend.
 * Membaca baseURL dari axios instance yang sudah dikonfigurasi,
 * sehingga tidak ada hardcode URL di komponen manapun.
 *
 * Letakkan di: src/lib/imageUrl.js
 */

import api from "@/lib/axios";

/**
 * Ambil base origin dari axios instance (buang path "/api/v1").
 * 
 * Special case untuk production:
 * - Frontend di rekle.vercel.app
 * - API/Images di rekle.ranggapasha.my.id
 */
function getBaseOrigin() {
  const baseURL = api.defaults.baseURL || "";
  
  // Jika running di Vercel production, pointing ke production backend
  if (typeof window !== "undefined" && window.location.hostname === "rekle.vercel.app") {
    return "https://rekle.ranggapasha.my.id";
  }
  
  try {
    const url = new URL(baseURL);
    return url.origin; // hanya scheme + host + port
  } catch {
    // baseURL bukan URL absolut (misalnya "/api/v1") — pakai origin window
    return window.location.origin;
  }
}

/**
 * Bangun URL lengkap untuk path gambar dari backend.
 *
 * - Jika path sudah URL lengkap (http/https) → kembalikan apa adanya
 * - Jika path relatif                         → gabungkan dengan base origin
 * - Jika path null/undefined                  → kembalikan null
 *
 * @param {string|null} path - Path dari backend, misal "uploads/proofs/proof_abc123.jpg"
 * @returns {string|null}
 */
export function buildImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const origin = getBaseOrigin();
  const cleanPath = path.replace(/^\/+/, "");

  return `${origin}/${cleanPath}`;
}