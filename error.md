> nextn@0.1.0 build
> next build
⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry
   ▲ Next.js 15.3.3
   Creating an optimized production build ...
Failed to compile.
./src/app/api/admin/reports/[id]/route.ts
Error:   x await isn't allowed in non-async function
    ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/reports/[id]/route.ts:36:1]
 33 | ) {
 34 |   try {
 35 |     const data = await readReportsFile();
 36 |     const report = data.generated_reports.find((r: any) => r.id === (await params).id);
    :                                                                      ^^^^^
 37 | 
 38 |     if (!report) {
 39 |       return NextResponse.json(
    `----
  x await isn't allowed in non-async function
    ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/reports/[id]/route.ts:79:1]
 76 |     const body = await request.json();
 77 |     const data = await readReportsFile();
 78 | 
 79 |     const reportIndex = data.generated_reports.findIndex((r: any) => r.id === (await params).id);
    :                                                                                ^^^^^
 80 |     if (reportIndex === -1) {
 81 |       return NextResponse.json(
 82 |         { error: 'Reporte no encontrado' },
    `----
  x await isn't allowed in non-async function
     ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/reports/[id]/route.ts:165:1]
 162 |   try {
 163 |     const data = await readReportsFile();
 164 | 
 165 |     const reportIndex = data.generated_reports.findIndex((r: any) => r.id === (await params).id);
     :                                                                                ^^^^^
 166 |     if (reportIndex === -1) {
 167 |       return NextResponse.json(
 168 |         { error: 'Reporte no encontrado' },
     `----
Caused by:
    Syntax Error
Import trace for requested module:
./src/app/api/admin/reports/[id]/route.ts
./src/app/api/admin/subscriptions/[id]/route.ts
Error:   x await isn't allowed in non-async function
    ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/subscriptions/[id]/route.ts:38:1]
 35 |     const data = await readSubscriptionsFile();
 36 |     
 37 |     // Buscar en newsletter subscriptions
 38 |     let entry = data.newsletter_subscriptions.find((sub: any) => sub.id === (await params).id);
    :                                                                              ^^^^^
 39 |     let type = 'newsletter';
 40 |     
 41 |     // Si no se encuentra, buscar en contact submissions
    `----
  x await isn't allowed in non-async function
    ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/subscriptions/[id]/route.ts:43:1]
 40 |     
 41 |     // Si no se encuentra, buscar en contact submissions
 42 |     if (!entry) {
 43 |       entry = data.contact_submissions.find((contact: any) => contact.id === (await params).id);
    :                                                                               ^^^^^
 44 |       type = 'contact';
 45 |     }
    `----
  x await isn't allowed in non-async function
    ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/subscriptions/[id]/route.ts:94:1]
 91 |     const data = await readSubscriptionsFile();
 92 | 
 93 |     // Buscar en newsletter subscriptions
 94 |     let entryIndex = data.newsletter_subscriptions.findIndex((sub: any) => sub.id === (await params).id);
    :                                                                                        ^^^^^
 95 |     let type = 'newsletter';
 96 |     let arrayKey = 'newsletter_subscriptions';
 97 |     
    `----
  x await isn't allowed in non-async function
     ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/subscriptions/[id]/route.ts:100:1]
  97 |     
  98 |     // Si no se encuentra, buscar en contact submissions
  99 |     if (entryIndex === -1) {
 100 |       entryIndex = data.contact_submissions.findIndex((contact: any) => contact.id === (await params).id);
     :                                                                                         ^^^^^
 101 |       type = 'contact';
 102 |       arrayKey = 'contact_submissions';
 103 |     }
     `----
  x await isn't allowed in non-async function
     ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/subscriptions/[id]/route.ts:118:1]
 115 |     if (type === 'newsletter' && body.email && body.email !== existingEntry.email) {
 116 |       // Verificar que el nuevo email no exista
 117 |       const emailExists = data.newsletter_subscriptions.some((sub: any) => 
 118 |         sub.email === body.email && sub.id !== (await params).id
     :                                                 ^^^^^
 119 |       );
 120 |       if (emailExists) {
 121 |         return NextResponse.json(
     `----
  x await isn't allowed in non-async function
     ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/subscriptions/[id]/route.ts:195:1]
 192 |     const data = await readSubscriptionsFile();
 193 | 
 194 |     // Buscar en newsletter subscriptions
 195 |     let entryIndex = data.newsletter_subscriptions.findIndex((sub: any) => sub.id === (await params).id);
     :                                                                                        ^^^^^
 196 |     let arrayKey = 'newsletter_subscriptions';
 197 |     
 198 |     // Si no se encuentra, buscar en contact submissions
     `----
  x await isn't allowed in non-async function
     ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/subscriptions/[id]/route.ts:200:1]
 197 |     
 198 |     // Si no se encuentra, buscar en contact submissions
 199 |     if (entryIndex === -1) {
 200 |       entryIndex = data.contact_submissions.findIndex((contact: any) => contact.id === (await params).id);
     :                                                                                         ^^^^^
 201 |       arrayKey = 'contact_submissions';
 202 |     }
     `----
Caused by:
    Syntax Error
Import trace for requested module:
./src/app/api/admin/subscriptions/[id]/route.ts
./src/app/api/admin/users/[id]/route.ts
Error:   x await isn't allowed in non-async function
    ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/users/[id]/route.ts:36:1]
 33 | ) {
 34 |   try {
 35 |     const data = await readUsersFile();
 36 |     const user = data.users.find((u: any) => u.id === (await params).id);
    :                                                        ^^^^^
 37 | 
 38 |     if (!user) {
 39 |       return NextResponse.json(
    `----
  x await isn't allowed in non-async function
    ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/users/[id]/route.ts:72:1]
 69 |     const body = await request.json();
 70 |     const data = await readUsersFile();
 71 | 
 72 |     const userIndex = data.users.findIndex((u: any) => u.id === (await params).id);
    :                                                                  ^^^^^
 73 |     if (userIndex === -1) {
 74 |       return NextResponse.json(
 75 |         { error: 'Usuario no encontrado' },
    `----
  x await isn't allowed in non-async function
    ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/users/[id]/route.ts:85:1]
 82 |     // Si se está actualizando el email, verificar que no exista
 83 |     if (body.email && body.email !== existingUser.email) {
 84 |       const emailExists = data.users.some((u: any) => 
 85 |         u.email === body.email && u.id !== (await params).id
    :                                             ^^^^^
 86 |       );
 87 |       if (emailExists) {
 88 |         return NextResponse.json(
    `----
  x await isn't allowed in non-async function
     ,-[/home/runner/work/metrica-dip/metrica-dip/src/app/api/admin/users/[id]/route.ts:155:1]
 152 |   try {
 153 |     const data = await readUsersFile();
 154 | 
 155 |     const userIndex = data.users.findIndex((u: any) => u.id === (await params).id);
     :                                                                  ^^^^^
 156 |     if (userIndex === -1) {
 157 |       return NextResponse.json(
 158 |         { error: 'Usuario no encontrado' },
     `----
Caused by:
    Syntax Error
Import trace for requested module:
./src/app/api/admin/users/[id]/route.ts
> Build failed because of webpack errors
Error: Process completed with exit code 1.