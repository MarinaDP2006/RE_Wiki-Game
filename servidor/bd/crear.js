// Crea las tablas y carga los datos de la wiki en MySQL.
// Uso (desde servidor/):  npm run bd:crear
// ¡Cuidado! Borra las tablas existentes, incluidos los usuarios registrados.
import { readFileSync } from "node:fs";
import mysql from "mysql2/promise";
import { configuracionMySQL } from "../bd.js";

// Los .sql empiezan con CREATE DATABASE umbrella y USE umbrella para poder
// importarlos en phpMyAdmin. Aquí se quitan esas líneas y se usa la base de
// datos del .env (en Aiven, por ejemplo, se llama defaultdb).
const leer = archivo => readFileSync(new URL(archivo, import.meta.url), "utf8")
  .replace(/^CREATE DATABASE[^;]*;\s*$/gim, "")
  .replace(/^USE [^;]*;\s*$/gim, "");

const conexion = await mysql.createConnection(configuracionMySQL({ multipleStatements: true }));
try {
  console.log("Creando tablas (esquema.sql)…");
  await conexion.query(leer("./esquema.sql"));
  console.log("Cargando datos de la wiki (datos.sql)…");
  await conexion.query(leer("./datos.sql"));

  const [filas] = await conexion.query(`
    SELECT 'juegos' AS tabla, COUNT(*) AS total FROM juegos UNION ALL
    SELECT 'personajes', COUNT(*) FROM personajes UNION ALL
    SELECT 'criaturas', COUNT(*) FROM criaturas UNION ALL
    SELECT 'virus', COUNT(*) FROM virus UNION ALL
    SELECT 'organizaciones', COUNT(*) FROM organizaciones UNION ALL
    SELECT 'lugares', COUNT(*) FROM lugares UNION ALL
    SELECT 'peliculas', COUNT(*) FROM peliculas UNION ALL
    SELECT 'cronologia', COUNT(*) FROM cronologia UNION ALL
    SELECT 'expedientes', COUNT(*) FROM expedientes`);
  console.table(filas);
  console.log("Base de datos lista.");
} finally {
  await conexion.end();
}
