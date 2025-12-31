# Plan de Componentes - Página Cashback

## Referencia del Proyecto Anterior

Este plan está basado en el proyecto de referencia ubicado en `/Users/aramirez/Desktop/nginx-cashback`, que implementa la misma funcionalidad pero con Angular antiguo (módulos) y sin Ionic. La nueva implementación usará:
- **Ionic 8** (según package.json actual)
- **Angular 21** (standalone components)
- **Componentes de Ionic** en lugar de componentes flame

## Análisis de Componentes Identificados

Basado en la imagen de la pantalla de Cashback y el proyecto de referencia, se han identificado los siguientes componentes y secciones:

### 1. **Header con Navegación**
- **Ubicación**: Parte superior
- **Elementos**:
  - Barra de estado (hora 9:41, señal, WiFi, batería)
  - Flecha de retroceso (izquierda, roja)
  - Título "Cashback" (negro, grande)
- **Componente**: Usar `ion-header`, `ion-toolbar`, `ion-back-button`, `ion-title`

### 2. **Tabs/Segment Navigation**
- **Ubicación**: Debajo del header
- **Elementos**:
  - Tab "Resumen" (activo - fondo blanco, borde gris claro)
  - Tab "Promo Cashback" (inactivo - texto gris)
- **Componente**: Usar `ion-segment` con `ion-segment-button`
- **Funcionalidad**: Cambiar entre vistas

### 3. **InfoBanner (Banner Informativo) - Toast Component**
- **Ubicación**: Debajo de los tabs
- **Referencia**: `toast.component.ts` del proyecto anterior
- **Elementos**:
  - Fondo azul claro con bordes redondeados
  - Icono "i" en círculo (izquierda) - usar `ion-icon name="information-circle"`
  - Texto: "Recuerda que el Cashback de tus compras será depositado en tu cuenta Santander antes del día 15 de cada mes."
  - Botón "X" para cerrar (derecha, negro) - usar `ion-icon name="close"`
- **Componente**: Crear componente standalone `InfoBannerComponent` o `ToastComponent`
- **Props**: `message: string`, `dismissible: boolean`, `isOpen: boolean`
- **Estado**: Controlar visibilidad con `*ngIf` o signal
- **Nota**: En el proyecto anterior usaba NgRx para el estado, aquí podemos usar signals o @Input/@Output

### 4. **CardInfo (Card de Información de Tarjeta)**
- **Ubicación**: Debajo del banner
- **Referencia**: `card-item.component.ts` del proyecto anterior
- **Elementos**:
  - Fondo blanco, bordes redondeados
  - Título: "En tu tarjeta"
  - Icono de tarjeta roja con "LikeU" (izquierda) - usar `app-card-image` o `ion-icon`
  - Texto "LikeU" en negrita (o nombre del producto)
  - Texto "TDC - *2930" en gris pequeño (formato: tipo - últimos 4 dígitos)
  - Flecha derecha (gris, derecha) - usar `ion-icon name="chevron-forward"` (solo si hay múltiples tarjetas)
- **Componente**: Crear componente standalone `CardInfoComponent`
- **Props**: `product: Product` (interfaz del proyecto anterior)
- **Funcionalidad**: Si hay múltiples productos, abrir modal/bottom sheet para seleccionar
- **Interfaz Product**:
  ```typescript
  interface Product {
    cardIdentification?: CardIdentification;
    type?: string; // 'CREDIT' | 'DEBIT'
    image?: Image;
    product?: { name?: string };
    associatedAccounts?: AssociatedAccount[];
  }
  ```

### 5. **AccumulatedCashback (Cashback Acumulado) - Monthly Summary**
- **Ubicación**: Debajo del card de tarjeta
- **Referencia**: `monthly-summary.component.ts` del proyecto anterior
- **Elementos**:
  - Fondo blanco, bordes redondeados
  - Texto: "El Cashback acumulado de [mes] de [año] es de:" (formato con date-fns)
  - Monto: "$346.80 MXN" (grande, negrita, negro)
  - Opcional: Monto anual acumulado (del proyecto anterior)
