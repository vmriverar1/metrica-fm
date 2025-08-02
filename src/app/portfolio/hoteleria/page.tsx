import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';

export default function ProyectosHoteleriaPage() {
  return (
    <CategoryPage
      category={ProjectCategory.HOTELERIA}
      title="Proyectos de Hotelería"
      subtitle="Hoteles y complejos turísticos que combinan confort y elegancia"
      backgroundImage="https://metrica-dip.com/images/slider-inicio-es/04.jpg"
    />
  );
}