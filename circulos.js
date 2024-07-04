class Circulo {
    constructor(paleta) {
        // Inicializar con valores aleatorios
        this.x = random(width);
        this.y = random(height);
        this.r = random(5, 20); // Tamaño inicial
        this.tamanoreal = 0;
        this.tieneCirculoInterior = random() < 0.5; // 50% de probabilidad de tener un círculo interior
        // Colores desde paleta
        this.rColor = color(random(paleta.circulos));
        this.innerRColor = color(random(paleta.circulos));
    }

    // Dibujar círculo
    dibujar() {
        noStroke();
        fill(this.rColor);
        ellipse(this.x, this.y, this.r * 2 * this.tamanoreal, this.r * 2 * this.tamanoreal);
        if (this.tieneCirculoInterior) {
            fill(this.innerRColor);
            ellipse(this.x, this.y, this.r * this.tamanoreal, this.r * this.tamanoreal);
        }
    }

    crecer() {
        console.log("Creciendo círculo", this);
        this.tamanoreal += 0.01;
        this.tamanoreal = constrain(this.tamanoreal, 0, 1);
    }

    decrecer() {
        console.log("Decreciendo círculo", this);
        this.tamanoreal -= 0.01;
        this.tamanoreal = constrain(this.tamanoreal, 0, 1);
    }


    detenerCrecimiento() {
        this.tamanorealDetenido = this.tamanoreal; // Detiene el crecimiento instantáneamente
    }



    // Colisión con otros círculos
    seVaAChocarCon(otro) {
        return dist(this.x, this.y, otro.x, otro.y) < this.r + otro.r;
    }

    // Detectar colisión
    seEstaChocandoConOtros(otrosCirculos) {
        for (let otro of otrosCirculos) {
            if (this.seVaAChocarCon(otro)) {
                return true;
            }
        }
        return false;
    }

    // Actualizar posición o tamaño del círculo
    actualizar() {
        // Por ejemplo, podrías hacer que los círculos se muevan o cambien de tamaño aquí
        // En este ejemplo, no se actualiza nada porque los círculos están estáticos
    }

    // Verificar si el círculo está fuera de pantalla
    fueraDePantalla() {
        return (this.x + this.r < 0 || this.x - this.r > width || this.y + this.r < 0 || this.y - this.r > height);
    }
}
