export class ReporteMetricas {
    // RF10: Atributos de solo lectura para garantizar inmutabilidad
    public readonly ocupacionMemoriaPorcentaje: number;
    public readonly utilizacionCpuPorcentaje: number;
    public readonly cambiosContextoAcumulados: number;
    public readonly fragmentacionExternaPorcentaje: number;

    constructor(
        ticksTotales: number,
        ticksCpuOcupada: number,
        cambiosContexto: number,
        memoriaTotal: number,
        memoriaLibreTotal: number,
        mayorBloqueLibre: number
    ) {
        this.cambiosContextoAcumulados = cambiosContexto;

        // Uso de CPU %: (Ocupada / Total) * 100
        // El "|| 1" evita la división por cero (NaN) en el tick 0, sin usar un IF.
        this.utilizacionCpuPorcentaje = (ticksCpuOcupada / (ticksTotales || 1)) * 100;

        // Ocupación de Memoria %: (Usada / Total) * 100
        const memoriaOcupada = memoriaTotal - memoriaLibreTotal;
        this.ocupacionMemoriaPorcentaje = (memoriaOcupada / (memoriaTotal || 1)) * 100;

        // Fragmentación Externa %: (1 - (Mayor / Libre)) * 100
        // Usamos cortocircuito: si no hay memoria libre, da 0 directo. Si hay, hace la cuenta.
        const fraccion = 1 - (mayorBloqueLibre / (memoriaLibreTotal || 1));
        this.fragmentacionExternaPorcentaje = (memoriaLibreTotal > 0 && (fraccion * 100)) || 0;
    }
}