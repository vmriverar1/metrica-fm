import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';

export default function ProyectosEducacionPage() {
  return (
    <CategoryPage
      category={ProjectCategory.EDUCACION}
      title="Proyectos de Educación"
      subtitle="Instituciones educativas que inspiran el aprendizaje y desarrollo"
      backgroundImage="https://metrica-dip.com/images/slider-inicio-es/05.jpg"
    />
  );
}