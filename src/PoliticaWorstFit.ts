import { IPoliticaAsignacion } from './IPoliticaAsignacion';
import { BloqueMemoria } from './BloqueMemoria';

export class PoliticaWorstFit implements IPoliticaAsignacion {
    public buscarBloque(bloques: BloqueMemoria[], tamanoRequerido: number): BloqueMemoria | null {
        // Filtramos los útiles y los ordenamos de MAYOR a MENOR tamaño. Agarramos el primero [0].
        return bloques
            .filter(b => b.estaLibre() && b.getTamanio() >= tamanoRequerido)
            .sort((a, b) => b.getTamanio() - a.getTamanio())[0] || null;
    }
}