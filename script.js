
const URL_SHEETS = "https://script.google.com/macros/s/AKfycbwb9EhIdBKP2Jqoo1BnYF35cUg304CzvLQzpS0BG1tCqFJ8fCowHLyfgMk_QWZb0jg9Sg/exec";

let carrito = [];
let productos = [];
let total = 0;

// ========================
// CARGA DE PRODUCTOS
// ========================
fetch(URL_SHEETS)
  .then(r => r.json())
  .then(data => {
    const contenedor = document.getElementById("productos");
    let index = 0;

    for (const categoria in data) {
      data[categoria].forEach(p => {
        const esOferta = categoria === "ofertas";
        const precioOriginal = Number(p.precio);
        const precioFinal = p.oferta > 0 ? Number(p.oferta) : precioOriginal;

        productos.push({
          nombre: p.nombre,
          precio: precioFinal,
          unidad: p.unidad
        });

        contenedor.innerHTML += `
          <div class="col-12 col-md-4 col-lg-3 producto"
               data-categoria="${categoria}"
               data-oferta="${esOferta}">
            <div class="card h-100 shadow-sm text-center">
              ${p.imagen ? `<img src="${p.imagen}" class="card-img-top" style="height:180px;object-fit:cover">` : ""}
              <div class="card-body">
                <h5>${p.nombre}</h5>

                ${esOferta
                  ? `<p><del>$${precioOriginal}</del> <b class="text-danger">$${precioFinal}</b></p>`
                  : `<p class="fw-bold">$${precioFinal}</p>`
                }

                <div class="input-group mb-2">
                  <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${index}, -0.5)">−</button>
                  <input id="cant${index}" class="form-control text-center" value="0" readonly>
                  <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${index}, 0.5)">+</button>
                </div>

                <p>Subtotal: $<span id="sub${index}">0</span></p>

                <button class="btn btn-success w-100" onclick="agregar(${index})">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        `;
        index++;
      });
    }
  });

// ========================
// CANTIDAD
// ========================
function cambiarCantidad(i, v) {
  const input = document.getElementById(`cant${i}`);
  let cant = parseFloat(input.value) || 0;
  cant += v;
  if (cant < 0) cant = 0;
  input.value = cant.toFixed(1);
  document.getElementById(`sub${i}`).innerText =
    (cant * productos[i].precio).toFixed(2);
}

// ========================
// CARRITO
// ========================
function agregar(i) {
  const cant = parseFloat(document.getElementById(`cant${i}`).value);
  if (!cant) return;

  const prod = productos[i];
  const existe = carrito.find(p => p.nombre === prod.nombre);

  if (existe) existe.cantidad += cant;
  else carrito.push({ ...prod, cantidad: cant });

  document.getElementById(`cant${i}`).value = 0;
  document.getElementById(`sub${i}`).innerText = "0";

  actualizarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById("lista");
  const listaModal = document.getElementById("listaModal");
  const totalSpan = document.getElementById("total");
  const totalModal = document.getElementById("totalModal");
  const contador = document.getElementById("contadorCarrito");

  lista.innerHTML = "";
  listaModal.innerHTML = "";
  total = 0;

  carrito.forEach((p, i) => {
    const sub = p.precio * p.cantidad;
    total += sub;

    const html = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span>${p.cantidad}kg ${p.nombre}</span>
        <span>$${sub.toFixed(2)}</span>
        <button class="btn btn-sm btn-danger" onclick="eliminar(${i})">✕</button>
      </div>
    `;

    lista.innerHTML += html;
    listaModal.innerHTML += html;
  });

  totalSpan.innerText = total.toFixed(2);
  totalModal.innerText = total.toFixed(2);

  if (contador) {
    contador.style.display = carrito.length ? "inline-block" : "none";
    contador.innerText = carrito.length;
  }
}

function eliminar(i) {
  carrito.splice(i, 1);
  actualizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  actualizarCarrito();
}

// ========================
// WHATSAPP
// ========================
function enviarPedidoWhatsApp() {
  if (!carrito.length) return;

  const inputDesktop = document.getElementById("direccion");
  const inputModal = document.getElementById("direccionModal");

  let direccion = "";

  // Prioridad: si el modal está visible → usar ese input
  if (inputModal && inputModal.offsetParent !== null) {
    direccion = inputModal.value.trim();
  } else if (inputDesktop) {
    direccion = inputDesktop.value.trim();
  }

  // 🚨 VALIDACIÓN REAL
  if (!direccion) {
    new bootstrap.Modal(
      document.getElementById("modalDireccion")
    ).show();
    return;
  }

  let msg = "🛒 *Pedido*\n\n";
  carrito.forEach(p => {
    msg += `• ${p.nombre} - ${p.cantidad}kg\n`;
  });

  msg += `\n📍 Dirección:\n${direccion}`;
  msg += `\n💰 Total: $${total.toFixed(2)}`;

  window.open(
    `https://wa.me/5491127461954?text=${encodeURIComponent(msg)}`
  );
}



// ========================
// MERCADO PAGO
// ========================
function pagarMP() {
  if (!carrito.length) return;

  const totalTexto = total.toFixed(2);
  const alias = "walter30mp";

  alert(
    "Se abrirá Mercado Pago.\n\n" +
    "👉 Alias: " + alias + "\n" +
    "💰 Total a pagar: $" + totalTexto
  );

  // Abrir Mercado Pago
  window.open(
    `https://www.mercadopago.com.ar/home?alias=${alias}`,
    "_blank"
  );

  // 🧹 LIMPIAR TODO EL CARRITO
  carrito = [];
  total = 0;

  // Limpiar listas
  const lista = document.getElementById("lista");
  const listaModal = document.getElementById("listaModal");

  if (lista) lista.innerHTML = "";
  if (listaModal) listaModal.innerHTML = "";

  // Reset totales
  document.getElementById("total").innerText = "0";
  const totalModal = document.getElementById("totalModal");
  if (totalModal) totalModal.innerText = "0";

  // Ocultar contador
  const contador = document.getElementById("contadorCarrito");
  if (contador) contador.style.display = "none";

  // Limpiar inputs
  document.querySelectorAll("input[type='number']").forEach(i => i.value = 0);
  document.getElementById("direccion").value = "";
  const dirModal = document.getElementById("direccionModal");
  if (dirModal) dirModal.value = "";

  // Cerrar modal si está abierto
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalCarrito")
  );
  if (modal) modal.hide();
}

