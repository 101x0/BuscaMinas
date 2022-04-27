let filas = 20;
let columnas = 20;
let lado = 30;
let minas = filas * columnas * 0.1;
let enJuego = true;
let juegoIniciado = false;
let marcas = 0;
let tablero = [];

nuevoJuego();

function nuevoJuego() {
  reiniciar();
  generarTableroHTML();
  generarTableroJuego();
  aniadirEventos();
  actualizarTablero();
}

async function ajustes() {
  const { value: ajustes } = await swal.fire({
    title: "Ajustes",
    html: `
    <hr>
    <br>        
        <label for="dificultad">Dificultad &nbsp; (minas/área)</label>
        <br>
        <input class="swal2-input" id="dificultad" type="number" min="10" max="40" step="1" value="${Math.round((100 * minas) / (filas * columnas) * 100) / 100}">
        <span id="valor-dificultad">%</span>
        <br>
        <br>
        <label for="filas">Filas</label>
        <br>
        <input class="swal2-input" type="number" value=${filas} placeholder="filas" id="filas" min="10" max="40" step="1">
        <br>
        <br>
        <label for="columnas">Columnas</label>

        <br>
        <input class="swal2-input" type="number" value=${columnas} placeholder="columnas" id="columnas" min="10" max="40" step="1">
        <br>
        `,
    confirmButtonText: "Establecer",
    cancelButtonText: "Cancelar",
    showCancelButton: true,
    preConfirm: () => {
      return {
        columnas: document.getElementById("columnas").value,
        filas: document.getElementById("filas").value,
        dificultad: document.getElementById("dificultad").value,
      };
    },
  });
  if (!ajustes) {
    return;
  }
  filas = Math.floor(ajustes.filas);
  columnas = Math.floor(ajustes.columnas);
  minas = Math.floor((columnas * filas * ajustes.dificultad) / 100);
  nuevoJuego();
}

function ayuda() {
  Swal.fire({
    title: "Controles:",
    html: "<hr><br>Click izquierdo para descubrir la celda.<br><br>Click derecho para colocar una bandera.<br><br>Doble click para despejar las celdas de alrededor",
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  });
}

function reiniciar() {
  marcas = 0;
  enJuego = true;
  juegoIniciado = false;
}

function generarTableroHTML() {
  let html = "";
  for (let f = 0; f < filas; f++) {
    html += `<tr>`;
    for (let c = 0; c < columnas; c++) {
      html += `<td id="celda-${f}-${c}" style="width:${lado}px;height:${lado}px"></td>`;
    }
    html += `</tr>`;
  }
  let tableroHTML = document.getElementById("tablero");
  tableroHTML.innerHTML = html;
  tableroHTML.style.width = columnas * lado + "px";
  tableroHTML.style.height = filas * lado + "px";
  tableroHTML.style.background = "slategray";
}

function aniadirEventos() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let celda = document.getElementById(`celda-${f}-${c}`);
      celda.addEventListener("dblclick", (me) => {
        dobleClick(f, c, me);
      });
      celda.addEventListener("mouseup", (me) => {
        click(f, c, me);
      });
    }
  }
}

function dobleClick(f, c, me) {
  if (!enJuego) {
    return;
  }
  despejar(f, c);
  actualizarTablero();
}

function click(f, c, me) {
  if (!enJuego) {
    return;
  }
  if (tablero[f][c].estado == "descubierto") {
    return;
  }
  switch (me.button) {
    case 0: // click izq
      if (tablero[f][c].estado == "marcado") {
        break;
      }
      tablero[f][c].estado = "descubierto";
      juegoIniciado = true;
      if (tablero[f][c].valor == 0) {
        despejar(f, c);
      }
      break;

    case 1: // scroll
      break;

    case 2: // click derecho
      if (tablero[f][c].estado == "marcado") {
        tablero[f][c].estado = undefined;
        marcas--;
      } else {
        tablero[f][c].estado = "marcado";
        marcas++;
      }
      break;

    default:
      break;
  }
  actualizarTablero();
}

function despejar(f, c) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i == 0 && j == 0) {
        continue;
      }
      try {
        if (
          tablero[f + i][c + j].estado != "descubierto" &&
          tablero[f + i][c + j].estado != "marcado"
        ) {
          tablero[f + i][c + j].estado = "descubierto";
          if (tablero[f + i][c + j].valor == 0) {
            despejar(f + i, c + j);
          }
        }
      } catch (e) {}
    }
  }
}

function actualizarTablero() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let celda = document.getElementById(`celda-${f}-${c}`);
      if (tablero[f][c].estado == "descubierto") {
        celda.style.boxShadow = "none";
        switch (tablero[f][c].valor) {
          case -1:
            celda.innerHTML = `<i class="fas fa-bomb"></i>`;
            celda.style.color = "black";
            break;
          case 0:
            break;
          default:
            celda.innerHTML = tablero[f][c].valor;
            break;
        }
      }
      if (tablero[f][c].estado == "marcado") {
        celda.innerHTML = `<i class="fas fa-flag"></i>`;
        celda.style.color = "red";
        celda.style.background = "cadetblue";
      }
      if (tablero[f][c].estado == undefined) {
        celda.innerHTML = ``;
        celda.style.background = "";
        celda.style.color = "";
      }
    }
  }
  verificarPerdedor();
  verificarGanador();
  actualizarPanelMinas();
}

function actualizarPanelMinas() {
  let panel = document.getElementById("minas");
  panel.innerHTML = minas - marcas;
}

function verificarGanador() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (tablero[f][c].estado != `descubierto`) {
        if (tablero[f][c].valor == -1) {
          continue;
        } else {
          return;
        }
      }
    }
  }
  let tableroHTML = document.getElementById("tablero");
  tableroHTML.style.background = "forestgreen";
  enJuego = false;
  Swal.fire({
    title: "Victoria !!!",
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  });
}

function verificarPerdedor() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (tablero[f][c].estado == "descubierto" && tablero[f][c].valor == -1) {
        let tableroHTML = document.getElementById("tablero");
        tableroHTML.style.background = "brown";
        enJuego = false;

        Swal.fire({
          title: "Game Over",
          showClass: {
            popup: "animate__animated animate__fadeInDown",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp",
          },
        });
      }
    }
  }

  if (enJuego) {
    return;
  }

  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (tablero[f][c].valor == -1) {
        let celda = document.getElementById(`celda-${f}-${c}`);
        celda.innerHTML = `<i class="fas fa-bomb"></i>`;
        celda.style.color = "black";
      }
    }
  }
}

function generarTableroJuego() {
  vaciarTablero();
  colocarMinas();
  contadoresMinas();
}

function vaciarTablero() {
  tablero = [];
  for (let i = 0; i < filas; i++) {
    tablero.push([]);
  }
}

function colocarMinas() {
  for (let m = 0; m < minas; m++) {
    let f = 0;
    let c = 0;
    do {
      f = Math.floor(Math.random() * filas);
      c = Math.floor(Math.random() * columnas);
    } while (tablero[f][c]);
    tablero[f][c] = { valor: -1 };
  }
}

function contadoresMinas() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (!tablero[f][c]) {
        let contador = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) {
              continue;
            }
            try {
              if (tablero[f + i][c + j].valor == -1) {
                contador++;
              }
            } catch (e) {}
          }
        }
        tablero[f][c] = { valor: contador };
      }
    }
  }
}
