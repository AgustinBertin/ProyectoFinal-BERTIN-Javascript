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

const actualizarCarrito = () => {
  carritoContainer.innerHTML = "";
  let total = 0;

  carrito.forEach(({ producto, cantidad }) => {
    const carritoItem = document.createElement("div");
    carritoItem.className = "carrito-item";

    const carritoTexto = document.createElement("p");
    carritoTexto.innerText = `${producto.nombre} x${cantidad}`;
    carritoItem.appendChild(carritoTexto);

    const btnEliminar = document.createElement("button");
    btnEliminar.innerText = "Eliminar Producto";
    btnEliminar.addEventListener("click", () => {
      carrito = carrito.filter(
        (item) => item.producto.nombre !== producto.nombre
      );
      actualizarCarrito();
      guardarCarrito();
    });
    carritoItem.appendChild(btnEliminar);

    const btnRestar = document.createElement("button");
    btnRestar.innerText = "-";
    btnRestar.addEventListener("click", () => {
      if (cantidad > 1) {
        carrito.find((item) => item.producto.nombre === producto.nombre)
          .cantidad--;
        actualizarCarrito();
        guardarCarrito();
      }
    });
    carritoItem.appendChild(btnRestar);

    const cantidadProducto = document.createElement("span");
    cantidadProducto.innerText = cantidad;

    const btnSumar = document.createElement("button");
    btnSumar.innerText = "+";
    btnSumar.addEventListener("click", () => {
      carrito.find((item) => item.producto.nombre === producto.nombre)
        .cantidad++;
      actualizarCarrito();
      guardarCarrito();
    });
    carritoItem.appendChild(btnSumar);

    carritoContainer.appendChild(carritoItem);
    total += producto.precio * cantidad;
  });

  totalContainer.innerText = `Total: $${total.toFixed(2)}`;
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

  productosMostrados.forEach((producto) => {
    productosContainer.innerHTML += `
      <div class="producto-container">
        <h3>${producto.nombre}</h3>
        <p>$${producto.precio.toFixed(2)}</p>
        <button class="agregar-button" data-producto="${
          producto.nombre
        }">Agregar al carrito</button>
      </div>
    `;
  });

  const agregarButtons = document.querySelectorAll(".agregar-button");
  agregarButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const nombreProducto = event.target.getAttribute("data-producto");
      const productoSeleccionado = productos.find(
        (producto) => producto.nombre === nombreProducto
      );
      agregarProducto(productoSeleccionado);
    });
  });
};

// Carga de productos desde el archivo JSON
fetch("./db/productos.json")
  .then((resp) => resp.json())
  .then((data) => {
    // Aquí puedes trabajar con los productos obtenidos, por ejemplo, mostrarlos en la página
    console.log(data);
    // Asigna los productos a la variable 'productos'
    productos = data;
    // Luego, llama a mostrarProductos para mostrarlos en la página
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
