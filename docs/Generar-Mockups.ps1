Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $PSScriptRoot 'mockups'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

function Color([string] $hex) {
    return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function Box([float] $x, [float] $y, [float] $w, [float] $h, [string] $fill, [int] $radius = 0, [string] $border = '') {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    if ($radius -le 0) {
        $path.AddRectangle([System.Drawing.RectangleF]::new($x, $y, $w, $h))
    } else {
        $d = [float] ($radius * 2)
        $path.AddArc($x, $y, $d, $d, 180, 90)
        $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
        $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
        $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
        $path.CloseFigure()
    }
    $brush = [System.Drawing.SolidBrush]::new((Color $fill))
    $script:g.FillPath($brush, $path)
    $brush.Dispose()
    if ($border) {
        $pen = [System.Drawing.Pen]::new((Color $border), 1)
        $script:g.DrawPath($pen, $path)
        $pen.Dispose()
    }
    $path.Dispose()
}

function DrawText([string] $value, [float] $x, [float] $y, [float] $w, [float] $h, [float] $size = 15, [string] $color = '#203449', [bool] $bold = $false, [string] $align = 'Near') {
    $style = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
    $font = [System.Drawing.Font]::new('Segoe UI', $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
    $brush = [System.Drawing.SolidBrush]::new((Color $color))
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = [System.Drawing.StringAlignment]::$align
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $format.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter
    $format.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap
    $script:g.DrawString($value, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $w, $h), $format)
    $format.Dispose()
    $brush.Dispose()
    $font.Dispose()
}

function Rule([float] $x1, [float] $y1, [float] $x2, [float] $y2, [string] $color = '#e2e9f0') {
    $pen = [System.Drawing.Pen]::new((Color $color), 1)
    $script:g.DrawLine($pen, $x1, $y1, $x2, $y2)
    $pen.Dispose()
}

function Base([string] $section, [string] $eyebrow, [string] $title, [string] $subtitle) {
    $script:bitmap = [System.Drawing.Bitmap]::new(1440, 900)
    $script:g = [System.Drawing.Graphics]::FromImage($script:bitmap)
    $script:g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $script:g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $script:g.Clear((Color '#f5f8fb'))

    Box 0 0 205 900 '#ffffff'
    Rule 204 0 204 900
    Box 24 30 34 34 '#2b6aa5' 8
    DrawText 'G' 24 30 34 34 17 '#ffffff' $true 'Center'
    DrawText 'Gestor Gym' 69 29 130 36 18 '#203449' $true
    DrawText 'GESTIÓN' 26 101 160 20 11 '#8192a3' $true
    $items = @('Agenda', 'Socios', 'Clases', 'Planes', 'Pagos')
    for ($i = 0; $i -lt $items.Count; $i++) {
        $y = 128 + 44 * $i
        if ($items[$i] -eq $section) { Box 16 $y 173 39 '#eaf3fb' 9 }
        $navColor = if ($items[$i] -eq $section) { '#245f99' } else { '#728397' }
        DrawText $items[$i] 28 $y 150 39 14 $navColor ($items[$i] -eq $section)
    }
    Rule 16 840 189 840
    DrawText 'Recepción' 27 851 140 20 13 '#203449' $true
    DrawText 'Panel del personal' 27 872 155 18 12 '#8192a3'

    DrawText $eyebrow 246 36 900 20 11 '#8192a3' $true
    DrawText $title 246 62 900 43 30 '#203449' $true
    DrawText $subtitle 246 106 900 24 15 '#728397'
    Box 1265 38 143 37 '#ffffff' 18 '#e2e9f0'
    Box 1271 43 27 27 '#e9f6ef' 13
    DrawText 'R' 1271 43 27 27 13 '#278662' $false 'Center'
    DrawText 'Recepción' 1306 42 95 29 13 '#203449'
}

function Summary([string[]] $labels, [string[]] $values) {
    $width = 372
    for ($i = 0; $i -lt 3; $i++) {
        $x = 246 + 396 * $i
        Box $x 151 $width 105 '#ffffff' 12 '#e2e9f0'
        DrawText $labels[$i] ($x + 22) 171 ($width - 44) 25 14 '#8192a3'
        DrawText $values[$i] ($x + 22) 200 ($width - 44) 39 27 '#203449' $true
    }
}

function TablePanel([string] $heading, [string] $count, [string] $search, [string] $action, [string[]] $headers, [float[]] $widths, [object[]] $rows) {
    $x = 246; $y = 281; $w = 1164
    $panelHeight = [Math]::Min(565, 137 + 68 * $rows.Count)
    Box $x $y $w $panelHeight '#ffffff' 12 '#e2e9f0'
    DrawText $heading 270 308 330 32 19 '#203449' $true
    DrawText $count 270 342 330 23 14 '#8192a3'
    DrawText $search 860 296 250 20 12 '#203449' $true
    Box 860 320 297 39 '#ffffff' 7 '#e2e9f0'
    DrawText 'Buscar...' 872 322 267 35 13 '#a1aebc'
    if ($action) {
        Box 1170 320 215 39 '#2b6aa5' 8
        DrawText $action 1180 320 195 39 13 '#ffffff' $true 'Center'
    }
    Rule 246 379 1410 379
    Box 247 380 1162 43 '#f8fafc'
    $columnX = 270
    for ($i = 0; $i -lt $headers.Count; $i++) {
        DrawText $headers[$i] $columnX 388 ($widths[$i] - 8) 25 12 '#8192a3' $true
        $columnX += $widths[$i]
    }
    Rule 246 423 1410 423
    for ($r = 0; $r -lt $rows.Count; $r++) {
        $rowY = 424 + 68 * $r
        $columnX = 270
        for ($i = 0; $i -lt $headers.Count; $i++) {
            $value = [string] $rows[$r][$i]
            DrawText $value $columnX ($rowY + 9) ($widths[$i] - 12) 49 14 '#34495e' ($i -eq 0)
            $columnX += $widths[$i]
        }
        if ($r -lt $rows.Count - 1) { Rule 247 ($rowY + 68) 1409 ($rowY + 68) }
    }
}

function Save([string] $name) {
    $path = Join-Path $outputDir $name
    $script:bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $script:g.Dispose()
    $script:bitmap.Dispose()
}

# Agenda
Base 'Agenda' 'AGENDA' 'Agenda de clases' 'Horarios y lugares disponibles de la semana.'
Box 246 151 37 37 '#ffffff' 8 '#e2e9f0'
DrawText '‹' 246 151 37 37 24 '#203449' $false 'Center'
Box 291 151 37 37 '#ffffff' 8 '#e2e9f0'
DrawText '›' 291 151 37 37 24 '#203449' $false 'Center'
DrawText '19 oct – 25 oct' 346 151 165 37 15 '#203449' $true
Box 520 151 52 37 '#ffffff' 8 '#e2e9f0'
DrawText 'Hoy' 520 151 52 37 13 '#728397' $false 'Center'
Box 1040 164 8 8 '#2b6aa5' 4
DrawText 'Disponible' 1054 156 100 24 12 '#728397'
Box 1145 164 8 8 '#278662' 4
DrawText 'Pocos lugares' 1159 156 110 24 12 '#728397'
Box 1272 164 8 8 '#9ba8b4' 4
DrawText 'Completa' 1286 156 100 24 12 '#728397'
Box 246 211 1164 617 '#ffffff' 10 '#e2e9f0'
$gridX = 326; $dayW = 154.85; $gridTop = 274; $rowH = 110
DrawText 'Hora' 260 222 65 42 13 '#8192a3'
$days = @('Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom')
for ($d = 0; $d -lt 7; $d++) {
    $dx = $gridX + $dayW * $d
    DrawText $days[$d] $dx 218 $dayW 22 13 '#8192a3' $false 'Center'
    DrawText ([string](19 + $d)) $dx 241 $dayW 30 20 '#203449' $true 'Center'
    Rule $dx 211 $dx 828
}
Rule 246 $gridTop 1410 $gridTop
$hours = @('08:00', '09:00', '10:00', '17:00', '18:00')
for ($r = 0; $r -lt 5; $r++) {
    $ry = $gridTop + $rowH * $r
    DrawText $hours[$r] 260 ($ry + 13) 63 25 13 '#8192a3'
    if ($r -gt 0) { Rule 246 $ry 1410 $ry }
}
function ClassCard([int] $day, [int] $row, [string] $title, [string] $instructor, [string] $status, [string] $kind) {
    $cx = 332 + $dayW * $day; $cy = 282 + $rowH * $row
    $bg = if ($kind -eq 'few') { '#eaf6f0' } elseif ($kind -eq 'full') { '#f1f3f5' } else { '#eaf3fb' }
    $edge = if ($kind -eq 'few') { '#278662' } elseif ($kind -eq 'full') { '#9ba8b4' } else { '#2b6aa5' }
    Box $cx $cy 143 94 $bg 7
    Box $cx $cy 3 94 $edge 1
    DrawText $title ($cx + 11) ($cy + 8) 125 25 13 '#203449' $true
    DrawText $instructor ($cx + 11) ($cy + 35) 125 27 11 '#728397'
    DrawText $status ($cx + 11) ($cy + 66) 125 19 11 $edge $true
}
ClassCard 0 0 'Funcional' '08:00 · Lucía Gómez' '8 lugares libres' 'available'
ClassCard 4 0 'Funcional' '08:00 · Lucía Gómez' '2 lugares libres' 'few'
ClassCard 1 1 'Yoga' '09:00 · Martina Díaz' '3 lugares libres' 'few'
ClassCard 5 2 'Yoga' '10:00 · Martina Díaz' '7 lugares libres' 'available'
ClassCard 3 3 'Pilates' '17:00 · Carla López' '6 lugares libres' 'available'
ClassCard 2 4 'Spinning' '18:00 · Nicolás Ruiz' 'Completa' 'full'
Save '01-agenda.png'

Base 'Socios' 'GESTIÓN · DATOS DE EJEMPLO' 'Socios' 'Listado y datos de contacto de los socios del gimnasio.'
Summary @('Total de socios', 'Activos', 'Inactivos') @('6', '4', '2')
$rows = @(
    @('Ana Pérez', '40123456', 'ana.perez@ejemplo.com', 'Plan Full', '05/10/2026', 'Activo'),
    @('Juan Gómez', '38987654', 'juan.gomez@ejemplo.com', 'Plan Básico', '12/09/2026', 'Activo'),
    @('Lucía Fernández', '42555111', 'lucia.fernandez@ejemplo.com', 'Plan Full', '20/08/2026', 'Activo'),
    @('Martín Rodríguez', '36777888', 'martin.rodriguez@ejemplo.com', 'Sin plan', '03/07/2026', 'Inactivo'),
    @('Sofía López', '44777123', 'sofia.lopez@ejemplo.com', 'Plan Básico', '14/10/2026', 'Activo'),
    @('Diego Martínez', '35999123', 'diego.martinez@ejemplo.com', 'Plan Full', '18/06/2026', 'Inactivo')
)
TablePanel 'Listado de socios' 'Mostrando 6 de 6 socios' 'Buscar socio' 'Nuevo socio' @('Socio', 'DNI', 'Contacto', 'Plan', 'Ingreso', 'Estado') @([float]190, [float]135, [float]300, [float]170, [float]165, [float]150) $rows
Save '02-socios.png'

Base 'Clases' 'GESTIÓN · DATOS DE EJEMPLO' 'Clases' 'Horarios semanales, instructores y cupos.'
Summary @('Clases semanales', 'Por la mañana', 'Por la tarde') @('6', '4', '2')
$rows = @(
    @('Funcional', 'Lucía Gómez', 'Lunes', '08:00', '12 lugares'),
    @('Yoga', 'Martina Díaz', 'Martes', '09:00', '10 lugares'),
    @('Spinning', 'Nicolás Ruiz', 'Miércoles', '18:00', '8 lugares'),
    @('Pilates', 'Carla López', 'Jueves', '17:00', '12 lugares'),
    @('Funcional', 'Lucía Gómez', 'Viernes', '08:00', '12 lugares'),
    @('Yoga', 'Martina Díaz', 'Sábado', '10:00', '10 lugares')
)
TablePanel 'Listado de clases' 'Mostrando 6 de 6 clases' 'Buscar clase' 'Nueva clase' @('Clase', 'Instructor', 'Día', 'Horario', 'Cupo') @([float]220, [float]270, [float]200, [float]190, [float]190) $rows
Save '03-clases.png'

Base 'Planes' 'GESTIÓN · DATOS DE EJEMPLO' 'Planes' 'Opciones y precios de los planes del gimnasio.'
Summary @('Planes disponibles', 'Precio desde', 'Precio hasta') @('3', '$20.000', '$35.000')
$rows = @(
    @('Plan Básico', '$20.000', 'Acceso al gimnasio y clases grupales'),
    @('Plan Plus', '$28.000', 'Clases grupales y seguimiento mensual'),
    @('Plan Full', '$35.000', 'Clases grupales y asesoramiento personalizado')
)
TablePanel 'Listado de planes' 'Mostrando 3 de 3 planes' 'Buscar plan' 'Nuevo plan' @('Plan', 'Precio', 'Beneficios') @([float]250, [float]170, [float]690) $rows
Save '04-planes.png'

Base 'Pagos' 'GESTIÓN · VISTA DE EJEMPLO' 'Pagos' 'Registro de pagos realizados por los socios.'
Summary @('Pagos registrados', 'Monto total', 'Transferencias') @('5', '$138.000', '2')
$rows = @(
    @('#1', 'Ana Pérez', '20/10/2026', 'Transferencia', '$35.000'),
    @('#2', 'Juan Gómez', '19/10/2026', 'Efectivo', '$20.000'),
    @('#3', 'Lucía Fernández', '18/10/2026', 'Tarjeta', '$35.000'),
    @('#4', 'Sofía López', '17/10/2026', 'Transferencia', '$20.000'),
    @('#5', 'Martín Rodríguez', '15/10/2026', 'Efectivo', '$28.000')
)
TablePanel 'Listado de pagos' 'Mostrando 5 de 5 pagos' 'Buscar pago' '' @('N.º', 'Socio', 'Fecha', 'Método', 'Monto') @([float]100, [float]290, [float]220, [float]260, [float]200) $rows
Save '05-pagos.png'

Write-Output "Mockups guardados en $outputDir"
