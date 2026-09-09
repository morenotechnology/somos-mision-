# Recuperación de contactos — 9 de septiembre de 2026

## Causa

En `handle_new_user`, `false OR NULL` dejaba `can_publish` en NULL cuando
el registro no traía una llave editorial. La columna es NOT NULL. El bloque
de emergencia atrapaba el error y creaba un perfil mínimo sin WhatsApp,
distrito, región ni iglesia. Los datos originales seguían en Auth.

El frontend además trataba «Sin congregación» como un valor editable real.

## Orden de despliegue

1. Ejecutar `profile_private_access.sql`, `registration_contact_fix.sql` y
   `profile_authorization_guard.sql`. Los roles quedan administrados por servidor;
   las cuentas existentes conservan sus permisos.
2. Ejecutar `profile_contact_regression.sql`: prueba el trigger con una cuenta
   sintética dentro de una subtransacción revertida; no envía correos ni crea contraseñas.
3. Desplegar el frontend que utiliza `get_profile_private` y `admin_list_profiles`.
4. Ejecutar `profile_contact_recovery.sql`. En una única transacción limita la
   lectura directa de contactos, crea el respaldo protegido y rellena únicamente
   campos ausentes desde datos proporcionados por el usuario. Conserva permisos,
   puntos y fechas. No genera información inexistente.
5. Ejecutar `profile_contact_access_regression.sql`: verifica consulta de
   superadmin, consulta propia, rechazo de consultas privadas ajenas, lectura
   social y edición propia con el rol authenticated y RLS. La prueba de edición
   se revierte sin alterar los datos. Revisar también cobertura final.

Reaplicar siempre `registration_contact_fix.sql` después de scripts de esquema
históricos que reemplacen `handle_new_user`.

## Respaldo

`public.profile_contact_backup_20260909` conserva la fila anterior completa,
sin contraseñas. Tiene RLS y no concede acceso a usuarios de la aplicación.
Un administrador de base puede recuperar campos puntuales desde `profile_data`;
no restaurar toda la tabla ni sobreescribir cambios posteriores indiscriminadamente.
La rama `codex/backup-before-profile-recovery-20260909` conserva el código anterior.

## Pruebas locales

`node --test src/utils/commentThreads.test.js src/utils/profileContact.test.js`
y `pnpm build`.