- **Componente**: Crear componente standalone `AccumulatedCashbackComponent` o `MonthlySummaryComponent`
- **Props**: `cashbackAmounts: CashBackAmounts`
- **Interfaz CashBackAmounts**:
  ```typescript
  interface CashBackAmounts {
    annualAmount: Amount;
    monthAmount: Amount;
    cashbackPeriod: CashbackPeriod;
  }
  interface Amount {
    amount: number;
    currency: string;
  }
  interface CashbackPeriod {
    month: string;
    year: number;
  }
  ```
- **Formato de fecha**: Usar `date-fns` con locale `es` para formatear el mes

### 6. **MonthlyCashbackByStore (Cashback Mensual por Establecimiento) - Summary by MCC**
- **Ubicación**: Debajo del cashback acumulado
- **Referencia**: `summary-by-mcc.component.ts` y `progressbar.component.ts` del proyecto anterior
- **Elementos**:
  - Fondo blanco, bordes redondeados
  - Título: "Cashback mensual por establecimiento"
  - Barra de progreso horizontal segmentada (componente separado):
    - Rojo (largo) - Supermercados (código MCC: 'Sup' o similar)
    - Teal (mediano) - Restaurantes (código MCC: 'Res')
    - Rosa (corto) - Farmacias (código MCC: 'Far')
    - Azul claro (muy corto) - Telecomunicaciones (código MCC: 'Tel' o similar)
  - Lista de categorías:
    - Círculo de color con icono blanco (ion-icon)
    - Nombre de categoría con porcentaje (ej: "+1% Supermercados")
    - Monto en verde a la derecha (ej: "+$77.00")
- **Componente**: Crear componente standalone `MonthlyCashbackByStoreComponent` o `SummaryByMccComponent`
- **Subcomponente**: `ProgressBarComponent` para la barra segmentada
- **Props**: `activityAmountCashBacks: ActivityAmountCashBack[]`
- **Interfaz ActivityAmountCashBack**:
  ```typescript
  interface ActivityAmountCashBack {
    name: string;
    categoryCode: string; // 'Res', 'Far', 'Gas', 'Ent', 'Sup', 'Tel'
    categoryDescription: string;
    cashBackAmount: Amount;
    cashBackPercentage: number;
  }
  ```
- **Iconos por categoría** (usar ionicons):
  - Supermercados: `cart` o `storefront`
  - Restaurantes: `restaurant`
  - Farmacias: `medical` o `medkit`
  - Telecomunicaciones: `call` o `chatbubble`
- **Cálculo de porcentajes**: El componente ProgressBar calcula el porcentaje de cada segmento basado en el total

### 7. **TransactionsList (Lista de Movimientos) - Movements Component**
- **Ubicación**: Debajo del cashback por establecimiento
- **Referencia**: `movements.component.ts` del proyecto anterior
- **Elementos**:
  - Título: "Movimientos" (negrita)
  - Subtítulo: "Montos en MXN" (gris pequeño)
  - Botón/Icono de filtro (rojo, derecha) - usar `ion-button` o `ion-icon`
  - Banner informativo: "Tus compras se reflejarán en 24 a 48 h hábiles." (fondo rojo claro, icono "i") - solo si periodo es 'current'
  - Lista de transacciones (componente TransactionItem)
  - Botón "Ver más" (rojo, centrado) - solo si hay más páginas
- **Componente**: Crear componente standalone `TransactionsListComponent` o `MovementsComponent`
- **Props**: `accountId: string`, `purchases: Purchase[]` (del store o servicio)
- **Funcionalidad**: 
  - Filtrado por periodo (current, past, before) y MCC
  - Paginación (cargar más transacciones)
  - Abrir modal de filtros (usar `ion-modal`)
- **Interfaz Purchase**:
  ```typescript
  interface Purchase {
    cardTransactionId: string;
    orderDate: string;
    amount: Amount;
    clearing: Clearing;
    merchant: Merchant;
  }
  interface Clearing {
    cashBackPercentage: number;
    cashBackAmount: Amount;
  }
  interface Merchant {
    name?: string;
    categoryCode?: string; // 'Res', 'Far', 'Gas', 'Ent', etc.
    categoryDescription?: string;
  }
  ```

