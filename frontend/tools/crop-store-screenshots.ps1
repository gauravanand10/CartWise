<#
    Crops raw emulator captures to Play Store's screenshot limit. Chapter 30.

    WHY THIS EXISTS

    Google Play rejects a screenshot whose longer side exceeds twice its shorter
    side (checked against Play Console's current documented limits while writing
    this: shortest side >= 320px, longest <= 3840px, ratio <= 2:1). The
    Pixel 6 AVD this chapter's on-device proof ran on captures at 1080x2400 —
    ratio 2.22:1 — which is NOT a hypothetical: every raw capture in
    mobile-proof/ is over the limit and would be bounced on upload. This script
    is the fix, not a note that one is needed.

    WHAT IT DOES

    Crops each source image to 1080x2160 (exactly 2:1, the maximum allowed),
    keeping the TOP of the frame and discarding the bottom. Top-anchored because
    every capture used for the store listing leads with the content that
    actually sells the app — the hero, the product photo, the results grid —
    and the status bar plus a little breathing room at the bottom is what a
    real device screenshot crops away regardless.

    USAGE

        powershell -ExecutionPolicy Bypass -File tools/crop-store-screenshots.ps1
#>

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$Root   = Split-Path -Parent $PSScriptRoot
$Source = Join-Path $Root "..\mobile-proof"
$Dest   = Join-Path $Root "play-store\screenshots"

if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Force -Path $Dest | Out-Null }

# name in mobile-proof/ -> name to publish under, in listing order.
$plan = @{
    "03-final-home.png"    = "01-home.png"
    "02-home-rails.png"    = "02-featured-product.png"
    "tmp-search-open.png"  = "03-search-results.png"
    "04-product-detail.png"= "04-product-detail.png"
}

foreach ($src in $plan.Keys) {
    $srcPath = Join-Path $Source $src
    if (-not (Test-Path $srcPath)) {
        Write-Warning "Missing source: $src"
        continue
    }

    $img = [System.Drawing.Image]::FromFile($srcPath)
    $targetHeight = [Math]::Min($img.Height, $img.Width * 2)
    $crop = New-Object System.Drawing.Rectangle(0, 0, $img.Width, $targetHeight)

    $bmp = New-Object System.Drawing.Bitmap($img.Width, $targetHeight)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $img.Width, $targetHeight)), $crop, [System.Drawing.GraphicsUnit]::Pixel)

    $destPath = Join-Path $Dest $plan[$src]
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $ratio = [Math]::Round($targetHeight / $img.Width, 3)
    "{0} -> {1}  ({2}x{3}, ratio {4})" -f $src, $plan[$src], $img.Width, $targetHeight, $ratio

    $g.Dispose(); $bmp.Dispose(); $img.Dispose()
}
