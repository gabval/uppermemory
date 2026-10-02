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

    if(bloque) {
        bloque.liberar();
        this.realizarCoalescencia(); // Fusionamos inmediatamente al liberar
    }
}

  /**
   * RF05: Fusiona bloques libres adyacentes conservando el orden.
   */
  private realizarCoalescencia(): void {
    for(let i = 0; i <this.bloques.length - 1; i++) {
    const actual = this.bloques[i];
    const siguiente = this.bloques[i + 1];

    // IF lógico para ver si ambos vecinos están libres
    if (actual.estaLibre() && siguiente.estaLibre()) {
        const nuevoTamano = actual.getTamano() + siguiente.getTamano();
        const bloqueFusionado = new BloqueMemoria(actual.getDireccionInicio(), nuevoTamano);

        this.bloques.splice(i, 2, bloqueFusionado);

        // Retrocedemos para fusionar en cadena si hay más libres a la derecha
        i--;
    }
}
  }



