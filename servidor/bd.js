// Conexión con MySQL. Un "pool" reutiliza varias conexiones abiertas
// en lugar de abrir y cerrar una por cada petición.
import { readFileSync } from "node:fs";
import mysql from "mysql2/promise";

// Admite una URL completa (la que da Aiven, Railway...) o los datos por separado.
//   DATABASE_URL=mysql://usuario:contraseña@servidor:3306/basededatos?ssl-mode=REQUIRED
//   o bien MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
export function configuracionMySQL(extra = {}) {
  const env = process.env;
  let config;
  if (env.DATABASE_URL) {
    const url = new URL(env.DATABASE_URL);
    config = {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1)
    };
    if (/ssl-mode=(required|verify)/i.test(url.search)) env.MYSQL_SSL ??= "true";
  } else {
    config = {
      host: env.MYSQL_HOST || "localhost",
      port: Number(env.MYSQL_PORT || 3306),
      user: env.MYSQL_USER || "root",
      password: env.MYSQL_PASSWORD || "",
      database: env.MYSQL_DATABASE || "umbrella"
    };
  }

  // Los MySQL en la nube exigen conexión cifrada (SSL). El certificado del
  // proveedor (CA) se pega en MYSQL_CA o se indica su ruta en MYSQL_CA_FILE.
  if (env.MYSQL_SSL === "true") {
    const ca = env.MYSQL_CA || (env.MYSQL_CA_FILE && readFileSync(env.MYSQL_CA_FILE, "utf8"));
    if (ca) config.ssl = { ca };
    else {
      console.warn("[MySQL] SSL sin certificado CA: la conexión va cifrada pero no se verifica el servidor. Añade MYSQL_CA.");
      config.ssl = { rejectUnauthorized: false };
    }
  }

  return { ...config, charset: "utf8mb4", ...extra };
}

export const pool = mysql.createPool(configuracionMySQL({ connectionLimit: 5 }));
