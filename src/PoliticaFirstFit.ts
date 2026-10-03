import { IPoliticaAsignacion } from './IPoliticaAsignacion';
import { BloqueMemoria } from './BloqueMemoria';

export class PoliticaFirstFit implements IPoliticaAsignacion {
    public buscarBloque(bloques: BloqueMemoria[], tamanoRequerido: number): BloqueMemoria | null {
        // Busca el primero que esté libre y alcance. Si no hay, devuelve null[cite: 11].
        return bloques.find(b => b.estaLibre() && b.getTamanio() >= tamanoRequerido) || null;
    }
}