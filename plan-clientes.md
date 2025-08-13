
1. SECCIÓN LOGOS:

## **📍 Contexto y Ubicación en la Web**

Esta sección se colocará en una parte estratégica de la página de cliente, idealmente después de la presentación de la empresa y sus servicios, como una forma de **validación social** que muestre el respaldo de marcas y organizaciones que ya confían en ustedes.

El título y subtítulo serán breves, claros y enfocados en generar confianza.

**Ejemplo de encabezado:**

* **Título:** *Empresas que confían en nosotros*
* **Subtítulo:** *Socios estratégicos que respaldan nuestra calidad y compromiso.*

El diseño debe respirar, con suficiente espacio alrededor para que las tarjetas destaquen y el usuario pueda enfocarse en ellas.

---

## **🎨 Diseño General**

Se presentará un **mosaico interactivo** compuesto por tarjetas alineadas en una cuadrícula de 3 a 4 columnas en desktop, 2 columnas en tablet y 1 columna en móvil.
Cada tarjeta es **una “card giratoria” con efecto 3D** que se voltea 180° en su eje horizontal o vertical al interactuar.

---

## **🖼 Cara Frontal (Front)**

La parte visible inicialmente de cada tarjeta debe transmitir limpieza, profesionalismo y coherencia visual.

* **Fondo:** color neutro suave (blanco, gris claro o degradado muy sutil).
* **Logo de la empresa:** centrado, con suficiente espacio para respirar y sin distorsión.
* **Efecto hover:**

  * Ligero aumento de tamaño (*zoom-in* del 5%).
  * Sombra proyectada suave para dar sensación de elevación.
  * Un destello diagonal muy sutil (*glow sweep*) que atraviesa el logo.

---

## **🔄 Interacción de Giro**

Al pasar el cursor (en desktop) o tocar la tarjeta (en móvil/tablet), esta rota suavemente 180° con perspectiva realista:

* La animación tiene aceleración al inicio y desaceleración al final (no constante) para dar sensación natural.
* En pantallas grandes, puede añadirse un **efecto cascada**: si el usuario pasa el ratón por varias tarjetas seguidas, estas giran con un retraso mínimo entre ellas, generando un efecto dinámico y fluido.

---

## **🖊 Cara Posterior (Back)**

El reverso revela información breve pero valiosa que refuerza la relación con esa empresa:

* **Fondo:** mismo tono base que el frontal, pero con un degradado o textura ligera para diferenciar.
* **Texto superior:** frase corta que resuma la colaboración.
  Ejemplos:

  * *"Socio estratégico desde 2020"*
  * *"Aliados en innovación y crecimiento"*
  * *"Más de 15 proyectos realizados juntos"*
* **Elemento visual secundario:** ícono representativo (manos estrechándose, engranaje, estrella, medalla).
* **Botón pequeño / enlace:** *"Conócelos"* → abre un modal con más detalles o redirige a una página de casos de éxito.
* **Tipografía:** clara y de buen contraste para legibilidad rápida.

---

## **📱 Comportamiento en Móvil**

* La rotación se activa con un *tap* en la tarjeta.
* El reverso se puede mostrar como un **overlay deslizante** que ocupa toda la tarjeta para que el texto sea fácil de leer.
* Un ícono “↩” o botón “Volver” permite regresar al frontal.

---

## **🌀 Efectos Globales y Animaciones**

* **Entrada al hacer scroll:** cuando el usuario llega a la sección, las tarjetas aparecen con un leve *fade-in + slide-up* (0.5s a 0.8s cada una, en secuencia).
* **Rotación automática en reposo:** opcionalmente, las tarjetas podrían girar solas cada 5-6 segundos para captar atención, pero sin ser invasivo.
* **Transición suave:** todas las animaciones deben durar entre 0.6s y 0.8s.

---

## **💬 Flujo de Experiencia del Usuario**

1. El usuario hace scroll y ve el título + subtítulo que presentan la sección.
2. Las tarjetas entran en escena con animación suave.
3. El usuario nota que los logos responden al hover con un sutil efecto de brillo y zoom.
4. Decide interactuar y ve la rotación con información de la relación empresa-aliado.
5. Puede acceder a más información si el botón “Conócelos” está disponible.
6. Al seguir explorando, percibe que hay varias marcas de confianza, lo que refuerza la credibilidad y profesionalismo.

---

## **📄 Ejemplo de Contenido**

**Tarjeta 1:**

* *Front:* Logo de "Constructora Andina".
* *Back:* “Socio estratégico desde 2021”, ícono de engranajes, botón *Conócelos*.

**Tarjeta 2:**

* *Front:* Logo de "Banco del Norte".
* *Back:* “Más de 10 proyectos financiados en conjunto”, ícono de manos unidas, botón *Ver más*.

**Tarjeta 3:**

* *Front:* Logo de "Tech Solutions Perú".
* *Back:* “Aliados en innovación tecnológica”, ícono de bombilla, botón *Explorar*.

---

## **🎯 Objetivo de la Sección**