### 8. **TransactionItem (Item de Transacción) - Movement Item**
- **Ubicación**: Dentro de TransactionsList
- **Referencia**: `movement-item.component.ts` del proyecto anterior
- **Elementos**:
  - Círculo gris con icono blanco (izquierda) - icono según categoryCode
  - Nombre del establecimiento (negrita) - `merchant.name`
  - Fecha (gris pequeño) - formato: "dd/MMMM/yyyy" con date-fns locale es
  - Monto de cashback en verde (derecha, arriba): "+$X.XX" - `clearing.cashBackAmount`
  - Monto de compra en gris (derecha, abajo): "- $XXX.XX" - `amount`
- **Componente**: Crear componente standalone `TransactionItemComponent` o `MovementItemComponent`
- **Props**: 
  ```typescript
  @Input() description: string; // merchant.name
  @Input() date: string; // orderDate
  @Input() cashback_amount: number; // clearing.cashBackAmount.amount
  @Input() amount: number; // amount.amount
  @Input() category: string; // merchant.categoryCode
  ```
- **Iconos por categoría**: Mismo mapeo que en SummaryByMcc
- **Formato de fecha**: Usar `date-fns` con `format(parseISO(date), 'dd/MMMM/yyyy', { locale: es })`

### 9. **LoadMoreButton (Botón Ver Más)**
- **Ubicación**: Footer de la lista de transacciones
- **Elementos**:
  - Texto "Ver más" (rojo, centrado)
- **Componente**: Puede ser parte de TransactionsList o componente separado
- **Funcionalidad**: Cargar más transacciones

## Plan de Implementación

### Fase 0: Setup y Modelos
1. Crear carpeta `models/` con interfaces TypeScript basadas en el proyecto anterior:
   - `amount.ts`
   - `product.ts`
   - `cashback-amounts.ts`
   - `activity-amount-cashback.ts`
   - `purchase.ts`
   - `merchant.ts`
   - `clearing.ts`
   - `cashback-period.ts`
   - `card-identification.ts`
   - `image.ts`
   - `associated-account.ts`
2. Instalar dependencias necesarias:
   - `date-fns` (si no está instalado) para formateo de fechas
   - Verificar que `ionicons` esté disponible

### Fase 1: Estructura Base
1. Actualizar `cashback.page.ts` con imports necesarios de Ionic
2. Crear estructura base del HTML con header y tabs usando `ion-segment`
3. Configurar estilos base en `cashback.page.scss` (basados en `cashback.component.scss` del proyecto anterior)
4. Implementar navegación entre tabs "Resumen" y "Promo Cashback" (routing o signals)

### Fase 2: Componentes de Información
1. Crear `InfoBannerComponent` (Toast)
   - Ubicación: `src/app/cashback/components/info-banner/`
   - Archivos: `.ts`, `.html`, `.scss`
   - Basado en: `toast.component.ts` del proyecto anterior
   - Usar `ion-icon` en lugar de `flame-icon`
   - Implementar `@Input() isOpen: boolean` y `@Output() close = new EventEmitter()`
   
2. Crear `CardInfoComponent` (Card Item)
   - Ubicación: `src/app/cashback/components/card-info/`
   - Archivos: `.ts`, `.html`, `.scss`
   - Basado en: `card-item.component.ts` del proyecto anterior
   - Props: `@Input() product: Product`
   - Funcionalidad: Mostrar tarjeta actual, si hay múltiples abrir modal (usar `ion-modal`)
   - Usar `ion-icon name="chevron-forward"` para flecha

3. Crear `AccumulatedCashbackComponent` (Monthly Summary)
   - Ubicación: `src/app/cashback/components/accumulated-cashback/`
   - Archivos: `.ts`, `.html`, `.scss`
   - Basado en: `monthly-summary.component.ts` del proyecto anterior
   - Props: `@Input() cashbackAmounts: CashBackAmounts`
   - Usar `date-fns` para formatear mes en español

### Fase 3: Componente de Cashback por Establecimiento
1. Crear `ProgressBarComponent` (subcomponente)
   - Ubicación: `src/app/cashback/components/progress-bar/`
   - Archivos: `.ts`, `.html`, `.scss`
   - Basado en: `progressbar.component.ts` del proyecto anterior
   - Props: `@Input() activityAmountCashBacks: ActivityAmountCashBack[]`
   - Funcionalidad: Calcular porcentajes y mostrar segmentos de colores

