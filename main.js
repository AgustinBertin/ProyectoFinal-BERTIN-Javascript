const productosContainer = document.querySelector("#productosContainer");
const carritoContainer = document.querySelector("#carritoContainer");
const totalContainer = document.querySelector("#totalContainer");
const finalizarPedidoButton = document.querySelector("#finalizarPedidoButton");
const vaciarCarritoButton = document.querySelector("#vaciarCarritoButton");
const filtroTipo = document.querySelector("#filtroTipo");
const ordenPrecio = document.querySelector("#ordenPrecio");
const busquedaProducto = document.querySelector("#busquedaProducto");
const buscarButton = document.querySelector("#buscarButton");

let carrito = obtenerCarritoGuardado();

function obtenerCarritoGuardado() {
  const carritoGuardado = localStorage.getItem("carrito");
  return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Función para eliminar un producto del carrito
function eliminarProducto(nombreProducto) {
  carrito = carrito.filter((item) => item.producto.nombre !== nombreProducto);
  actualizarCarrito();
  guardarCarrito();
}

// Función para restar la cantidad de un producto en el carrito
function restarProducto(nombreProducto, cantidadActual) {
  if (cantidadActual > 1) {
    carrito.find((item) => item.producto.nombre === nombreProducto).cantidad--;
    actualizarCarrito();
    guardarCarrito();
  }
}

// Función para sumar la cantidad de un producto en el carrito
function sumarProducto(nombreProducto, cantidadActual) {
  carrito.find((item) => item.producto.nombre === nombreProducto).cantidad++;
  actualizarCarrito();
  guardarCarrito();
}

const actualizarCarrito = () => {
  let total = 0;
  let carritoHTML = "";

  carrito.forEach(({ producto, cantidad }) => {
    carritoHTML += `
      <div class="carrito-item mb-2">
        <p class="mb-0"><strong>${producto.nombre}</strong> x${cantidad}</p>
        <button class="btn btn-danger btn-sm me-2" onclick="eliminarProducto('${producto.nombre}')">Eliminar Producto</button>
        <button class="btn btn-primary btn-sm me-2" onclick="restarProducto('${producto.nombre}', ${cantidad})">-</button>
        <button class="btn btn-primary btn-sm" onclick="sumarProducto('${producto.nombre}', ${cantidad})">+</button>
      </div>
    `;
    total += producto.precio * cantidad;
  });

  carritoContainer.innerHTML = carritoHTML;
  totalContainer.innerHTML = `<strong>Total:</strong> $${total.toFixed(2)}`;
};

const agregarProducto = (producto) => {
  const carritoItem = carrito.find(
    (item) => item.producto.nombre === producto.nombre
  );

  if (carritoItem) {
    carritoItem.cantidad++;
  } else {
    carrito.push({ producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
};

const finalizarPedido = () => {
  if (carrito.length > 0) {
    let total = carrito.reduce(
      (accumulator, { producto, cantidad }) =>
        accumulator + producto.precio * cantidad,
      0
    );

    Swal.fire({
      icon: "success",
      title: "¡Pedido finalizado!",
      text: `El Total es: $${total} ¡Gracias por su compra!`,
      confirmButtonText: "Aceptar",
    });
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
  } else {
    Swal.fire({
      icon: "error",
      title: "¡El carrito está vacío!",
      text: "Agrega productos antes de finalizar el pedido.",
    });
  }
};

ordenPrecio.innerHTML =
  '<option value="" selected>Seleccionar</option>' +
  '<option value="ascendente">Menor a Mayor</option>' +
  '<option value="descendente">Mayor a Menor</option>';

const filtrarProductosPorTipo = (tipo) => {
  const tipoSeleccionado = tipo.toLowerCase();
  const productosFiltrados = productos.filter((producto) =>
    tipoSeleccionado === "todos" ? true : producto.tipo === tipoSeleccionado
  );
  mostrarProductos(productosFiltrados);
};

const ordenarProductosPorPrecio = (orden, listaProductos = productos) => {
  const comparador =
    orden === "ascendente"
      ? (a, b) => a.precio - b.precio
      : (a, b) => b.precio - a.precio;
  const productosOrdenados = [...listaProductos].sort(comparador);
  mostrarProductos(productosOrdenados);
};

const buscarProductosPorNombre = (nombre, tipoSeleccionado) => {
  const productosFiltrados = productos.filter(
    (producto) =>
      (tipoSeleccionado === "todos" || producto.tipo === tipoSeleccionado) &&
      producto.nombre.toLowerCase().includes(nombre)
  );

  mostrarProductos(productosFiltrados);
};

const mostrarProductos = (productosMostrados) => {
  productosContainer.innerHTML = "";

  const cardContainer = document.createElement("div");
  cardContainer.className = "row row-cols-2 row-cols-md-4 g-4";

  productosMostrados.forEach((producto) => {
    const card = document.createElement("div");
    card.className = "col";

    card.innerHTML = `
      <div class="card bg-warning mb-3 h-100"> <!-- Agrega la clase "h-100" para igualar el largo -->
        <div class="card-body">
          <h5 class="card-title">${producto.nombre}</h5>
          <p class="card-text">$${producto.precio.toFixed(2)}</p>
          <p class="card-text">${
            producto.descripcion
          }</p> <!-- Agrega la descripción del producto -->
        </div>
        <div class="card-footer">
          <button class="btn btn-primary agregar-button" data-producto="${
            producto.nombre
          }">Agregar al carrito</button>
        </div>
      </div>
    `;

    cardContainer.appendChild(card);

    const agregarButtons = card.querySelectorAll(".agregar-button");
    agregarButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const nombreProducto = event.target.getAttribute("data-producto");
        const productoSeleccionado = productos.find(
          (producto) => producto.nombre === nombreProducto
        );
        agregarProducto(productoSeleccionado);
      });
    });
  });
  productosContainer.appendChild(cardContainer);
};