* **Aumentar la credibilidad:** mostrar quién respalda la empresa.
* **Generar interés:** invitar a conocer las colaboraciones.
* **Refuerzo visual:** que cada logo se recuerde y asocie con calidad.

2. SECCIÓN SECTORES QUE ATENDEMOS

¡Anotado! Aquí va la especificación **solo para la sección “Sectores que atendemos”**, enfocada en **mostrar y explicar** cada sector (no logos), con interacciones claras y un flujo que lleve al usuario a profundizar en **casos/servicios por sector**. Sin código, pero con pasos detallados para que el dev lo implemente sin dudas.

---

# 1) Objetivo funcional

1. Presentar un **mosaico de 7 sectores** (Oficinas, Retail, Industria, Hotelería, Educación, Vivienda, Salud).
2. Al seleccionar un sector, **expandir** su contenido (in place o en panel/overlay) con descripción, problemas típicos que resolvemos, servicios aplicables y CTA para ver **casos y servicios** de ese sector.
3. Permitir **comparar sectores** rápidamente (ver los 7 en forma compacta) y **profundizar** en uno sin perder el contexto.
4. Ser **responsivo**, **accesible** y **medible** (eventos de analítica).

---

# 2) Arquitectura de componentes

* **SectorsSection** (contenedor general)

  * **SectorsHeader** (título + subtítulo + nota UX breve)
  * **SectorsGrid** (mosaico)

    * **SectorCard** ×7 (estado colapsado/expandido)
  * **SectorsCompareBar** (barra opcional para alternar vista “Compacta / Detallada”)
  * **SectorPanel** (modo expandido a pantalla completa en móvil o lateral en desktop, ver “Variantes de despliegue”)
  * **CTASection** (llamada a la acción final, relacionada al sector activo o genérica si no hay selección)

> Decisión clave: **una sola fuente de verdad** (CMS/JSON) que define contenido por sector.

---

# 3) Contratos de datos (CMS/JSON)

**Sector**

* `slug`: identificador único (p. ej., `retail`)
* `title`: nombre visible (Retail)
* `tagline`: frase corta de valor (máx. 12–14 palabras)
* `summary`: párrafo breve (máx. 280–320 caracteres)
* `painPoints`: lista de 3–4 problemas típicos del sector (frases cortas)
* `solutions`: lista de 3–5 soluciones/actividades que entregan (frases cortas)
* `services`: lista de servicios aplicables (slugs y etiquetas legibles)
* `kpis`: métricas opcionales (ej.: “+48 proyectos”, “0 incidentes”, “on-time 95%”)
* `iconUrl`: ícono sectorial (SVG recomendado)
* `coverUrl`: imagen/ilustración opcional (ligera, WebP)
* `caseHighlights`: lista opcional de 1–3 casos destacados (solo títulos y enlaces, para profundizar luego)
* `order`: posición en el mosaico

**Service (catálogo global)**

* `slug`, `label`, `shortDesc`
  *(Para pintar chips de servicios por sector.)*

---

# 4) Layout y comportamiento

## Mosaico (SectorsGrid)

* **Desktop:** 3–4 columnas; **Tablet:** 2–3; **Móvil:** 1.
* Cada **SectorCard** tiene 3 estados:

  1. **Colapsado (reposo)**: ícono + título + tagline.
  2. **Hover/Focus**: eleva, muestra 2 bullets “painPoints” como teaser.
  3. **Expandido**: revela resumen, painPoints, solutions, chips de servicios, KPIs y CTAs.

## Variantes de despliegue del expandido (elige 1)

* **A) Expandido in place**: la card se agranda y empuja el grid. Ideal cuando hay poco contenido.
* **B) Panel lateral (desktop) / Overlay full-screen (móvil)**: al seleccionar, abre un panel fijo a la derecha (desktop) o un overlay que ocupa la pantalla (móvil). Mantiene el grid visible detrás (desktop).

> Recomendación: **B** da una experiencia más ordenada y mantiene el mosaico estable.

---

# 5) Contenido de Sector (estado expandido)

* **Encabezado**: Ícono grande + Título + Tagline
* **Resumen**: 1 párrafo claro (qué hacemos para este sector)
* **Dolores típicos (painPoints)**: lista con 3–4 bullets
* **Cómo lo resolvemos (solutions)**: lista con 3–5 bullets (acciones concretas)
* **Servicios aplicables**: chips seleccionables (informativos o que conduzcan a la página de Servicios con el sector precargado como contexto)
* **KPIs/Métricas**: hasta 3 “píldoras” numéricas
* **Casos destacados (opcional)**: 1–3 títulos con enlaces a los casos/portafolio del sector
* **CTAs**:

  * *Ver casos de \[Sector]* (navega a Portafolio filtrado por sector)
  * *Hablar con un especialista* (contacto)

---

# 6) Flujo UX

1. El usuario ve el mosaico con 7 sectores, animación de entrada **stagger** suave.
2. Al pasar el cursor (desktop) o tocar (móvil) una card, aparece teaser (2 bullets).
3. Al **seleccionar** un sector:

   * Se **abre** el **SectorPanel** (o se expande la tarjeta) con el contenido completo del sector.
   * La vista **no salta** a otra página: es exploración **in situ**.
   * Se **enfoca** el encabezado del panel (accesibilidad).
