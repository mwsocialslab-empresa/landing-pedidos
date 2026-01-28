const URL_SHEETS = "https://script.google.com/macros/s/AKfycbwSDIRtp2ZgUrTUlzylS2ee3M_kNyYtyY2yW_NQl-OtOHDLBpqmYRV6KnARvHgLYDv-/exec";

let carrito = [];
let total = 0;

// CARGAR PRODUCTOS
fetch(URL_SHEETS)
  .then(res => res.json())
  .then(data => {
    const contenedor = document.getElementById("productos");

    data.forEach((p, i) => {
      const precio = p.oferta > 0 ? p.oferta : p.precio;

      contenedor.innerHTML += `
        <div class="col-md-4">
          <div class="card h-100 text-center shadow-sm">
            <div class="card-body">
              <h5>${p.nombre}</h5>
              <p class="text-success fw-bold">$${precio} / ${p.unidad}</p>

              <div class="input-group mb-2">
                <button class="btn btn-outline-secondary"
                  onclick="cambiarCantidad(${i}, -0.5)">−</button>

                <input type="number"
                       class="form-control text-center"
                       id="cant${i}"
                       value="0"
                       readonly>

                <button class="btn btn-outline-secondary"
                  onclick="cambiarCantidad(${i}, 0.5)">+</button>
              </div>

              <p>Subtotal: $<span id="sub${i}">0</span></p>

              <button class="btn btn-success w-100"
                onclick="agregar(${i}, '${p.nombre}', ${precio})">
                Agregar
              </button>
            </div>
          </div>
        </div>
      `;
    });
  });


// ➕➖ CAMBIAR CANTIDAD
function cambiarCantidad(i, valor) {
  const input = document.getElementById(`cant${i}`);
  let cantidad = parseFloat(input.value) || 0;

  cantidad += valor;
  if (cantidad < 0) cantidad = 0;

  input.value = cantidad.toFixed(1);

  const precio = document
    .querySelectorAll(".card")[i]
    .querySelector(".text-success")
    .innerText
    .replace("$", "")
    .split(" ")[0];

  document.getElementById(`sub${i}`).innerText =
    (cantidad * precio).toFixed(2);
}


// 🛒 AGREGAR AL CARRITO
function agregar(i, nombre, precio) {
  const cant = parseFloat(document.getElementById(`cant${i}`).value);
  if (!cant || cant <= 0) return;

  const existente = carrito.find(p => p.nombre === nombre);

  if (existente) {
    existente.cantidad += cant;
  } else {
    carrito.push({ nombre, precio, cantidad: cant });
  }

  total += precio * cant;
  actualizarCarrito();
}


// 🧾 MOSTRAR CARRITO
function actualizarCarrito() {
  const lista = document.getElementById("lista");
  const btnVaciar = document.getElementById("btnVaciar");

  lista.innerHTML = "";

  carrito.forEach((p, i) => {
    lista.innerHTML += `
      <div class="d-flex justify-content-between mb-2">
        <span>${p.cantidad}kg ${p.nombre}</span>
        <span>$${(p.precio * p.cantidad).toFixed(2)}</span>
        <button class="btn btn-sm btn-danger" onclick="eliminar(${i})">✕</button>
      </div>
    `;
  });

  document.getElementById("total").innerText = total.toFixed(2);
  btnVaciar.style.display = carrito.length ? "block" : "none";
}


// ❌ ELIMINAR
function eliminar(i) {
  total -= carrito[i].precio * carrito[i].cantidad;
  carrito.splice(i, 1);
  actualizarCarrito();
}


// 🗑 VACIAR
function vaciarCarrito() {
  carrito = [];
  total = 0;
  actualizarCarrito();
}


// 📲 WHATSAPP
function enviarPedidoWhatsApp() {
  if (!carrito.length) return;

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


