
// 🧾 CARGAR PRODUCTOS
const URL_SHEETS = "https://script.google.com/macros/s/AKfycbzYZXizwOl7VWgxjTU7LeFzg91HuS8Fh1o4aDDRw4mWjCd8Q4xzRMewc1yNzRkb_PyL_g/exec";

let carrito = [];
let total = 0;
let productos = [];

// 🧾 CARGAR PRODUCTOS
fetch(URL_SHEETS)
  .then(res => res.json())
  .then(data => {
    const contenedor = document.getElementById("productos");
    let index = 0;

    for (const categoria in data) {
      data[categoria].forEach(p => {

        const precioOriginal = Number(p.precio);
        const precioFinal = Number(p.oferta) > 0 ? Number(p.oferta) : precioOriginal;

        productos.push({
          nombre: p.nombre,
          precio: precioFinal,
          precioOriginal: precioOriginal,
          unidad: p.unidad
        });

        contenedor.innerHTML += `
          <div class="col-6 col-md-4 col-lg-3 producto"" data-categoria="${categoria}">
            <div class="card h-100 text-center shadow-sm">
              <div class="card-body">

                <h5>${p.nombre}</h5>

                <p class="text-success fw-bold">
                  $${precioFinal} / ${p.unidad}
                </p>

                <div class="input-group mb-2">
                  <button class="btn btn-outline-secondary"
                    onclick="cambiarCantidad(${index}, -0.5)">−</button>

                  <input type="number"
                    class="form-control text-center"
                    id="cant${index}"
                    value="0"
                    readonly></input>

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

function cambiarCantidad(i, valor) {
  const input = document.getElementById(`cant${i}`);
  let cantidad = parseFloat(input.value) || 0;

  cantidad += valor;
  if (cantidad < 0) cantidad = 0;

  input.value = cantidad.toFixed(1);

  const precio = productos[i].precio;
  document.getElementById(`sub${i}`).innerText =
    (cantidad * precio).toFixed(2);
}
function agregar(i) {
  const input = document.getElementById(`cant${i}`);
  const cant = parseFloat(input.value);

  // Si no eligió cantidad, no hace nada
  if (!cant || cant <= 0) return;

  const producto = productos[i];

  const existente = carrito.find(p => p.nombre === producto.nombre);

  if (existente) {
    existente.cantidad += cant;
  } else {
    carrito.push({
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: cant
    });
  }

  total += producto.precio * cant;
  actualizarCarrito();

  // ✅ RESETEAR CAMPOS (ESTO ES LO IMPORTANTE)
  input.value = "0";
  document.getElementById(`sub${i}`).innerText = "0";
}

function actualizarCarrito() {
  const lista = document.getElementById("lista");
  const btnVaciar = document.getElementById("btnVaciar");

  lista.innerHTML = "";
  total = 0;

  carrito.forEach((p, i) => {
    const subtotal = p.precio * p.cantidad;
    total += subtotal;

    lista.innerHTML += `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span>${p.cantidad}kg ${p.nombre}</span>
        <span>$${subtotal.toFixed(2)}</span>
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
  total = 0;
  actualizarCarrito();
}
function enviarPedidoWhatsApp() {
  if (carrito.length === 0) return;

  const direccion = document.getElementById("direccion").value.trim();

  if (!direccion) {
    const modal = new bootstrap.Modal(
      document.getElementById("modalDireccion")
    );
    modal.show();
    return;
  }

  let msg = "🛒 *Pedido*\n\n";

  carrito.forEach(p => {
    msg += `• ${p.nombre} - ${p.cantidad}kg\n`;
  });

  msg += `\n📍 Dirección:\n${direccion}`;
  msg += `\n\n💰 Total: $${total.toFixed(2)}`;

  window.open(
    `https://wa.me/5491127461954?text=${encodeURIComponent(msg)}`
  );
}
function filtrar(categoria) {
  const productosDOM = document.querySelectorAll(".producto");

  productosDOM.forEach((p, i) => {
    if (categoria === "todos") {
      p.style.display = "block";
      return;
    }

    if (categoria === "ofertas") {
      const tieneOferta = productos[i].precio < productos[i].precioOriginal;
      p.style.display = tieneOferta ? "block" : "none";
      return;
    }

    p.style.display =
      p.dataset.categoria === categoria ? "block" : "none";
  });
}