4. El usuario puede:

   * Leer **resumen + painPoints + solutions**.
   * Ver chips de **servicios aplicables**.
   * Revisar **casos destacados** (si hay).
   * Usar **CTA** para ir a **Casos** del sector o **Contactar**.
5. Si el usuario cierra el panel, vuelve al mosaico en el mismo scroll.
6. **Persistencia suave**: si el usuario navega a “Casos del sector” y regresa, la última selección podría reabrirse (opcional).

---

# 7) Accesibilidad (A11y)

* Cada **SectorCard** es un control accesible (rol de botón o enlace).
* Activable con teclado (Enter/Espacio).
* **Focus visible**.
* **SectorPanel**: `role="dialog"` o `region` según variante; con `aria-labelledby` al título del sector.
* **Trampa de foco** dentro del overlay en móvil; cierre con Esc/ícono claro.
* Contraste AA en textos y chips.
* Respetar `prefers-reduced-motion`: reducir animaciones no esenciales.

---

# 8) Animaciones y microinteracciones

* **Entrada del mosaico**: fade-in + slide-up (0.5–0.8 s) con **stagger** de 60–120 ms.
* **Hover card**: elevación leve + sombra suave + micro parallax de ícono.
* **Apertura del panel**: transición 0.35–0.45 s (easing), sin reacomodos bruscos.
* **KPIs**: count-up (1 s) al abrir el panel (si existen).
* **Chips**: feedback visual al interactuar (ripple sutil).

---

# 9) Responsivo

* **Desktop**: Grid 3–4 columnas; **panel lateral** de 360–420 px ancho (scroll interno).
* **Tablet**: Grid 2–3 columnas; panel ocupa 40–60% del ancho.
* **Móvil**: Grid 1 columna; **overlay full-screen** con botón “Cerrar” sticky, tipografía ≥ 16 px, targets ≥ 40 px.

---

# 10) Rendimiento

* Íconos como **SVG** (sprite o `<symbol>`).
* Imágenes de portada (si se usan): **WebP/AVIF**, `loading="lazy"`, tamaños definidos para evitar layout shifts.
* No montar el **SectorPanel** hasta que se necesite (mount on open).
* Usar **IntersectionObserver** para animaciones al entrar en viewport.
* Mantener el mosaico estático (evitar reflows innecesarios).

---

# 11) Analítica (eventos)

* `sectors_view` — al entrar la sección en viewport (props: lista de sectores).
* `sector_open` — al abrir un sector (props: `sector`, `from: grid|search|link`).
* `sector_services_click` — clic en chip de servicio dentro del sector (props: `sector`, `service`).
* `sector_cases_cta` — clic en “Ver casos de \[Sector]”.
* `sector_contact_cta` — clic en “Hablar con un especialista”.
* (Opcional) `kpi_view` — si se quieren medir cuáles KPIs se ven más.

---

# 12) Copys listos (ejemplo por sector)

*(Ajusta al tono de marca y experiencia real)*

**Oficinas**

* Tagline: *De local vacío a operación continua.*
* Resumen: *Planificamos, coordinamos e implementamos obras y adecuaciones para oficinas, asegurando continuidad operativa, cumplimiento normativo y entrega a tiempo.*
* PainPoints:

  * Entregas por fases sin frenar operación
  * Coordinación de locatarios y facilities
  * Control de calidad y seguridad
* Solutions:

  * Cronogramas por áreas funcionales
  * Gestión de subcontratas y QA/QC
  * Puesta en marcha y cierre de punch list
* Servicios: *Gerencia de proyectos, Supervisión, Ingeniería de costos*
* CTA: *Ver casos de Oficinas* · *Hablar con un especialista*

**Retail**

* Tagline: *Aperturas rápidas, cero sorpresas.*
* … *(repite la misma estructura para los 7 sectores)*

---

# 13) Criterios de aceptación (QA)

* Se muestran **los 7 sectores** con íconos y taglines.
* Al seleccionar un sector, se abre **panel/expansión** con: resumen, 3–4 painPoints, 3–5 solutions, chips de servicios y CTA(s).
* **Navegación por teclado** funciona en cards y panel.
* **Cierre** del panel mantiene el scroll y el estado del mosaico.
* **Responsive** correcto en 3 breakpoints (desktop/tablet/móvil).
* **Analítica** dispara eventos con props correctas.
* `prefers-reduced-motion` reduce animaciones.

---

# 14) Entregables esperados del dev

1. **Estructura de datos** (CMS/JSON) cargada y validada.
2. **SectorsSection** funcional con mosaico, expansión/panel y CTA conectados a las rutas de **Casos** y **Contacto**.
3. **Accesibilidad** aplicada (roles ARIA, foco, contraste).
4. **Analítica** integrada (nombres de eventos según arriba).
5. **Documentación corta** para contenido (cómo agregar/editar un sector en el CMS).

