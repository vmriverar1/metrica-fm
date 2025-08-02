import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';

export default function ProyectosRetailPage() {
  return (
    <CategoryPage
      category={ProjectCategory.RETAIL}
      title="Proyectos de Retail"
      subtitle="Centros comerciales y tiendas que crean experiencias de compra excepcionales"
      backgroundImage="https://metrica-dip.com/images/slider-inicio-es/02.jpg"
    />
  );
}