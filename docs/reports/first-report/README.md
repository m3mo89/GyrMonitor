# Primer reporte tecnico de produccion

Este directorio contiene el primer reporte tecnico auditado de GyrMonitor contra produccion.

El entregable final es exclusivamente el PDF ubicado en `exports/`. Los archivos `report.md`, `report.html` y las evidencias quedan en el repositorio como trazabilidad tecnica, no como documento editable de entrega.

## Alcance

- Frontend productivo: `https://gyr-monitor.vercel.app/`
- Backend productivo: `https://gyrmonitor-production.up.railway.app/api/v1`
- Herramientas usadas: Lighthouse y ZAP by Checkmarx/OWASP ZAP.
- Herramientas excluidas de este reporte: WebPageTest.

## Evidencias

- `evidence/lighthouse/`: reporte JSON y HTML de Lighthouse para el frontend productivo.
- `evidence/zap/`: reportes HTML de ZAP y encabezados HTTP capturados para frontend y backend productivos.
- `screenshots/`: capturas complementarias si se agregan posteriormente.
- `exports/`: PDF final.

## Regla de integridad

No se deben inventar metricas ni hallazgos. Cualquier actualizacion del reporte debe basarse en una nueva evidencia guardada dentro de este directorio.
