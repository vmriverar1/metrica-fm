import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';

export default function ProyectosOficinaPage() {
  return (
    <CategoryPage
      category={ProjectCategory.OFICINA}
      title="Proyectos de Oficina"
      subtitle="Espacios corporativos modernos y funcionales que potencian la productividad"
      backgroundImage="https://metrica-dip.com/images/slider-inicio-es/01.jpg"
    />
  );
}