import { IPoliticaAsignacion } from './IPoliticaAsignacion';
import { BloqueMemoria } from './BloqueMemoria';

export class PoliticaBestFit implements IPoliticaAsignacion {
    public buscarBloque(bloques: BloqueMemoria[], tamanoRequerido: number): BloqueMemoria | null {

        return bloques
            .filter(b => b.estaLibre() && b.getTamanio() >= tamanoRequerido)
            .sort((a, b) => a.getTamanio() - b.getTamanio())[0] || null;
    }
}