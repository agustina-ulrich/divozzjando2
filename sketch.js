let model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
let mic;
let pitch;
let audioContext;
let antesHabiaSonido;

let estado = "inicio";
let circulos = [];
let fondos = [];

let gestorAmp;
let gestorPitch;

let umbral_sonido = 0.05;

let altura;
let circulosCreados = 0;
let limiteDiamActual = 50;

let paletas = [
    {
        circulos: ['#D90467', '#53BF21', '#A9BF04', '#A67D03', '#D91604'],
        fondo: ['#FFFFFF']
    },
    {
        circulos: ['#473273', '#070C73', '#11178C', '#1F818C', '#EAF205'],
        fondo: ['#473273', '#070C73', '#C9C7C0']
    },
    {
        circulos: ['#590212', '#BF045B', '#A9BF04', '#A67D03', '#D91604'],
        fondo: ['#640A14', '#CC1300', '#957C00']
    },
    {
        circulos: ['#D90467', '#D9048E', '#3CA643', '#BFA041', '#D91818'],
        fondo: ['#44A34F', '#CBAC48', '#E82616']
    }
];

let paletaActual = parseInt(localStorage.getItem('paletaActual')) || 0;
paletaActual = paletaActual % paletas.length;
localStorage.setItem('paletaActual', (paletaActual + 1) % paletas.length);

function setup() {
    createCanvas(400, 600);
    
    audioContext = getAudioContext();
    mic = new p5.AudioIn(); // Inicializar micrófono
    mic.start(startPitch); // Iniciar micrófono
    
    userStartAudio();
    
    // Seleccionar paleta actual
    let paletaElegida = paletas[paletaActual];
    background(paletaElegida.fondo[0]); // Establecer fondo

    // Agregar círculos de fondo
    fondos.push(new CirculoFondo(200, 300, 450, paletaElegida.fondo));
    fondos.push(new CirculoFondo(100, 100, 200, paletaElegida.fondo));
    fondos.push(new CirculoFondo(300, 500, 150, paletaElegida.fondo));

    //gestorAmp = new GestorAmp();
    //gestorPitch = new GestorPitch();
    gestorAmp = new GestorSenial(0.01, 0.4);
    gestorPitch = new GestorSenial(900,1200);
    gestorPitch = new GestorPitch();
}

function draw() {
    background(255); // Limpiar pantalla 
    // Capturar la intensidad (volumen) del sonido
    let vol = mic.getLevel();
    gestorAmp.actualizar(vol);

    // Determinar si hay sonido
    let haySonido = gestorAmp.filtrada > umbral_sonido;
    let empezoElSonido = haySonido && !antesHabiaSonido;
    let terminoElSonido = !haySonido && antesHabiaSonido;

    
    //console.log("Frecuencia detectada:", altura);
    
    // Dibujar fondos
    for (let fondo of fondos) {
        fondo.dibujar();
    }
    
    // Gestionar el estado "inicio"
    if (estado === "inicio") {
        // Crear y agregar nuevos círculos si hay sonido grave
        if (haySonido && circulosCreados < 10) {
            if (altura < 120) {
                let cantidadCirculos = 10 - circulosCreados; // Número de círculos a crear
                let c = 0;
                while (c < cantidadCirculos) {
                    let nuevoCirculo = new Circulo(paletas[paletaActual], circulos); // Crear un nuevo círculo con la paleta actual
                    if (!nuevoCirculo.seEstaChocandoConOtros(circulos)) {
                        circulos.push(nuevoCirculo); // Agregar el nuevo círculo solo si no está superpuesto
                        //console.log("Nuevo círculo creado:", nuevoCirculo);
                        c++;
                    }
                }
                circulosCreados += cantidadCirculos; // Actualizar contador de círculos creados
            }
        }
        //console.log(haySonido);
        // Actualizar y dibujar círculos
        if (haySonido && altura > 0) {
            // Si la altura es mayor a 800 Hz, los círculos deben decrecer
            if (altura > 800) {
                for (let i = 0; i < circulos.length; i++) {
                    circulos[i].decrecer(); // Método para decrecer instantáneamente
                }
            } else {
                // Si la altura es menor o igual a 800 Hz, los círculos deben crecer
                for (let i = 0; i < circulos.length; i++) {
                    circulos[i].crecer(); // Método para crecer instantáneamente
                }
            }
        } else {
            // Si no hay sonido o la altura es cero, detener el crecimiento instantáneamente
            for (let i = 0; i < circulos.length; i++) {
                circulos[i].detenerCrecimiento(); // Método para detener el crecimiento instantáneamente
            }
        }
    
        
        altura = 0;
        
        
        for (let i = circulos.length - 1; i >= 0; i--) {
            circulos[i].actualizar();
            circulos[i].dibujar();
        
           
            if (circulos[i].fueraDePantalla()) {
                circulos.splice(i, 1); // Eliminar círculos que están fuera de pantalla
            }
        }

        // Reiniciar contador de círculos creados si terminó el sonido
        if (terminoElSonido) {
            circulosCreados = 0;
        }

        // Actualizar el estado del sonido para la próxima iteración
        antesHabiaSonido = haySonido;
    }
      
  
}

// Iniciar detección de tono
function startPitch() {
    pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}

// Cargar modelo
function modelLoaded() {
    getPitch();
}

// Obtener tono actual
function getPitch() {
    pitch.getPitch(function(err, frequency) {
        if (frequency) {
            altura = frequency; // Actualizar altura con la frecuencia detectada
            console.log("Frecuencia capturada:", altura);
            if (mic.getLevel() > 0.1) {
                // Aquí puedes añadir lógica adicional según la frecuencia detectada
            }
        }
        getPitch(); // Llamar recursivamente para seguir detectando tono
    });
}



class GestorAmp {
    constructor() {
        this.filtrada = 0;
    }

    actualizar(vol) {
        this.filtrada = this.filtrar(vol);
    }

    filtrar(vol) {
        // Aplica un filtro al volumen (por ejemplo, un promedio móvil simple)
        return vol * 0.1 + this.filtrada * 0.9;
    }
}

class GestorPitch {
    constructor() {
        this.filtrada = 0;
    }

    actualizar(frequency) {
        this.filtrada = this.filtrar(altura);
    }

    filtrar(frequency) {
        // Aplica un filtro a la altura (por ejemplo, un promedio móvil simple)
        return frequency;
    }
}