2. Crear `MonthlyCashbackByStoreComponent` (Summary by MCC)
   - Ubicación: `src/app/cashback/components/monthly-cashback-by-store/`
   - Archivos: `.ts`, `.html`, `.scss`
   - Basado en: `summary-by-mcc.component.ts` del proyecto anterior
   - Props: `@Input() activityAmountCashBacks: ActivityAmountCashBack[]`
   - Incluir `ProgressBarComponent`
   - Incluir lista de categorías con iconos de `ionicons`
   - Mapear categoryCode a iconos y colores

### Fase 4: Componentes de Transacciones
1. Crear `TransactionItemComponent` (Movement Item)
   - Ubicación: `src/app/cashback/components/transaction-item/`
   - Archivos: `.ts`, `.html`, `.scss`
   - Basado en: `movement-item.component.ts` del proyecto anterior
   - Props: `description`, `date`, `cashback_amount`, `amount`, `category`
   - Usar `date-fns` para formatear fecha
   - Mapear category a iconos de `ionicons`

2. Crear `TransactionsListComponent` (Movements)
   - Ubicación: `src/app/cashback/components/transactions-list/`
   - Archivos: `.ts`, `.html`, `.scss`
   - Basado en: `movements.component.ts` del proyecto anterior
   - Props: `@Input() accountId: string`
   - Incluir header con título, subtítulo y botón de filtro
   - Incluir banner informativo interno (solo si periodo es 'current')
   - Incluir lista de TransactionItem usando `*ngFor`
   - Incluir botón "Ver más" (usar `ion-button`) con lógica de paginación
   - Funcionalidad: Abrir modal de filtros (usar `ion-modal`)

### Fase 5: Integración y Estilos
1. Integrar todos los componentes en `cashback.page.html` (tab "Resumen")
   - InfoBannerComponent
   - CardInfoComponent
   - AccumulatedCashbackComponent
   - MonthlyCashbackByStoreComponent
   - TransactionsListComponent
2. Crear servicio mock o modelo de datos para desarrollo (opcional)
   - Puede usar datos estáticos inicialmente
   - O crear un servicio que simule las llamadas API
3. Aplicar estilos SCSS detallados para replicar diseño exacto
   - Basarse en los estilos del proyecto anterior
   - Adaptar variables CSS de Santander
   - Ajustar colores, espaciados, tipografías y bordes redondeados
4. Implementar manejo de estados (signals o servicios simples)
   - Estado de visibilidad del toast
   - Estado de productos/tarjetas
   - Estado de resumen y transacciones

### Fase 6: Detalles de UX/UI y Adaptaciones

1. **Colores identificados** (del proyecto anterior):
   - Rojo principal Santander: `#ec0000` o `var(--sn-color__santander)`
   - Fondo concreto: `var(--sn-color__concrete)` o `var(--sn-concrete)`
   - Texto principal: `var(--theme-light-text-text-01, #191919)`
   - Azul claro banner: Similar a `#E3F2FD`
   - Verde cashback: `#4CAF50` o similar
   - Grises: Varios tonos para textos secundarios
   - Colores de categorías (del proyecto anterior):
     - Restaurantes: Teal
     - Farmacias: Rosa
     - Gasolineras: Color específico
     - Entretenimiento: Color específico
     - Supermercados: Rojo
     - Telecomunicaciones: Azul claro

2. **Iconos necesarios** (de ionicons, reemplazando flame-icon):
   - `arrow-back` (flecha retroceso) - reemplaza `chefron-left`
   - `information-circle` (icono info) - reemplaza `information-in-a-circle`
   - `close` (cerrar banner) - reemplaza `close`
   - `card` o imagen de tarjeta (tarjeta)
   - `chevron-forward` (flecha derecha) - reemplaza `chevron-right`
   - `cart` o `storefront` (supermercados) - reemplaza iconos de flame
   - `restaurant` (restaurantes) - reemplaza `restaurant-bar`
   - `medical` o `medkit` (farmacias) - reemplaza `health-insurance`
   - `call` o `chatbubble` (telecomunicaciones)
   - `options` o `filter` (filtro)
   - `warning` (advertencia) - reemplaza `warning-in-a-circle`

3. **Espaciados** (del proyecto anterior):
   - Padding estándar: 16px (`padding: 0 16px`)
   - Margen entre cards: 16px
   - Border radius: 12px-16px (tabs: 12px, cards: 8px-12px)
   - Espaciado interno de items: 12px-16px
   - Tabs: `margin: 24px 16px 0`, `margin-top: 68px` (debajo del header fijo)

