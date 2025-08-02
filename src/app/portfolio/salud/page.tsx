import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';

export default function ProyectosSaludPage() {
  return (
    <CategoryPage
      category={ProjectCategory.SALUD}
      title="Proyectos de Salud"
      subtitle="Infraestructura hospitalaria de vanguardia para el cuidado de la salud"
      backgroundImage="https://metrica-dip.com/images/slider-inicio-es/07.jpg"
    />
  );
}