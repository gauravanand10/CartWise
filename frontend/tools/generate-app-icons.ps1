<#
    Generates every CartWise launcher/store icon from one definition. Chapter 30.

    WHY THIS SCRIPT EXISTS AT ALL

    `npx cap add android` ships Capacitor's stock placeholder launcher icons, and
    they were still in place when this chapter started: the emulator's app drawer
    showed a generic mark, not CartWise. Play rejects a submission whose icon is
    the framework default, and it should — it is not the app's identity.

    It is a generator rather than a folder of PNGs because there are 21 of them
    across five densities plus two store assets, they must agree exactly, and a
    hand-exported set drifts the moment one is regenerated at the wrong size.
    Changing the brand means changing $ColorFrom/$ColorTo here and re-running.

    WHY .NET System.Drawing RATHER THAN sharp/resvg

    Both would work and both pull a native binary down at install time. This
    needs to run on a machine that has no admin rights (see the project's
    constraints) and produce identical output years from now; GDI+ ships with
    Windows and has no version to resolve. The trade is that the mark is drawn
    in code below rather than imported from an SVG — acceptable for a four-point
    star, and it is the same star the in-app header draws.

    THE MARK

    A white four-point sparkle on a blue-to-violet diagonal gradient, matching
    `src/components/layout/navbar/Logo.tsx`, which renders lucide's `Sparkles`
    glyph inside a `from-blue-600 to-violet-600` rounded square. The app's icon
    and the app's header now show the same thing, which they did not before:
    the header was a sparkle and `public/favicon.svg` was an unrelated
    lightning bolt.

    The concave star is four cubic beziers, tip to tip, whose control points sit
    on the diagonal between each pair of tips. How far out they sit is the
    `$waist` parameter and it is the only thing that decides whether the mark
    survives being 48 pixels wide — see the note on it below.

    USAGE

        powershell -ExecutionPolicy Bypass -File tools/generate-app-icons.ps1

    Writes into android/app/src/main/res/mipmap-*/ , public/ , and
    play-store/ . Re-running overwrites; it is idempotent.
#>

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$Root      = Split-Path -Parent $PSScriptRoot
$ResDir    = Join-Path $Root "android/app/src/main/res"
$PublicDir = Join-Path $Root "public"
$StoreDir  = Join-Path $Root "play-store"

# blue-600 -> violet-600, the same pair the header's Tailwind gradient uses.
$ColorFrom = [System.Drawing.Color]::FromArgb(255, 37, 99, 235)
$ColorTo   = [System.Drawing.Color]::FromArgb(255, 124, 58, 237)

function New-Canvas([int]$w, [int]$h) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    return @($bmp, $g)
}

# A four-point sparkle centred on ($cx,$cy) with tip distance $r.
#
# Each side is one cubic bezier from tip to tip. Both of that curve's control
# points sit at the same spot on the 45-degree diagonal between the two tips,
# which is what bows the edge inward and makes the shape a star rather than a
# diamond. It is the whole shape, so it is worth naming rather than leaving as
# four magic curves.
function Get-SparklePath([single]$cx, [single]$cy, [single]$r, [single]$waist = 0.30) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath

    # Tips as eight named scalars rather than an array of pairs. The pair form
    # reads better and does not survive PowerShell: `@( @($cx, $cy - $r), ... )`
    # binds the nested literals in a way that reached AddBezier as Object[] and
    # failed with "[System.Object[]] does not contain a method named
    # 'op_Subtraction'". Eight floats are unambiguous.
    $topX    = $cx;      $topY    = $cy - $r
    $rightX  = $cx + $r; $rightY  = $cy
    $bottomX = $cx;      $bottomY = $cy + $r
    $leftX   = $cx - $r; $leftY   = $cy

    # $waist sets how far each petal's control point sits from the centre, along
    # the 45-degree bisector between the two tips it joins.
    #
    # At 0 both control points collapse onto the centre and the star is as
    # pinched as it can be. That was the first version, and at mdpi (48px) the
    # arms thinned to roughly a pixel and the icon read as a faint smudge —
    # checked by looking at the generated 48px PNG, which is the only size where
    # this actually matters. 0.30 keeps the shape unmistakably a sparkle while
    # leaving the arms thick enough to survive the smallest launcher.
    $k = [single]($waist * $r * 0.70710678)

    $p.AddBezier($topX,    $topY,    ($cx + $k), ($cy - $k), ($cx + $k), ($cy - $k), $rightX,  $rightY)
    $p.AddBezier($rightX,  $rightY,  ($cx + $k), ($cy + $k), ($cx + $k), ($cy + $k), $bottomX, $bottomY)
    $p.AddBezier($bottomX, $bottomY, ($cx - $k), ($cy + $k), ($cx - $k), ($cy + $k), $leftX,   $leftY)
    $p.AddBezier($leftX,   $leftY,   ($cx - $k), ($cy - $k), ($cx - $k), ($cy - $k), $topX,    $topY)

    $p.CloseFigure()
    return $p
}

