// Ejecutar con: node --experimental-vm-modules --test tests/favoritos-admin.test.mjs
// No requiere instalar bibliotecas: carga únicamente los services ESM del proyecto.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { SourceTextModule } from 'node:vm';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = new Map();
const storage = new Map();

globalThis.localStorage = {
  getItem: (clave) => storage.get(clave) ?? null,
  setItem: (clave, valor) => storage.set(clave, String(valor)),
  removeItem: (clave) => storage.delete(clave),
};
globalThis.fetch = async (url) => {
  try {
    const archivo = path.join(raiz, 'public', String(url).replace(/^\//, ''));
    const contenido = await readFile(archivo, 'utf8');
    return new Response(contenido, { status: 200, headers: { 'content-type': 'application/json' } });
  } catch {
    return new Response('{}', { status: 404 });
  }
};

async function modulo(ruta) {
  const archivo = path.resolve(raiz, ruta);
  if (cache.has(archivo)) return cache.get(archivo);
  const fuente = await readFile(archivo, 'utf8');
  const mod = new SourceTextModule(fuente, { identifier: archivo });
  cache.set(archivo, mod);
  await mod.link((especificador, referencia) => modulo(path.resolve(path.dirname(referencia.identifier), `${especificador}.js`)));
  return mod;
}

const favoritosModulo = await modulo('src/services/favoritosService.js');
await favoritosModulo.evaluate();
const catalogoModulo = cache.get(path.join(raiz, 'src/services/catalogoService.js'));
const favoritos = favoritosModulo.namespace;
const catalogo = catalogoModulo.namespace;

const sesion = (id) => storage.set('sesion', JSON.stringify({ usuario: { id, email: `prueba-${id}@mail.com` } }));
const fallaCon = async (promesa, status) => assert.rejects(promesa, (error) => error.status === status);

test('favoritos.json son ProductoResponse válidos y referencian productos reales', async () => {
  const productos = JSON.parse(await readFile(path.join(raiz, 'public/data/productos.json')));
  const iniciales = JSON.parse(await readFile(path.join(raiz, 'public/data/favoritos.json')));
  const campos = ['id', 'nombre', 'descripcion', 'precio', 'stock', 'imagenUrl', 'activo', 'club'];
  const camposClub = ['id', 'nombre', 'pais', 'escudoUrl'];
  assert.ok(iniciales.length > 0);
  for (const fav of iniciales) {
    assert.deepEqual(Object.keys(fav).sort(), [...campos].sort());
    assert.deepEqual(Object.keys(fav.club).sort(), [...camposClub].sort());
    assert.deepEqual(fav, productos.find((producto) => producto.id === fav.id));
    assert.equal(fav.activo, true);
  }
});

test('favoritos: requiere login, lista, agrega, elimina y respeta duplicados y sesiones', async () => {
  storage.clear();
  await fallaCon(favoritos.listar(), 401);
  sesion(2);
  const inicial = await favoritos.listar();
  assert.deepEqual(inicial.map((p) => p.id), [1, 3]);
  const agregado = await favoritos.agregar(2);
  assert.equal(agregado.id, 2);
  assert.deepEqual((await favoritos.listar()).map((p) => p.id), [1, 3, 2]);
  await fallaCon(favoritos.agregar(2), 409);
  await fallaCon(favoritos.agregar(9999), 404);
  assert.equal(await favoritos.eliminar(2), undefined);
  await fallaCon(favoritos.eliminar(2), 404);
  sesion(1);
  assert.deepEqual((await favoritos.listar()).map((p) => p.id), [1, 3]);
  await favoritos.agregar(2);
  sesion(2);
  assert.deepEqual((await favoritos.listar()).map((p) => p.id), [1, 3]);
});

test('clubes: CRUD, reglas @NotBlank, unicidad y errores', async () => {
  const anteriores = await catalogo.listarClubes();
  await fallaCon(catalogo.crearClub({ nombre: '  ', pais: 'Argentina' }), 400);
  await fallaCon(catalogo.crearClub({ nombre: 'Boca Juniors' }), 409);
  const creado = await catalogo.crearClub({ nombre: ' Club Test ', pais: 'Argentina', escudoUrl: '/escudo.svg' });
  assert.ok(creado.id > 0);
  assert.equal(creado.nombre, 'Club Test');
  assert.ok((await catalogo.listarClubes()).some((club) => club.id === creado.id));
  const cambiado = await catalogo.actualizarClub(creado.id, { nombre: 'Club Test 2', pais: 'Uruguay' });
  assert.equal(cambiado.nombre, 'Club Test 2');
  assert.equal((await catalogo.obtenerClub(creado.id)).pais, 'Uruguay');
  await fallaCon(catalogo.actualizarClub(creado.id, { nombre: 'Boca Juniors' }), 409);
  await fallaCon(catalogo.eliminarClub(99999), 404);
  await catalogo.eliminarClub(creado.id);
  await fallaCon(catalogo.obtenerClub(creado.id), 404);
  assert.deepEqual(await catalogo.listarClubes(), anteriores);
});

test('categorías: CRUD, reglas @NotBlank, unicidad y errores', async () => {
  const anteriores = await catalogo.listarCategorias();
  await fallaCon(catalogo.crearCategoria({ nombre: '' }), 400);
  await fallaCon(catalogo.crearCategoria({ nombre: 'Camisetas' }), 409);
  const nueva = await catalogo.crearCategoria({ nombre: 'Prueba', descripcion: 'Temporal' });
  assert.ok((await catalogo.listarCategorias()).some((c) => c.id === nueva.id));
  const editada = await catalogo.actualizarCategoria(nueva.id, { nombre: 'Prueba editada', descripcion: 'Ok' });
  assert.equal(editada.nombre, 'Prueba editada');
  await fallaCon(catalogo.actualizarCategoria(nueva.id, { nombre: 'Camisetas' }), 409);
  await fallaCon(catalogo.actualizarCategoria(-1, { nombre: 'No existe' }), 404);
  await catalogo.eliminarCategoria(nueva.id);
  await fallaCon(catalogo.obtenerCategoria(nueva.id), 404);
  assert.deepEqual(await catalogo.listarCategorias(), anteriores);
});


test('clubes y categorias respetan exactamente los DTO de respuesta', async () => {
  const clubes = await catalogo.listarClubes();
  const categorias = await catalogo.listarCategorias();
  assert.ok(clubes.length > 0);
  assert.ok(categorias.length > 0);
  for (const club of clubes) {
    assert.deepEqual(Object.keys(club).sort(), ['id', 'nombre', 'pais', 'escudoUrl'].sort());
    assert.equal(typeof club.id, 'number');
    assert.equal(typeof club.nombre, 'string');
  }
  for (const categoria of categorias) {
    assert.deepEqual(Object.keys(categoria).sort(), ['id', 'nombre', 'descripcion'].sort());
    assert.equal(typeof categoria.id, 'number');
    assert.equal(typeof categoria.nombre, 'string');
  }
});
