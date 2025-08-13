# Plan Visual - Página Clientes (/about/clientes)

## CONCEPTO CENTRAL: "CONFIANZA EN MOVIMIENTO"
Una página que muestre la confianza de los clientes a través de elementos visuales dinámicos e interactivos.

## ESTRUCTURA VISUAL PROPUESTA

### SECCIÓN 1: "Mosaico Magnético de Confianza"
**Concepto**: Un grid de tarjetas de clientes que reaccionan al mouse con efectos magnéticos
- Grid masonry con tarjetas de diferentes tamaños
- Efecto magnético: las tarjetas se inclinan hacia el cursor
- Cada tarjeta muestra logo/nombre + un proyecto emblemático
- Al hacer hover: flip 3D que revela datos del proyecto
- Colores que cambian dinámicamente según el sector

### SECCIÓN 2: "Galaxia de Proyectos"
**Concepto**: Visualización tipo constelación donde cada estrella es un cliente
- Canvas con puntos conectados por líneas animadas
- Cada punto representa un cliente (tamaño = importancia)
- Al hacer hover en un punto: emerge información del cliente
- Líneas conectoras se iluminan mostrando colaboraciones
- Efecto parallax al hacer scroll

### SECCIÓN 3: "Testimonios Cinematográficos"
**Concepto**: Carrusel inmersivo con testimonios como si fueran escenas de película
- Backgrounds que cambian con blur dinámico
- Testimonios que aparecen con efecto typewriter
- Transiciones con mask CSS entre testimonios
- Música ambiente sutil (opcional)
- Controles minimalistas pero elegantes

### SECCIÓN 4: "Mapa de Impacto Nacional"
**Concepto**: Mapa estilizado del Perú con puntos de proyectos que pulsan
- SVG del mapa peruano con regiones
- Puntos que pulsan representando proyectos por región
- Click en región: zoom + lista de proyectos
- Animación de ondas expansivas desde cada punto
- Estadísticas que cambian dinámicamente

### SECCIÓN 5: "Timeline de Éxitos Compartidos"
**Concepto**: Línea de tiempo vertical con scroll lateral magnético
- Timeline vertical con eventos importantes
- Scroll horizontal automático con pausa en hover
- Cada evento: imagen + cliente + logro
- Efecto ken burns en las imágenes
- Números que cuentan al entrar en vista

### SECCIÓN 6: "Invitación Interactiva"
**Concepto**: CTA que simula una videoconferencia/reunión virtual
- Interfaz que simula una pantalla de videollamada
- "Avatares" de nuestro equipo con micro-animaciones
- Botón principal: "Únete a la próxima reunión"
- Efectos de partículas al hacer hover
- Sonido sutil de notificación

## TECNOLOGÍAS A USAR (YA DISPONIBLES)
- ✅ GSAP ScrollTrigger para animaciones de scroll
- ✅ CSS transforms para efectos 3D/magnéticos
- ✅ Canvas HTML5 para la galaxia de proyectos
- ✅ Intersection Observer para triggers
- ✅ CSS masks para transiciones cinematográficas
- ✅ SVG animado para el mapa
- ✅ Tailwind para layouts y hover states

## IMPLEMENTACIÓN REALISTA
1. **Mosaico Magnético** - Factible con CSS transform + mouse events
2. **Galaxia** - Canvas 2D simple con puntos y líneas
3. **Testimonios** - Carrusel con transiciones CSS
4. **Mapa SVG** - Animaciones CSS + click handlers
5. **Timeline** - Similar al timeline de historia pero vertical
6. **CTA Interactivo** - Efectos CSS + micro-animaciones

¿Te gusta más esta dirección? Es más ambiciosa pero usando solo tecnologías que ya tenemos funcionando.