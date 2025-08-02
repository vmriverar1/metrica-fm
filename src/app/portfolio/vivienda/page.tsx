import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';

export default function ProyectosViviendaPage() {
  return (
    <CategoryPage
      category={ProjectCategory.VIVIENDA}
      title="Proyectos de Vivienda"
      subtitle="Complejos residenciales que ofrecen calidad de vida y bienestar"
      backgroundImage="https://metrica-dip.com/images/slider-inicio-es/06.jpg"
    />
  );
}