# Draws the mark itself.
#
# $markScale sizes the main sparkle as a fraction of the canvas, $cornerFrac
# rounds the background plate (0.5 gives a circle), and $spread decides how far
# from the centre the two sparkles sit. A launcher icon wants all three generous;
# an adaptive foreground wants the last two pulled in, because the launcher masks
# it. See the note on $spread below.
function Draw-Mark($g, [int]$size, [single]$markScale, [bool]$withBackground, [single]$cornerFrac, [single]$spread = 1.0) {
    if ($withBackground) {
        $rect  = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
        $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            $rect, $ColorFrom, $ColorTo, 45.0)

        $radius = [single]($size * $cornerFrac)
        $path   = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d      = $radius * 2
        $path.AddArc(0, 0, $d, $d, 180, 90)
        $path.AddArc($size - $d, 0, $d, $d, 270, 90)
        $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
        $path.AddArc(0, $size - $d, $d, $d, 90, 90)
        $path.CloseFigure()

        $g.FillPath($brush, $path)
        $path.Dispose(); $brush.Dispose()
    }

    $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $c     = [single]($size / 2.0)

    # $spread pulls both sparkles toward the centre. It is 1.0 for a square
    # icon, whose corners are real estate, and lower for the adaptive foreground,
    # whose corners are not.
    #
    # Android masks an adaptive icon to the inner 66% and may parallax it, so
    # anything further than 0.33*size from the centre can be cropped. At spread
    # 1.0 the accent sparkle's centre sits ~0.30*size out with a radius of
    # ~0.076*size, putting its outer tip at ~0.38 — outside the circle. The
    # emulator's app drawer duly showed the accent with its top-right corner
    # sliced off, which is the kind of thing that is invisible in the source PNG
    # and obvious on a device.
    $mainX  = [single]($c * (1.0 - (1.0 - 0.92) * $spread))
    $mainY  = [single]($c * (1.0 + (1.08 - 1.0) * $spread))
    $smallX = [single]($c * (1.0 + (1.42 - 1.0) * $spread))
    $smallY = [single]($c * (1.0 - (1.0 - 0.56) * $spread))

    # Main sparkle, slightly below-left of centre so the small one has room.
    $main = Get-SparklePath $mainX $mainY ([single]($size * $markScale))
    $g.FillPath($white, $main)
    $main.Dispose()

    # Secondary sparkle, upper right. lucide's Sparkles has these accents and
    # without one the mark reads as a plain star rather than "sparkle".
    $small = Get-SparklePath $smallX $smallY ([single]($size * $markScale * 0.36))
    $g.FillPath($white, $small)
    $small.Dispose()

    $white.Dispose()
}

function Save-Icon([string]$path, [int]$size, [single]$markScale, [bool]$bg, [single]$cornerFrac, [single]$spread = 1.0) {
    $c = New-Canvas $size $size
    $bmp = $c[0]; $g = $c[1]
    Draw-Mark $g $size $markScale $bg $cornerFrac $spread
    $dir = Split-Path -Parent $path
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    "  {0}  ({1}x{1})" -f (Split-Path -Leaf $path), $size
}

Write-Host "Launcher icons (square + round + adaptive foreground)"

# ic_launcher / ic_launcher_round: 48dp baseline. The round variant is drawn
# with a full 50% corner radius rather than a separate shape — a rounded square
# at radius = size/2 IS a circle, so the two stay identical by construction.
#
# ic_launcher_foreground: 108dp, and the mark is deliberately small. Android
# masks an adaptive icon to the inner 72dp and may parallax it, so anything in
# the outer 18dp on each side can be cropped. The foreground therefore carries
# NO background — the adaptive-icon XML supplies that — and a smaller mark.
$densities = @(
    @{ Name = "mdpi";    Launcher = 48;  Foreground = 108 },
    @{ Name = "hdpi";    Launcher = 72;  Foreground = 162 },
    @{ Name = "xhdpi";   Launcher = 96;  Foreground = 216 },
    @{ Name = "xxhdpi";  Launcher = 144; Foreground = 324 },
    @{ Name = "xxxhdpi"; Launcher = 192; Foreground = 432 }
)

