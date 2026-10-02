import { BloqueMemoria } from './BloqueMemoria';
import { IPoliticaAsignacion } from './IPoliticaAsignacion';
import { Proceso } from './Proceso';

export class GestorMemoria {
    private memoriaTotal: number;
    private bloques: BloqueMemoria[];
    private politicaAsignacion: IPoliticaAsignacion;

    constructor(memoriaTotal: number, politicaAsignacion: IPoliticaAsignacion) {
        this.memoriaTotal = memoriaTotal;
        this.politicaAsignacion = politicaAsignacion;

        this.bloques = [new BloqueMemoria(0, memoriaTotal)];
    }

    // --- COMPORTAMIENTO PRINCIPAL ---

    // RF04: Intenta asignar memoria al proceso usando la política configurada.
    public asignar(proceso: Proceso): boolean {
        const bloqueEncontrado = this.politicaAsignacion.buscarBloque(this.bloques, proceso.getMemoriaRequerida());

        if (!bloqueEncontrado) {
            return false; // La asignación falla si no hay espacio
        }

        bloqueEncontrado.asignar(proceso);
        const bloqueSobrante = bloqueEncontrado.dividir(proceso.getMemoriaRequerida());

        // IF normal para ver si la función dividir nos devolvió un sobrante
        if (bloqueSobrante) {
            const index = this.bloques.indexOf(bloqueEncontrado);
            this.bloques.splice(index + 1, 0, bloqueSobrante);
        }

        return true;
    }

    /**
     * RF05: Libera la memoria de un proceso que finaliza.
     */
    public liberar(proceso: Proceso): void {
        const bloque = this.bloques.find(b => b.getProcesoAsignado()?.getPid() === proceso.getPid());

        if (bloque) {
            bloque.liberar();
            this.realizarCoalescencia(); // Fusionamos inmediatamente al liberar
        }
    }

    /**
     * RF05: Fusiona bloques libres adyacentes conservando el orden.
     */
    private realizarCoalescencia(): void {
        for (let i = 0; i < this.bloques.length - 1; i++) {
            const actual = this.bloques[i];
            const siguiente = this.bloques[i + 1];

            // IF lógico para ver si ambos vecinos están libres
            if (actual.estaLibre() && siguiente.estaLibre()) {
                const nuevoTamano = actual.getTamanio() + siguiente.getTamanio();
                const bloqueFusionado = new BloqueMemoria(actual.getDireccionInicio(), nuevoTamano);

                this.bloques.splice(i, 2, bloqueFusionado);

                // Retrocedemos para fusionar en cadena si hay más libres a la derecha
                i--;
            }
        }
    }

    // --- MÉTRICAS Y VISTAS (RF09 y RF10) ---

    public getMemoriaLibreTotal(): number {
        return this.bloques
            .filter(b => b.estaLibre())
            .reduce((suma, b) => suma + b.getTamanio(), 0);
    }

    public getMayorBloqueLibre(): number {
        const bloquesLibres = this.bloques.filter(b => b.estaLibre());

        // IF de validación matemática
        if (bloquesLibres.length === 0) {
            return 0; // Si no hay bloques libres, el mayor es 0
        }

        return Math.max(...bloquesLibres.map(b => b.getTamanio()));
    }

    // RF10: Devolvemos copias (objetos planos) para no romper el doble encapsulamiento
    public obtenerMapaMemoria(): Array<{ inicio: number, tamano: number, libre: boolean, pidAsignado: number | null }> {
        return this.bloques.map(b => ({
            inicio: b.getDireccionInicio(),
            tamano: b.getTamanio(),
            libre: b.estaLibre(),
            pidAsignado: b.getProcesoAsignado()?.getPid() || null
        }));
    }
}
