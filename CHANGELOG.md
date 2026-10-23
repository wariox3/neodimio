# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.0.27](https://github.com/wariox3/neodimio/compare/v0.0.26...v0.0.27) (2026-10-23)


### Features

* **forms:** recortar espacios en campos de texto de login, registro y perfil ([e347324](https://github.com/wariox3/neodimio/commit/e347324af4c148fde136da3cb3bee45c258cf99e))


### Refactoring

* renombrar apps portal a empleado y seguridad a erp ([374f882](https://github.com/wariox3/neodimio/commit/374f882bcb5a98492f322c37f25afbe73bd45e2a))

## [0.0.26](https://github.com/tamerlantian/semantica-nx/compare/v0.0.25...v0.0.26) (2026-07-10)


### Features

* **reclamos:** permitir adjuntar y descargar ficheros desde la lista ([179ef87](https://github.com/tamerlantian/semantica-nx/commit/179ef872df03b768eb1d0d4735238e7cc9969f9b))

## [0.0.25](https://github.com/tamerlantian/semantica-nx/compare/v0.0.24...v0.0.25) (2026-07-09)


### Features

* **ui:** permitir descargar ficheros desde el diálogo de adjuntos ([8778cbb](https://github.com/tamerlantian/semantica-nx/commit/8778cbbca8c6416c3931e2b9be3e0eda5c3cfab1))

## [0.0.24](https://github.com/tamerlantian/semantica-nx/compare/v0.0.23...v0.0.24) (2026-07-09)


### Bug Fixes

* **solicitudes:** corregir badge de estado que siempre mostraba pendiente ([48fbdec](https://github.com/tamerlantian/semantica-nx/commit/48fbdecc9bae27dcb87f9a2183da6754543def9c))

## [0.0.23](https://github.com/tamerlantian/semantica-nx/compare/v0.0.22...v0.0.23) (2026-06-26)


### Features

* **landing:** reemplazar formulario de contacto por canal de whatsapp ([5becc5f](https://github.com/tamerlantian/semantica-nx/commit/5becc5f3f2daf21df98c79223a33a2c6a64ea110))

## [0.0.22](https://github.com/tamerlantian/semantica-nx/compare/v0.0.21...v0.0.22) (2026-06-19)


### Features

* **dashboard:** mostrar datos de identidad y aviso al asociar empresa ([ba0de42](https://github.com/tamerlantian/semantica-nx/commit/ba0de426f86e9ade36a1f5e2a920e94fff020f9a))


### Bug Fixes

* **perfil:** refrescar estado de auth al guardar el perfil ([81cee94](https://github.com/tamerlantian/semantica-nx/commit/81cee9414efe89849d715d0393ade8b41330a85a))

## [0.0.21](https://github.com/tamerlantian/semantica-nx/compare/v0.0.20...v0.0.21) (2026-06-16)


### Features

* **auth:** bloquear botón de reenvío con cuenta regresiva persistente ([a70df31](https://github.com/tamerlantian/semantica-nx/commit/a70df3198c528f1f11363a905f5e6253232350e3))


### Bug Fixes

* **auth:** verificar correo con clic explícito para evitar token inválido ([d3bfc94](https://github.com/tamerlantian/semantica-nx/commit/d3bfc94123bd02f771093676598ae60a1b57f072))

## [0.0.20](https://github.com/tamerlantian/semantica-nx/compare/v0.0.19...v0.0.20) (2026-06-05)


### Features

* **seguridad:** agregar filtros de correo y rol a la tabla de usuarios ([8bd2058](https://github.com/tamerlantian/semantica-nx/commit/8bd20586a3666999db93c0538661b7b30493801b))

## [0.0.19](https://github.com/tamerlantian/semantica-nx/compare/v0.0.18...v0.0.19) (2026-06-05)


### Features

* **portal:** permitir cambiar de empresa desde el perfil ([4d0743b](https://github.com/tamerlantian/semantica-nx/commit/4d0743bcc8a01daf32def0941c143a7217ea4657))
* **seguridad:** agregar módulo de usuarios paginado restringido a admin ([c78ae9e](https://github.com/tamerlantian/semantica-nx/commit/c78ae9eae2700e83ab5da79ed697a68c20aae49f))

## [0.0.18](https://github.com/tamerlantian/semantica-nx/compare/v0.0.17...v0.0.18) (2026-04-21)


### Bug Fixes

* **portal:** simplify PDF download to fix mobile save error ([7f8ee3e](https://github.com/tamerlantian/semantica-nx/commit/7f8ee3e8ee00b25f2302e218b9feaf85d739377e))

## [0.0.17](https://github.com/tamerlantian/semantica-nx/compare/v0.0.16...v0.0.17) (2026-04-20)


### Bug Fixes

* **portal:** open window synchronously to bypass iOS Safari popup blocker ([40da474](https://github.com/tamerlantian/semantica-nx/commit/40da474b516fc222c397a3170282b55273ece342))

## [0.0.16](https://github.com/tamerlantian/semantica-nx/compare/v0.0.15...v0.0.16) (2026-04-20)


### Bug Fixes

* **portal:** fix PDF download on mobile for pagos and certificado laboral ([3c71e9e](https://github.com/tamerlantian/semantica-nx/commit/3c71e9ebb37f1f2321701d18ed862519e5b7cacf))

## [0.0.15](https://github.com/tamerlantian/semantica-nx/compare/v0.0.14...v0.0.15) (2026-04-20)


### Bug Fixes

* **portal:** use anchor download instead of window.open for pago PDF ([45f538a](https://github.com/tamerlantian/semantica-nx/commit/45f538a2532dfe4c3c470f0df8c8902a3696e820))


### Refactoring

* **core:** add BaseHttpService to core and align ficheros.service ([7729e91](https://github.com/tamerlantian/semantica-nx/commit/7729e919b2e3b20f6264195ff1d416a7dcd4add4))
* **core:** consolidate BaseHttpService into libs/core ([6d55ee5](https://github.com/tamerlantian/semantica-nx/commit/6d55ee5ed807069ee25c830030c35c901436ac32))
* **portal:** add takeUntilDestroyed to list components ([6e16aba](https://github.com/tamerlantian/semantica-nx/commit/6e16aba161ecaba5356807ccc00b9da9d88833ac))
* **portal:** extract landing contact endpoint into ContactoService ([2f4fb2c](https://github.com/tamerlantian/semantica-nx/commit/2f4fb2c5284bd5f749a8b3f91a6cf7b674afdbd1))
* **portal:** improve perfil feature code quality ([f58f65f](https://github.com/tamerlantian/semantica-nx/commit/f58f65f3c012ab9c18195659eb36e517957bf2e7))
* **portal:** move enlaces endpoint inline in EnlacesService ([4ff002f](https://github.com/tamerlantian/semantica-nx/commit/4ff002f36433df88bd940149df3ebee1ed63e14c))
* **seguridad:** migrate services to extend BaseHttpService from @semantica/core ([8417d3e](https://github.com/tamerlantian/semantica-nx/commit/8417d3e807e8ee48a3c3eeeed650cfff08ebe65f))

## [0.0.14](https://github.com/tamerlantian/semantica-nx/compare/v0.0.13...v0.0.14) (2026-04-10)


### Features

* added new fields to capacitacion.model ([4db1536](https://github.com/tamerlantian/semantica-nx/commit/4db15368dbb8aa59668fe8132de7b80442a4a556))
* **portal:** add day-of-week letter to programacion-table headers ([e6160de](https://github.com/tamerlantian/semantica-nx/commit/e6160dedefa5c7643d1bbb3af27b4a656e2c6678))
* **portal:** improve capacitaciones-card responsive design and layout ([7019a06](https://github.com/tamerlantian/semantica-nx/commit/7019a06ad8b43cbe604cdfffbd741db8ed926e39))


### Bug Fixes

* **portal:** improve responsive layout in turnos-list for tablets ([fd5e2a3](https://github.com/tamerlantian/semantica-nx/commit/fd5e2a33f957a3666f033f88309ed053b181342b))

## [0.0.13](https://github.com/tamerlantian/semantica-nx/compare/v0.0.12...v0.0.13) (2026-04-10)


### Features

* **portal:** disable creditos section with "próximamente" badge ([6817f61](https://github.com/tamerlantian/semantica-nx/commit/6817f61990afb59f7584c99f8ad5a6e18df5bff5))
* **seguridad:** add formato-imagen management with delete support ([3733ae0](https://github.com/tamerlantian/semantica-nx/commit/3733ae046e6816aa5ddf64c5677c1f0a69756cca))


### Bug Fixes

* added package* to excluding rules nx ([7e22726](https://github.com/tamerlantian/semantica-nx/commit/7e2272673ada6983e7bc598efce967a3c8461dac))
* confirm button changed color to primary ([b9cb8c5](https://github.com/tamerlantian/semantica-nx/commit/b9cb8c515f272f963f97e45e37c50678a831214f))
* remove coming soon message from shell ([0ed77bb](https://github.com/tamerlantian/semantica-nx/commit/0ed77bb10860636ede0e2075624aff6510adc56a))

## [0.0.12](https://github.com/tamerlantian/semantica-nx/compare/v0.0.11...v0.0.12) (2026-04-07)


### Bug Fixes

* **portal:** update creditos list endpoint to lista-portal ([6621d61](https://github.com/tamerlantian/semantica-nx/commit/6621d616aebd019800aa2f5b2ef160cc476947b0))

## [0.0.11](https://github.com/tamerlantian/semantica-nx/compare/v0.0.10...v0.0.11) (2026-04-07)


### Bug Fixes

* get links api changed ([a0dd333](https://github.com/tamerlantian/semantica-nx/commit/a0dd3337de1cf1705288a354a3fe59fb015259d5))

## [0.0.10](https://github.com/tamerlantian/semantica-nx/compare/v0.0.9...v0.0.10) (2026-04-07)


### Bug Fixes

* ancho de card de vencimientos al 50% ([df2d70d](https://github.com/tamerlantian/semantica-nx/commit/df2d70d56b67fe30af175ee2ba418cc7014227cb))

## [0.0.9](https://github.com/tamerlantian/semantica-nx/compare/v0.0.8...v0.0.9) (2026-04-07)


### Features

* **portal:** agregar tarjeta de vencimientos en vista de turnos ([d4a0913](https://github.com/tamerlantian/semantica-nx/commit/d4a091368663913547c657de182e6edeb698db7d))
* **portal:** conectar capacitaciones a API real y ampliar tarjeta ([16d04a7](https://github.com/tamerlantian/semantica-nx/commit/16d04a7eec82e285a07ee743e6c74d9a13bea77e))
* **portal:** conectar selector de ciudades a API con búsqueda ([d000e70](https://github.com/tamerlantian/semantica-nx/commit/d000e703256f419979b8031876ad72ac31f2e9ad))
* **portal:** implementar módulo de actualizar información ([52d7d6d](https://github.com/tamerlantian/semantica-nx/commit/52d7d6dc4faa956b8dd61b9dd422c28d429a81f1))
* **portal:** implementar módulo de solicitud de créditos ([dfa9125](https://github.com/tamerlantian/semantica-nx/commit/dfa9125e51c8ef22980a7fc95b6ae2429ffe13a2))
* **portal:** rediseñar actualizar información con layout de dos paneles ([0ee02f7](https://github.com/tamerlantian/semantica-nx/commit/0ee02f79fff53e1aa4428fd8aed951ee5c9b5df3))
* **portal:** rediseñar vista de capacitaciones con tarjetas ([901a0c4](https://github.com/tamerlantian/semantica-nx/commit/901a0c47bc97b56ff12049934b6bec48bfe725b1))


### Bug Fixes

* calendario al 50% ([9d8da6a](https://github.com/tamerlantian/semantica-nx/commit/9d8da6aebc13e13a747bebf8c45e387a36c1feac))
* **portal:** expandir grupo utilidades por defecto en el sidebar ([84c2e99](https://github.com/tamerlantian/semantica-nx/commit/84c2e995855783856244d8d5142b4b449ef550a4))

## [0.0.8](https://github.com/tamerlantian/semantica-nx/compare/v0.0.7...v0.0.8) (2026-04-01)


### Bug Fixes

* **portal:** usar proxy en staging para evitar bloqueo cross-site ([a53296e](https://github.com/tamerlantian/semantica-nx/commit/a53296e300a69f2bbbe48e38f0cde4bf9f0ab431))
* **portal:** usar proxy en staging para evitar bloqueo cross-site ([95a6037](https://github.com/tamerlantian/semantica-nx/commit/95a6037f6e628d166c5ee0bf62cab22e9869f2d6))

## [0.0.7](https://github.com/tamerlantian/semantica-nx/compare/v0.0.6...v0.0.7) (2026-03-31)


### Bug Fixes

* **portal:** no cargar enlaces cuando el usuario no tiene tenant ([6e9da68](https://github.com/tamerlantian/semantica-nx/commit/6e9da68eee4be6491160ed65823cde25a21a3b37))

## [0.0.6](https://github.com/tamerlantian/semantica-nx/compare/v0.0.5...v0.0.6) (2026-03-31)


### Features

* **portal:** mostrar aviso de cuenta no verificada en página de reenvío ([6310453](https://github.com/tamerlantian/semantica-nx/commit/631045333b673142ac7843f74545ac41a66d6b7e))


### Bug Fixes

* **portal:** redirigir a reenvío de verificación cuando cuenta no está verificada ([23aa1f7](https://github.com/tamerlantian/semantica-nx/commit/23aa1f7124d30f3de92c773de198c8a3499a86b9))

## [0.0.5](https://github.com/tamerlantian/semantica-nx/compare/v0.0.4...v0.0.5) (2026-03-31)


### Features

* **core:** agregar utilidades de fecha ([6a14430](https://github.com/tamerlantian/semantica-nx/commit/6a14430f11f8171d8ef814f05b06c0231383f2fb))
* **portal:** agregar componente de enlaces rápidos en inicio ([2c760a7](https://github.com/tamerlantian/semantica-nx/commit/2c760a74ced4da384e36c2190da9040c83e7abb7))
* **portal:** mostrar programación del mes actual y siguiente ([0a1d52f](https://github.com/tamerlantian/semantica-nx/commit/0a1d52fb09fad2f503964e3af18862f6880f8bad))
* **portal:** rediseñar página de perfil con endpoint de detalle ([53b365e](https://github.com/tamerlantian/semantica-nx/commit/53b365e5714052bd44f3978546309a08c3e73fe5))


### Bug Fixes

* **portal:** corregir recorte del menú de usuario en móvil ([a03c845](https://github.com/tamerlantian/semantica-nx/commit/a03c8455f5d2c3a4e3036fc55bd93db248dc5db8))

## [0.0.4](https://github.com/tamerlantian/semantica-nx/compare/v0.0.3...v0.0.4) (2026-03-31)


### Features

* **core:** agregar whatsappPhone a SemanticaEnvironment y environments del portal ([1433791](https://github.com/tamerlantian/semantica-nx/commit/1433791e58f8116a38d1d571ec7e290d509a88d4))
* **portal:** agregar diálogo de consignas en turnos ([17175c1](https://github.com/tamerlantian/semantica-nx/commit/17175c1b9dc7a5041497d7ddb75d07afa0cc4cc0))
* **portal:** agregar módulo de perfil y menú de usuario en navbar ([9e155d6](https://github.com/tamerlantian/semantica-nx/commit/9e155d61d69d6cf16934c8830310340f7a86cee3))


### Refactoring

* **portal:** centralizar número de WhatsApp usando token ENVIRONMENT ([9201245](https://github.com/tamerlantian/semantica-nx/commit/920124511704f2418722de981ef7fa94eabc40ef))

## [0.0.3](https://github.com/tamerlantian/semantica-nx/compare/v0.0.1...v0.0.3) (2026-03-31)


### Features

* **portal:** agregar diálogo de creación de solicitudes y validador de rango de fechas ([d1e74e7](https://github.com/tamerlantian/semantica-nx/commit/d1e74e7709b285fd19e76330fa1cb23039eae9c3))
* **portal:** agregar diálogo de ficheros adjuntos en solicitudes ([8b2ecbb](https://github.com/tamerlantian/semantica-nx/commit/8b2ecbbd9bdfd6428b5f4a5d26ad894c726d7298))
* **portal:** agregar tags de estado en solicitudes y reordenar menú lateral ([d591fb9](https://github.com/tamerlantian/semantica-nx/commit/d591fb9ced0e5fc26bcfa9aa5ff8e499082c7d5b))
* **portal:** aplicar estándar visual a capacitaciones, créditos y anticipo de nómina ([3f02aba](https://github.com/tamerlantian/semantica-nx/commit/3f02aba29400df09404ace64afee6ab37cff617a))
* **portal:** implementar lista de solicitudes con paginación lazy ([ef9de5e](https://github.com/tamerlantian/semantica-nx/commit/ef9de5e144c37369c7f1fe46f7162cc4380b2dbf))
* **portal:** rediseñar diálogo de ficheros y agregar listado general de adjuntos ([7d455a8](https://github.com/tamerlantian/semantica-nx/commit/7d455a8c2f3ee08329742ef83332f0f8aeea2f74))


### Refactoring

* mover FicherosDialogComponent y modelo Fichero a librerías compartidas ([a178189](https://github.com/tamerlantian/semantica-nx/commit/a178189a8f4e426a9e3728befedab79a8c8b0540))
* **portal:** deshabilitar créditos y anticipo de nómina, ajustes en turnos ([b75ec95](https://github.com/tamerlantian/semantica-nx/commit/b75ec951ea1ee8697597f99b70e3f6476b4af9cc))
* **portal:** mover calendario de programaciones al módulo de turnos ([345961c](https://github.com/tamerlantian/semantica-nx/commit/345961c59ffa07adb118494a1887fe3a880370dc))
* **portal:** reemplazar p-accordion por navegación custom en shell sidebar ([0e617cb](https://github.com/tamerlantian/semantica-nx/commit/0e617cb6d63108a2f06e18db0344088c84167a64))
* **portal:** separar programaciones y reportes de programación del módulo de turnos ([7daae0d](https://github.com/tamerlantian/semantica-nx/commit/7daae0d041853305f9e77a6b7df36c2111511dab))
* **portal:** unificar diálogo de ficheros con lista y carga por solicitud ([63e3645](https://github.com/tamerlantian/semantica-nx/commit/63e36455df10a88dd2f3ea9439dd496d43172e9f))

## [0.0.2](https://github.com/tamerlantian/semantica-nx/compare/v0.0.1...v0.0.2) (2026-03-31)


### Features

* **portal:** agregar diálogo de creación de solicitudes y validador de rango de fechas ([d1e74e7](https://github.com/tamerlantian/semantica-nx/commit/d1e74e7709b285fd19e76330fa1cb23039eae9c3))
* **portal:** agregar diálogo de ficheros adjuntos en solicitudes ([8b2ecbb](https://github.com/tamerlantian/semantica-nx/commit/8b2ecbbd9bdfd6428b5f4a5d26ad894c726d7298))
* **portal:** agregar tags de estado en solicitudes y reordenar menú lateral ([c8deffc](https://github.com/tamerlantian/semantica-nx/commit/c8deffc847395d09d6ad9a2f17b8076721550197))
* **portal:** aplicar estándar visual a capacitaciones, créditos y anticipo de nómina ([aa32134](https://github.com/tamerlantian/semantica-nx/commit/aa321345ff4759d5f0b3525d37bb957d960c71bd))
* **portal:** implementar lista de solicitudes con paginación lazy ([ef9de5e](https://github.com/tamerlantian/semantica-nx/commit/ef9de5e144c37369c7f1fe46f7162cc4380b2dbf))
* **portal:** rediseñar diálogo de ficheros y agregar listado general de adjuntos ([7d455a8](https://github.com/tamerlantian/semantica-nx/commit/7d455a8c2f3ee08329742ef83332f0f8aeea2f74))


### Refactoring

* mover FicherosDialogComponent y modelo Fichero a librerías compartidas ([0527ace](https://github.com/tamerlantian/semantica-nx/commit/0527acec15915f90c728a00777f28c7eec64bcb2))
* **portal:** mover calendario de programaciones al módulo de turnos ([99a968a](https://github.com/tamerlantian/semantica-nx/commit/99a968a2cd2d89e7a07c9d4f19bbd53b47100ee2))
* **portal:** reemplazar p-accordion por navegación custom en shell sidebar ([54aaf99](https://github.com/tamerlantian/semantica-nx/commit/54aaf99dd309cfb84253b6c3b103f194559487d2))
* **portal:** separar programaciones y reportes de programación del módulo de turnos ([7daae0d](https://github.com/tamerlantian/semantica-nx/commit/7daae0d041853305f9e77a6b7df36c2111511dab))
* **portal:** unificar diálogo de ficheros con lista y carga por solicitud ([63e3645](https://github.com/tamerlantian/semantica-nx/commit/63e36455df10a88dd2f3ea9439dd496d43172e9f))

## [0.0.1](https://github.com/tamerlantian/semantica-nx/compare/v0.0.0...v0.0.1) (2026-03-28)


### Features

* **certificado-laboral:** conectar botón imprimir y agregar columnas a tabla ([a05a4c8](https://github.com/tamerlantian/semantica-nx/commit/a05a4c854442876a93ff8db78c01481a8a650943))
* **portal, seguridad:** mostrar nombre de empresa en navbar ([0f0006c](https://github.com/tamerlantian/semantica-nx/commit/0f0006cebd964b4a124a63e19b3068915fc7dd3f))


### Refactoring

* **core:** mover tenant_id de BaseUsuario a modelos de cada app ([e4dc8d6](https://github.com/tamerlantian/semantica-nx/commit/e4dc8d6374c64915e2c365437419bc9164db5c01))
* **portal:** extraer diálogo asociar empresa a componente con autocomplete ([2d58144](https://github.com/tamerlantian/semantica-nx/commit/2d58144dc43f7d9da678490dbbbba9c7850dcef7))


### Documentation

* agregar README del monorepo ([a4a0e7c](https://github.com/tamerlantian/semantica-nx/commit/a4a0e7c78103029510132f60916664c4e2f903b0))

## 0.0.0 (2026-03-28)


### Features

* inicio module ([f9074d0](https://github.com/tamerlantian/semantica-nx/commit/f9074d0cf777654ee665675cec55b93f5872a270))


### Bug Fixes

* dev to staging server and prod to prod server yml settings ([a7a29c7](https://github.com/tamerlantian/semantica-nx/commit/a7a29c7cf241e82f2f1a0749855885985c3f9c0d))
* module boundaries ([2ba4d5f](https://github.com/tamerlantian/semantica-nx/commit/2ba4d5f029573785d32b03cea7ed5c8859d288bb))
* removed test affected ([55cfaa2](https://github.com/tamerlantian/semantica-nx/commit/55cfaa28d158cc8e512fc75e02759c3a63c8f596))
* wrong built output dir ([03652f9](https://github.com/tamerlantian/semantica-nx/commit/03652f930ec31f9c19447cb5a3b33bd2d23a4a37))
