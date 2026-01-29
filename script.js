const URL_SHEETS = "https://script.google.com/macros/s/AKfycbz_5urxfhMWvV8ojLie3fRVE7TP-hKZmaQmQYNuZCOTug6oTdX341chGN4ow9QPbsdmYQ/exec";

let carrito = [];
let productos = [];
let total = 0;

// ========================
// CARGA DE PRODUCTOS
// ========================
fetch(URL_SHEETS)
  .then(r => r.json())
  .then(data => {
    console.log("RESPUESTA:", data);

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
          precioOriginal,
          unidad: p.unidad,
          esOferta
        });

        contenedor.innerHTML += `
          <div class="col-12 col-md-4 col-lg-3 producto"
               data-categoria="${categoria}"
               data-oferta="${esOferta}">
            <div class="card h-100 shadow-sm text-center">
              <div class="card-body">

                <h5>${p.nombre}</h5>

                ${
                  esOferta
                    ? `<p class="mb-1">
                        <span class="text-muted text-decoration-line-through">$${precioOriginal}</span>
                        <span class="text-danger fw-bold fs-5 ms-2">$${precioFinal}</span>
                      </p>`
                    : `<p class="fw-bold text-success">$${precioFinal}</p>`
                }

                <small class="text-muted">x ${p.unidad}</small>

                <div class="input-group my-2">
                  <button class="btn btn-outline-secondary"
                    onclick="cambiarCantidad(${index}, -0.5)">−</button>

                  <input type="number"
                    class="form-control text-center"
                    id="cant${index}"
                    value="0"
                    readonly>

                  <span class="input-group-text">kg</span>

                  <button class="btn btn-outline-secondary"
                    onclick="cambiarCantidad(${index}, 0.5)">+</button>
                </div>

                <p>Subtotal: $<span id="sub${index}">0</span></p>

                <button class="btn btn-success w-100"
                  onclick="agregar(${index})">
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
function cambiarCantidad(i, valor) {
  const input = document.getElementById(`cant${i}`);
  let cant = parseFloat(input.value) || 0;

  cant += valor;
  if (cant < 0) cant = 0;

  input.value = cant.toFixed(1);
  document.getElementById(`sub${i}`).innerText =
    (cant * productos[i].precio).toFixed(2);
}

// ========================
// CARRITO
// ========================
function agregar(i) {
  const input = document.getElementById(`cant${i}`);
  const cant = parseFloat(input.value);

  if (!cant || cant <= 0) return;

  const prod = productos[i];
  const existe = carrito.find(p => p.nombre === prod.nombre);

  if (existe) {
    existe.cantidad += cant;
  } else {
    carrito.push({
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: cant
    });
  }

  input.value = 0;
  document.getElementById(`sub${i}`).innerText = "0";
  actualizarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById("lista");
  const btnVaciar = document.getElementById("btnVaciar");

  lista.innerHTML = "";
  total = 0;

  carrito.forEach((p, i) => {
    const sub = p.precio * p.cantidad;
    total += sub;

    lista.innerHTML += `
      <div class="d-flex justify-content-between mb-2">
        <span>${p.cantidad}kg ${p.nombre}</span>
        <span>$${sub.toFixed(2)}</span>
        <button class="btn btn-sm btn-danger" onclick="eliminar(${i})">✕</button>
      </div>
    `;
  });

  document.getElementById("total").innerText = total.toFixed(2);
  btnVaciar.style.display = carrito.length ? "block" : "none";
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
// FILTRO
// ========================
function filtrar(cat) {
  document.querySelectorAll(".producto").forEach(p => {
    if (cat === "todos") {
      p.style.display = "block";
    } else if (cat === "ofertas") {
      p.style.display = p.dataset.oferta === "true" ? "block" : "none";
    } else {
      p.style.display =
        p.dataset.categoria === cat ? "block" : "none";
    }
  });
}

// ========================
// WHATSAPP
// ========================
function enviarPedidoWhatsApp() {
  if (!carrito.length) return;

  const dir = document.getElementById("direccion").value.trim();
  if (!dir) {
    new bootstrap.Modal(
      document.getElementById("modalDireccion")
    ).show();
    return;
  }

  let msg = "🛒 *Pedido*\n\n";
  carrito.forEach(p => {
    msg += `• ${p.nombre} - ${p.cantidad}kg\n`;
  });

  msg += `\n📍 Dirección:\n${dir}`;
  msg += `\n\n💰 Total: $${total.toFixed(2)}`;

  window.open(
    `https://wa.me/5491127461954?text=${encodeURIComponent(msg)}`
  );
}
