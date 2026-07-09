# Primer reporte tecnico de rendimiento y seguridad en produccion: GyrMonitor

**Fecha de elaboracion:** 9 de julio de 2026  
**Proyecto:** GyrMonitor  
**Tipo de reporte:** auditoria tecnica inicial de produccion  
**Entregable final:** PDF exportado en `docs/reports/first-report/exports/`

## 1. Resumen ejecutivo

Se realizo una auditoria tecnica inicial sobre las superficies productivas de GyrMonitor usando exclusivamente Lighthouse y ZAP by Checkmarx/OWASP ZAP. El frontend productivo evaluado fue `https://gyr-monitor.vercel.app/` y el backend productivo evaluado fue `https://gyrmonitor-production.up.railway.app/api/v1`.

Lighthouse reporto un estado favorable del frontend: Performance 99, Accessibility 100, Best Practices 100 y SEO 90. Las oportunidades principales son agregar una meta descripcion y revisar JavaScript no utilizado.

ZAP by Checkmarx/OWASP ZAP 2.17.0 se ejecuto mediante el lanzador normal `zap.sh`. En el reintento del escaneo frontend, ZAP completo la fase activa y reporto 0 hallazgos altos, 3 medios, 1 bajo y 5 informativos. El escaneo del backend productivo completo reporto 0 hallazgos altos, 0 medios, 3 bajos y 1 informativo.

## 2. Alcance y metodologia

| Superficie | URL | Herramienta |
|---|---|---|
| Frontend productivo | `https://gyr-monitor.vercel.app/` | Lighthouse, ZAP |
| Backend productivo | `https://gyrmonitor-production.up.railway.app/api/v1` | ZAP |

| Herramienta | Version / modo | Evidencia |
|---|---|---|
| Lighthouse | 13.4.0 | `evidence/lighthouse/lighthouse-production-frontend.report.json`, `evidence/lighthouse/lighthouse-production-frontend.report.html` |
| ZAP by Checkmarx / OWASP ZAP | 2.17.0, `zap.sh -cmd -quickurl` | `evidence/zap/zap-production-frontend-retry-quick-scan.html`, `evidence/zap/zap-production-backend-quick-scan.html` |
| curl | Captura de encabezados HTTP | `evidence/zap/production-frontend-headers.txt`, `evidence/zap/production-backend-headers.txt` |

## 3. Resultados de Lighthouse

**URL evaluada:** `https://gyr-monitor.vercel.app/`  
**Fecha tecnica del reporte Lighthouse:** `2026-07-09T00:24:24.032Z`  
**Evidencia:** `evidence/lighthouse/lighthouse-production-frontend.report.json`

| Categoria | Puntaje |
|---|---:|
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 90 |

| Metrica | Resultado |
|---|---:|
| First Contentful Paint | 1.6 s |
| Largest Contentful Paint | 1.6 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 1.7 s |

Observaciones de Lighthouse:

- El documento no tiene meta descripcion.
- Lighthouse identifico oportunidad de reducir JavaScript no utilizado.
- Lighthouse registro la observacion "Network dependency tree" como diagnostico.

## 4. Auditoria de seguridad con ZAP by Checkmarx

### 4.1 Frontend productivo

**Objetivo:** `https://gyr-monitor.vercel.app/`  
**Evidencia:** `evidence/zap/zap-production-frontend-retry-quick-scan.html`

ZAP normal inicio correctamente con Java 17.0.17 y argumentos JVM `-Xmx4608m`. En el reintento, el escaneo uso spider tradicional y fase activa, completo al 100% y escribio el reporte HTML correspondiente.

| Nivel de riesgo | Numero de alertas |
|---|---:|
| Alto | 0 |
| Medio | 3 |
| Bajo | 1 |
| Informativo | 5 |
| Falsos positivos marcados | 0 |

| ID ZAP | Hallazgo | Riesgo | Instancias | Evidencia |
|---|---|---:|---:|---|
| 10038 | Content Security Policy (CSP) Header Not Set | Medio | 1 | Ausencia de CSP |
| 10098 | Cross-Domain Misconfiguration | Medio | 4 | `Access-Control-Allow-Origin: *` |
| 10020 | Missing Anti-clickjacking Header | Medio | 1 | Ausencia de `X-Frame-Options` o `frame-ancestors` |
| 10021 | X-Content-Type-Options Header Missing | Bajo | 4 | Ausencia de `X-Content-Type-Options: nosniff` |
| 10027 | Information Disclosure - Suspicious Comments | Informativo | 1 | Comentarios sospechosos |
| 10109 | Modern Web Application | Informativo | 1 | Aplicacion web moderna |
| 10015 | Re-examine Cache-control Directives | Informativo | 1 | Revision de directivas de cache |
| 10050 | Retrieved from Cache | Informativo | 4 | Respuestas recuperadas desde cache |
| 10104 | User Agent Fuzzer | Informativo | Sistemico | Diferencias por agente de usuario |

La captura de encabezados del frontend productivo registro `HTTP/2 200`, `server: Vercel`, `strict-transport-security: max-age=63072000; includeSubDomains; preload`, `cache-control: public, max-age=0, must-revalidate` y `access-control-allow-origin: *`.

### 4.2 Backend productivo

**Objetivo:** `https://gyrmonitor-production.up.railway.app/api/v1`  
**Evidencia:** `evidence/zap/zap-production-backend-quick-scan.html`

| Nivel de riesgo | Numero de alertas |
|---|---:|
| Alto | 0 |
| Medio | 0 |
| Bajo | 3 |
| Informativo | 1 |
| Falsos positivos marcados | 0 |

