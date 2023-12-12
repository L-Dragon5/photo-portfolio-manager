<?php

namespace App;

use Illuminate\Support\Collection;
use Spatie\MediaLibrary\ResponsiveImages\WidthCalculator\WidthCalculator;
use Spatie\MediaLibrary\Support\ImageFactory;

class PhotoWidthCalculator implements WidthCalculator
{
    public function calculateWidthsFromFile(string $imagePath): Collection
    {
        $image = ImageFactory::load($imagePath);

        $width = $image->getWidth();
        $height = $image->getHeight();
        $fileSize = filesize($imagePath);

        return $this->calculateWidths($fileSize, $width, $height);
    }

    public function calculateWidths(int $fileSize, int $width, int $height): Collection
    {
        return collect([
            300,
            600,
            1280,
            1920,
        ]);
    }
}
