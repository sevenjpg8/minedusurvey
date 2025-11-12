import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://minedu.creainter.com.pe';
  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/encuesta`, lastModified: new Date() },
    // Agrega más rutas aquí
  ];
}