| ID ZAP | Hallazgo | Riesgo | Instancias | Evidencia |
|---|---|---:|---:|---|
| 10037 | Server Leaks Information via `X-Powered-By` HTTP Response Header Field(s) | Bajo | 3 | `x-powered-by: Express` |
| 10035 | Strict-Transport-Security Header Not Set | Bajo | 3 | Ausencia de HSTS en respuestas del backend |
| 10021 | X-Content-Type-Options Header Missing | Bajo | 1 | Ausencia de `X-Content-Type-Options: nosniff` |
| 10015 | Re-examine Cache-control Directives | Informativo | 1 | Revision de directivas de cache |

La captura de encabezados del backend productivo registro `HTTP/2 200`, `content-type: application/json; charset=utf-8`, `access-control-allow-credentials: true`, `vary: Origin`, `x-powered-by: Express` y ausencia visible de `strict-transport-security` y `x-content-type-options`.

## 5. Correcciones por aplicar

| Prioridad | Evidencia | Correccion propuesta | Justificacion tecnica | Impacto esperado | Area responsable | Estado |
|---|---|---|---|---|---|---|
| Alta | ZAP backend 10035 | Configurar `Strict-Transport-Security` en el backend productivo con una politica compatible con HTTPS. | HSTS reduce riesgo de downgrade y uso accidental de HTTP en clientes compatibles. | Cierre de 3 instancias bajas y mejor endurecimiento de transporte. | Backend / Railway | Pendiente |
| Alta | ZAP backend 10037 | Deshabilitar `X-Powered-By` en Express/NestJS. | Exponer el framework facilita fingerprinting tecnologico. | Cierre de 3 instancias bajas y menor divulgacion de tecnologia. | Backend | Pendiente |
| Alta | ZAP frontend 10038 y 10020 | Configurar Content Security Policy en el frontend, incluyendo `frame-ancestors 'none'` o politica equivalente. | CSP reduce exposicion ante XSS e inyeccion de contenido; `frame-ancestors` cubre anti-clickjacking. | Cierre de 2 hallazgos medios del frontend. | Frontend / Vercel | Pendiente |
| Alta | ZAP frontend 10098 | Restringir CORS del frontend a origenes esperados o justificar formalmente `Access-Control-Allow-Origin: *` para assets publicos. | ZAP evidencio CORS permisivo en 4 instancias. | Reduccion del hallazgo medio de CORS y mayor claridad de postura cross-origin. | Frontend / Vercel | Pendiente |
| Media | ZAP backend 10021 | Agregar `X-Content-Type-Options: nosniff` en respuestas del backend. | Evita interpretacion MIME incorrecta y responde directamente al hallazgo ZAP. | Cierre del hallazgo bajo asociado a MIME sniffing. | Backend / Railway | Pendiente |
| Media | ZAP frontend 10021 | Agregar `X-Content-Type-Options: nosniff` en respuestas HTML, JS, CSS y SVG del frontend. | El frontend reporto 4 instancias con ausencia del encabezado anti-MIME-sniffing. | Cierre del hallazgo bajo del frontend. | Frontend / Vercel | Pendiente |
| Media | Lighthouse SEO | Agregar meta descripcion especifica al frontend productivo. | Lighthouse reporto ausencia de meta descripcion; esto afecta calidad SEO y presentacion en resultados. | Mejora esperada del puntaje SEO y del contexto publico de la pagina. | Frontend | Pendiente |
| Media | Lighthouse diagnostics | Revisar JavaScript no utilizado y evaluar division de codigo o carga diferida. | Aunque Performance fue 99, reducir bytes iniciales conserva margen conforme crezca la aplicacion. | Menor costo inicial de carga y mejor resiliencia en redes lentas. | Frontend | Pendiente |
| Baja | ZAP backend 10015 | Revisar directivas de cache del backend y definir politica explicita para respuestas JSON. | ZAP marco cache como informativo; una politica explicita reduce ambiguedad operativa. | Mejor control de cache y revalidacion de datos API. | Backend / Railway | Pendiente |
| Baja | ZAP frontend 10015 y 10050 | Revisar directivas de cache del frontend, distinguiendo HTML revalidable y assets con hash. | ZAP marco cache como informativo; la politica debe ser explicita y coherente con Vercel. | Mejor control de actualizaciones sin degradar rendimiento. | Frontend / Vercel | Pendiente |

## 6. Conclusiones

El frontend productivo presenta resultados fuertes en Lighthouse, con rendimiento casi maximo y accesibilidad completa. Las mejoras mas relevantes son de calidad SEO y optimizacion preventiva de JavaScript.

El backend productivo no presento hallazgos altos ni medios en ZAP. Los hallazgos bajos se concentran en encabezados HTTP de endurecimiento: ocultar `X-Powered-By`, agregar HSTS y agregar `X-Content-Type-Options`.

El reintento del escaneo ZAP del frontend productivo se completo correctamente y expuso hallazgos medios de encabezados y CORS. Estos hallazgos deben priorizarse junto con el endurecimiento del backend.

## 7. Anexo de evidencias

- `docs/reports/first-report/evidence/lighthouse/lighthouse-production-frontend.report.json`
- `docs/reports/first-report/evidence/lighthouse/lighthouse-production-frontend.report.html`
- `docs/reports/first-report/evidence/zap/zap-production-frontend-retry-quick-scan.html`
- `docs/reports/first-report/evidence/zap/zap-production-backend-quick-scan.html`
- `docs/reports/first-report/evidence/zap/production-frontend-headers.txt`
- `docs/reports/first-report/evidence/zap/production-backend-headers.txt`