// Carga de productos desde el archivo JSON
fetch("./db/productos.json")
  .then((resp) => resp.json())
  .then((data) => {
    console.log(data);
    productos = data;
    mostrarProductos(productos);
  })
  .catch((error) => {
    console.error("Error al obtener los productos:", error);
  });

finalizarPedidoButton.addEventListener("click", finalizarPedido);
vaciarCarritoButton.addEventListener("click", () => {
  Swal.fire({
    title: "¿ Deseas vaciar el carrito?",
    text: "¿Estás seguro?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, vaciar carrito",
    cancelButtonText: "Cancelar",
    cancelButtonColor: "#d33",
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      guardarCarrito();
      actualizarCarrito();
      Swal.fire({
        icon: "success",
        title: "Carrito vacío",
        text: "Tu carrito ha sido vaciado exitosamente.",
      });
    }
  });
});

filtroTipo.addEventListener("change", () => {
  const tipoSeleccionado = filtroTipo.value;
  const nombreProducto = busquedaProducto.value.toLowerCase();
  buscarProductosPorNombre(nombreProducto, tipoSeleccionado);
});

ordenPrecio.addEventListener("change", () => {
  const tipoSeleccionado = filtroTipo.value;
  const ordenSeleccionado = ordenPrecio.value;

  if (tipoSeleccionado === "todos") {
    ordenarProductosPorPrecio(ordenSeleccionado, productos);
  } else {
    const productosFiltrados = productos.filter(
      (producto) => producto.tipo === tipoSeleccionado
    );
    ordenarProductosPorPrecio(ordenSeleccionado, productosFiltrados);
  }
});

buscarButton.addEventListener("click", () => {
  const nombreProducto = busquedaProducto.value.toLowerCase();
  buscarProductosPorNombre(nombreProducto);
});

busquedaProducto.addEventListener("input", () => {
  const tipoSeleccionado = filtroTipo.value;
  const nombreProducto = busquedaProducto.value.toLowerCase();
  buscarProductosPorNombre(nombreProducto, tipoSeleccionado);
});

actualizarCarrito();