foreach ($d in $densities) {
    $dir = Join-Path $ResDir ("mipmap-" + $d.Name)
    Save-Icon (Join-Path $dir "ic_launcher.png")       $d.Launcher   0.32 $true  0.22
    Save-Icon (Join-Path $dir "ic_launcher_round.png") $d.Launcher   0.30 $true  0.50
    Save-Icon (Join-Path $dir "ic_launcher_foreground.png") $d.Foreground 0.19 $false 0.0 0.62
}

Write-Host "Play Store icon (512x512, required by the Console)"
Save-Icon (Join-Path $StoreDir "icon-512.png") 512 0.32 $true 0.22

Write-Host "Web favicon (matches the launcher icon)"
Save-Icon (Join-Path $PublicDir "favicon.png") 256 0.32 $true 0.22

# ...and the same mark as SVG, emitted from the SAME numbers rather than drawn
# by hand in a second place. A hand-written SVG beside a generated PNG is two
# definitions of one logo, and they drift on the first tweak — the waist change
# above would have had to be made twice, correctly, from memory.
function Get-SparkleSvgPath([double]$cx, [double]$cy, [double]$r, [double]$waist) {
    $k = $waist * $r * 0.70710678
    $f = { param($n) ([math]::Round($n, 2)).ToString([System.Globalization.CultureInfo]::InvariantCulture) }
    "M {0} {1} C {2} {3} {2} {3} {4} {5} C {2} {6} {2} {6} {0} {7} C {8} {6} {8} {6} {9} {5} C {8} {3} {8} {3} {0} {1} Z" -f `
        (& $f $cx), (& $f ($cy - $r)),
        (& $f ($cx + $k)), (& $f ($cy - $k)),
        (& $f ($cx + $r)), (& $f $cy),
        (& $f ($cy + $k)), (& $f ($cy + $r)),
        (& $f ($cx - $k)), (& $f ($cx - $r))
}

$svgSize   = 256.0
$svgScale  = 0.32
$svgWaist  = 0.30
$svgCentre = $svgSize / 2.0

$mainSvg  = Get-SparkleSvgPath ($svgCentre * 0.92) ($svgCentre * 1.08) ($svgSize * $svgScale) $svgWaist
$smallSvg = Get-SparkleSvgPath ($svgCentre * 1.42) ($svgCentre * 0.56) ($svgSize * $svgScale * 0.36) $svgWaist

$svg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <!--
    GENERATED by tools/generate-app-icons.ps1 - do not edit by hand.
    (ASCII only: Windows PowerShell 5.1 round-trips non-ASCII through this
    heredoc inconsistently, and a mojibaked comment in a shipped asset is a
    silly thing to debug later.)
    Re-run the script instead, so this stays identical to the Android launcher
    icon and the Play Store icon, which are drawn from the same numbers.
  -->
  <defs>
    <linearGradient id="cw" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2563eb"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56.32" ry="56.32" fill="url(#cw)"/>
  <path d="$mainSvg" fill="#ffffff"/>
  <path d="$smallSvg" fill="#ffffff"/>
</svg>
"@

Set-Content -Path (Join-Path $PublicDir "favicon.svg") -Value $svg -Encoding utf8
Write-Host "  favicon.svg  (256x256, vector)"

Write-Host "Feature graphic (1024x500, required by the Console)"
$c = New-Canvas 1024 500
$bmp = $c[0]; $g = $c[1]

$rect  = New-Object System.Drawing.RectangleF(0, 0, 1024, 500)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $ColorFrom, $ColorTo, 25.0)
$g.FillRectangle($brush, $rect)
$brush.Dispose()

# The mark, left of the wordmark.
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$mark  = Get-SparklePath 150.0 250.0 88.0
$g.FillPath($white, $mark); $mark.Dispose()
$accent = Get-SparklePath 236.0 168.0 32.0
$g.FillPath($white, $accent); $accent.Dispose()

# Wordmark and strapline. The strapline is the app's real one — the same line
# the header shows — not marketing written for the graphic.
$titleFont = New-Object System.Drawing.Font("Segoe UI", 74, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$subFont   = New-Object System.Drawing.Font("Segoe UI", 34, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.DrawString("CartWise", $titleFont, $white, 320, 186)
$faint = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(225, 255, 255, 255))
$g.DrawString("Compare before you buy", $subFont, $faint, 326, 282)

$titleFont.Dispose(); $subFont.Dispose(); $white.Dispose(); $faint.Dispose()

if (-not (Test-Path $StoreDir)) { New-Item -ItemType Directory -Force -Path $StoreDir | Out-Null }
$bmp.Save((Join-Path $StoreDir "feature-graphic-1024x500.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "  feature-graphic-1024x500.png  (1024x500)"

Write-Host ""
Write-Host "Done."
