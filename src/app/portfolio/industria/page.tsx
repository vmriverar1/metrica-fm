import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';

export default function ProyectosIndustriaPage() {
  return (
    <CategoryPage
      category={ProjectCategory.INDUSTRIA}
      title="Proyectos de Industria"
      subtitle="Infraestructura industrial optimizada para procesos productivos eficientes"
      backgroundImage="https://metrica-dip.com/images/slider-inicio-es/03.jpg"
    />
  );
}