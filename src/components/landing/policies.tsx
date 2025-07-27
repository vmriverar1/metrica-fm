const policies = [
  'Política de Calidad',
  'Política de Seguridad y Salud en el Trabajo',
  'Política de Medio Ambiente',
  'Política de Responsabilidad Social',
  'Política de Ética y Cumplimiento',
  'Política de Gestión de Riesgos',
  'Política de Innovación y Mejora Continua',
  'Política de Confidencialidad y Protección de Datos',
];

export default function Policies() {
  return (
    <section id="policies" className="py-24 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 md:gap-16">
          <div className="md:col-span-1">
            <h2 className="font-headline text-4xl md:text-5xl font-bold">
              <span className="text-accent">NUESTRAS</span>
              <span className="block text-white">POLÍTICAS</span>
            </h2>
          </div>
          <div className="md:col-span-2">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {policies.map((policy, index) => (
                <div key={index} className="pb-4 border-b-2 border-accent">
                  <p className="text-white text-lg">{policy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