4. **Tipografías** (del proyecto anterior):
   - Header: `font-family: SantanderHeadline`, `font-size: 24px`, `font-weight: 700`
   - Título principal: Bold, tamaño grande
   - Títulos de cards: Medium/Bold, tamaño mediano
   - Textos secundarios: Regular, tamaño pequeño, color gris
   - Montos: Bold, tamaño grande para destacar

5. **Adaptaciones de Ionic**:
   - Usar `ion-header`, `ion-toolbar`, `ion-back-button`, `ion-title` para header
   - Usar `ion-segment` y `ion-segment-button` para tabs
   - Usar `ion-card` para cards (o divs con estilos personalizados)
   - Usar `ion-icon` en lugar de `flame-icon`
   - Usar `ion-button` para botones
   - Usar `ion-modal` para modales (filtros, selección de tarjetas)
   - Usar `ion-content` para el contenido principal con scroll

## Estructura de Archivos Final

```
src/app/cashback/
├── cashback.page.ts
├── cashback.page.html
├── cashback.page.scss
├── cashback.page.spec.ts
├── components/
│   ├── info-banner/ (Toast)
│   │   ├── info-banner.component.ts
│   │   ├── info-banner.component.html
│   │   └── info-banner.component.scss
│   ├── card-info/ (Card Item)
│   │   ├── card-info.component.ts
│   │   ├── card-info.component.html
│   │   └── card-info.component.scss
│   ├── accumulated-cashback/ (Monthly Summary)
│   │   ├── accumulated-cashback.component.ts
│   │   ├── accumulated-cashback.component.html
│   │   └── accumulated-cashback.component.scss
│   ├── progress-bar/ (Progress Bar - subcomponente)
│   │   ├── progress-bar.component.ts
│   │   ├── progress-bar.component.html
│   │   └── progress-bar.component.scss
│   ├── monthly-cashback-by-store/ (Summary by MCC)
│   │   ├── monthly-cashback-by-store.component.ts
│   │   ├── monthly-cashback-by-store.component.html
│   │   └── monthly-cashback-by-store.component.scss
│   ├── transaction-item/ (Movement Item)
│   │   ├── transaction-item.component.ts
│   │   ├── transaction-item.component.html
│   │   └── transaction-item.component.scss
│   └── transactions-list/ (Movements)
│       ├── transactions-list.component.ts
│       ├── transactions-list.component.html
│       └── transactions-list.component.scss
├── models/
│   ├── amount.ts
│   ├── product.ts
│   ├── cashback-amounts.ts
│   ├── activity-amount-cashback.ts
│   ├── purchase.ts
│   ├── merchant.ts
│   ├── clearing.ts
│   ├── cashback-period.ts
│   ├── card-identification.ts
│   ├── image.ts
│   └── associated-account.ts
└── services/
    └── cashback.service.ts (opcional para datos mock o integración con API)
```

## Notas Importantes

- Todos los componentes deben ser **standalone** (Angular standalone components)
- Usar **Ionic components** cuando sea posible para mantener consistencia
- **Reemplazar componentes flame** del proyecto anterior por componentes de Ionic:
  - `flame-icon` → `ion-icon`
  - Componentes personalizados → Componentes Ionic equivalentes
- Los colores deben coincidir exactamente con la imagen y el proyecto anterior
- Los iconos deben ser de **ionicons** (ya incluido en el proyecto)
- La experiencia debe ser **idéntica** a la imagen proporcionada
- Considerar responsive design para diferentes tamaños de pantalla
- Los datos pueden ser mock inicialmente, pero la estructura debe ser escalable
- **Mapeo de categoryCode a iconos y colores**:
  - 'Res' → `restaurant`, color teal
  - 'Far' → `medical` o `medkit`, color rosa
  - 'Gas' → `car` o similar, color específico
  - 'Ent' → `ticket` o similar, color específico
  - 'Sup' → `cart` o `storefront`, color rojo
  - 'Tel' → `call` o `chatbubble`, color azul claro
- **Formateo de fechas**: Usar `date-fns` con locale `es` para formatear fechas en español
- **Formateo de montos**: Usar `currency` pipe de Angular o formateo manual
- **Estado**: Considerar usar signals de Angular para estado local en lugar de NgRx (más simple para esta versión)

